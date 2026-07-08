// HTTP server + kcd.log tailer, run in a worker so the main thread is free
// to own the webview window's blocking message loop (see main.ts).
//
// Receives { port, logPath } once via postMessage; replies with
// { type: 'ready' } when listening, { type: 'fatal', error } on bind failure
// ('addrinuse' when the port is taken), and { type: 'log', msg } for logging.

/// <reference lib="webworker" />

const MIME: Record<string, string> = {
  html: 'text/html; charset=utf-8',
  js: 'text/javascript',
  css: 'text/css',
  json: 'application/json',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  ico: 'image/x-icon',
  ttf: 'font/ttf',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ogg: 'audio/ogg',
  webmanifest: 'application/manifest+json',
};

const STATIC_ROOT = new URL('../dist-app/', import.meta.url);

// The site is built with base /kcd-map/ (the legacy CSS hardcodes asset
// paths under it), so serve the app under that prefix too.
const BASE_PREFIX = '/kcd-map';

const LINE_RE = /\[LIVEMAP\]\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)/g;

let logPath = '';
let logOffset = 0;
let lastPos: Record<string, number> | null = null;

function post(msg: Record<string, unknown>) {
  (self as unknown as Worker).postMessage(msg);
}

async function refreshPosition(): Promise<void> {
  let stat: Deno.FileInfo;
  try {
    stat = await Deno.stat(logPath);
  } catch {
    return; // log missing: game never ran or wrong path
  }
  const size = Number(stat.size);
  if (size < logOffset) logOffset = 0; // log recreated on game launch
  if (size === logOffset) return;

  const f = await Deno.open(logPath, { read: true });
  try {
    await f.seek(logOffset, Deno.SeekMode.Start);
    const buf = new Uint8Array(size - logOffset);
    let n = 0;
    while (n < buf.length) {
      const r = await f.read(buf.subarray(n));
      if (r === null) break;
      n += r;
    }
    logOffset += n;
    const text = new TextDecoder().decode(buf.subarray(0, n));
    let m: RegExpExecArray | null;
    let last: RegExpExecArray | null = null;
    while ((m = LINE_RE.exec(text)) !== null) last = m;
    if (last) {
      lastPos = {
        x: Number(last[1]),
        y: Number(last[2]),
        z: Number(last[3]),
        dx: Number(last[4]),
        dy: Number(last[5]),
        t: Math.floor(Date.now() / 1000),
      };
    }
  } finally {
    f.close();
  }
}

async function serveStatic(pathname: string, origin: string): Promise<Response> {
  let rel = decodeURIComponent(pathname);
  if (rel === '/' || rel === '') {
    return Response.redirect(`${origin}${BASE_PREFIX}/`, 302);
  }
  if (rel.startsWith(BASE_PREFIX)) rel = rel.slice(BASE_PREFIX.length);
  rel = rel.replace(/^\/+/, '');
  if (rel === '') rel = 'index.html';
  if (rel.includes('..')) return new Response('forbidden', { status: 403 });
  let url = new URL(rel, STATIC_ROOT);
  let body: Uint8Array;
  try {
    body = await Deno.readFile(url);
  } catch {
    // SPA fallback for extensionless paths
    if (!/\.[a-z0-9]+$/i.test(rel)) {
      url = new URL('index.html', STATIC_ROOT);
      try {
        body = await Deno.readFile(url);
      } catch {
        return new Response('not found', { status: 404 });
      }
    } else {
      return new Response('not found', { status: 404 });
    }
  }
  const ext = url.pathname.split('.').pop()?.toLowerCase() ?? '';
  return new Response(body as BodyInit, {
    headers: { 'content-type': MIME[ext] ?? 'application/octet-stream' },
  });
}

self.onmessage = (e: MessageEvent) => {
  const { port, logPath: lp } = e.data as { port: number; logPath: string };
  logPath = lp;
  try {
    Deno.serve({
      hostname: '127.0.0.1', // loopback only; nothing to offer the LAN
      port,
      onListen: () => post({ type: 'ready' }),
    }, async (req) => {
      const { pathname, origin } = new URL(req.url);
      if (pathname === '/position') {
        try {
          await refreshPosition();
        } catch (err) {
          post({ type: 'log', msg: `tail error: ${err}` });
        }
        return new Response(JSON.stringify(lastPos ?? {}), {
          headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
          },
        });
      }
      return serveStatic(pathname, origin);
    });
  } catch (err) {
    const addrInUse = err instanceof Deno.errors.AddrInUse;
    post({ type: 'fatal', error: addrInUse ? 'addrinuse' : String(err) });
  }
};
