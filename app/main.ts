// KCD live map desktop app.
//
// A single Deno executable that serves the built map (embedded at compile
// time from dist-app/) and the live player position, which it reads by
// tailing kcd.log for [LIVEMAP] lines written by the LiveMapTracker game mod
// (see live/README.md). Replaces live/bridge.ps1 for packaged use.
//
// Compiled with --no-terminal (GUI subsystem): there is no console, so all
// diagnostics go to %LOCALAPPDATA%\kcd-live-map.log, stdio writes are
// guarded, and spawned children get explicit null stdio (inheriting the
// nonexistent console handles kills the process silently).
//
// Flags:
//   --port=8765   listen port
//   --kcd=PATH    KCD install dir (or KCD_PATH env); default Steam location
//   --no-open     don't open a browser window on startup

const args = new Map<string, string>(
  Deno.args.map((a) => {
    const [k, v] = a.split('=', 2);
    return [k, v ?? ''];
  }),
);

const PORT = Number(args.get('--port') || 8765);
const KCD_ROOT = args.get('--kcd') || Deno.env.get('KCD_PATH') ||
  'C:\\Program Files (x86)\\Steam\\steamapps\\common\\KingdomComeDeliverance';
const LOG_PATH = `${KCD_ROOT}\\kcd.log`;
const STATIC_ROOT = new URL('../dist-app/', import.meta.url);
// 127.0.0.1, not localhost: the server binds IPv4 only, while localhost
// resolves to ::1 first on Windows and Edge's IPv4 fallback is unreliable
// on a fresh profile (page failed to load on first launch after rebuild).
const APP_URL = `http://127.0.0.1:${PORT}/`;
const LOCAL_APP_DATA = Deno.env.get('LOCALAPPDATA') ?? '.';
const APP_LOG = `${LOCAL_APP_DATA}\\kcd-live-map.log`;

function log(msg: string) {
  const line = `${new Date().toISOString()} ${msg}`;
  try {
    Deno.writeTextFileSync(APP_LOG, line + '\n', { append: true });
  } catch { /* log file unavailable */ }
  try {
    console.log(line);
  } catch { /* no stdout under --no-terminal */ }
}

try {
  Deno.writeTextFileSync(APP_LOG, ''); // fresh log each run
} catch { /* ignore */ }

globalThis.addEventListener('unhandledrejection', (e) => {
  log(`unhandled rejection: ${e.reason}`);
  e.preventDefault();
});
globalThis.addEventListener('error', (e) => {
  log(`uncaught error: ${e.message}`);
  e.preventDefault();
});

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
};

// --- kcd.log tailer (same protocol as live/bridge.ps1) ---

const LINE_RE = /\[LIVEMAP\]\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)/g;

let logOffset = 0;
let lastPos: Record<string, number> | null = null;

async function refreshPosition(): Promise<void> {
  let stat: Deno.FileInfo;
  try {
    stat = await Deno.stat(LOG_PATH);
  } catch {
    return; // log missing: game never ran or wrong path
  }
  const size = Number(stat.size);
  if (size < logOffset) logOffset = 0; // log recreated on game launch
  if (size === logOffset) return;

  const f = await Deno.open(LOG_PATH, { read: true });
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

// --- static file serving from the embedded dist-app/ ---

// The site is built with base /kcd-map/ (the legacy CSS hardcodes asset
// paths under it), so serve the app under that prefix too.
const BASE_PREFIX = '/kcd-map';

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

// --- browser window ---

async function openWindow(): Promise<Deno.ChildProcess | null> {
  const edgePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  for (const edge of edgePaths) {
    try {
      await Deno.stat(edge);
    } catch {
      continue;
    }
    // Dedicated profile: guarantees our own Edge process (so its exit means
    // the window was closed) and keeps window placement separate.
    const profile = `${LOCAL_APP_DATA}\\kcd-live-map\\edge-profile`;
    const child = new Deno.Command(edge, {
      args: [
        `--app=${APP_URL}`,
        '--start-maximized',
        `--user-data-dir=${profile}`,
        '--no-first-run',
        '--no-default-browser-check',
      ],
      stdin: 'null',
      stdout: 'null',
      stderr: 'null',
    }).spawn();
    log(`opened Edge app window (pid ${child.pid})`);
    return child;
  }
  new Deno.Command('cmd', {
    args: ['/c', 'start', '', APP_URL],
    stdin: 'null',
    stdout: 'null',
    stderr: 'null',
  }).spawn();
  log('Edge not found; opened default browser (server runs until killed)');
  return null;
}

// --- main ---

log(`starting: port=${PORT} kcd=${KCD_ROOT}`);

let server: Deno.HttpServer | null = null;
try {
  server = Deno.serve({
    hostname: '127.0.0.1', // loopback only; nothing to offer the LAN
    port: PORT,
    onListen: () => log(`serving ${APP_URL} (tailing ${LOG_PATH})`),
  }, async (req) => {
    const { pathname, origin } = new URL(req.url);
    if (pathname === '/position') {
      try {
        await refreshPosition();
      } catch (err) {
        log(`tail error: ${err}`); // keep serving the last known position
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
  if (err instanceof Deno.errors.AddrInUse) {
    // Another instance already serving? Then just open a window on it.
    const ours = await fetch(`${APP_URL}kcd-map/`, { signal: AbortSignal.timeout(2000) })
      .then((r) => r.ok).catch(() => false);
    if (ours && !args.has('--no-open')) {
      log(`port ${PORT} already served by another instance; opening window only`);
      await openWindow();
      Deno.exit(0);
    }
    log(`port ${PORT} is in use by another program (old bridge.ps1?); exiting`);
    Deno.exit(1);
  }
  log(`failed to start server: ${err}`);
  Deno.exit(1);
}

if (!args.has('--no-open')) {
  const child = await openWindow();
  if (child) {
    // Shut down when the map window is closed.
    child.status.then((s) => {
      log(`window closed (code ${s.code}); shutting down`);
      server?.shutdown();
      Deno.exit(0);
    });
  }
}
