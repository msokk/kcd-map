// KCD live map desktop app.
//
// A single Deno executable that serves the built map (embedded at compile
// time from dist-app/) and the live player position from kcd.log — see
// app/server_worker.ts, which runs the server on a worker thread. The main
// thread owns a native WebView2 window (@webview/webview): same Chromium
// engine as Edge but without the browser shell (no profile, no extensions,
// no efficiency-mode throttling), and the taskbar shows this exe's icon.
// Falls back to an Edge app window if the webview library is unavailable.
//
// Compiled with --no-terminal (GUI subsystem): there is no console, so all
// diagnostics go to %LOCALAPPDATA%\kcd-live-map.log, stdio writes are
// guarded, and spawned children get explicit null stdio.
//
// Flags:
//   --port=8765   listen port
//   --kcd=PATH    KCD install dir (or KCD_PATH env); default Steam location
//   --no-open     don't open a window on startup

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
// 127.0.0.1, not localhost: the server binds IPv4 only, while localhost
// resolves to ::1 first on Windows and Chromium's IPv4 fallback is
// unreliable on a fresh profile.
const APP_URL = `http://127.0.0.1:${PORT}/`;
const LOCAL_APP_DATA = Deno.env.get('LOCALAPPDATA') ?? '.';
const APP_LOG = `${LOCAL_APP_DATA}\\kcd-live-map.log`;
const WINDOW_TITLE = 'Kingdom Come: Deliverance Map';

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

// --- server worker ---

function startServer(): Promise<'ready' | 'addrinuse'> {
  const worker = new Worker(new URL('./server_worker.ts', import.meta.url), {
    type: 'module',
  });
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('server start timed out')), 10000);
    worker.onmessage = (e) => {
      const msg = e.data as { type: string; msg?: string; error?: string };
      if (msg.type === 'log') {
        log(`[server] ${msg.msg}`);
      } else if (msg.type === 'ready') {
        clearTimeout(timeout);
        resolve('ready');
      } else if (msg.type === 'fatal') {
        clearTimeout(timeout);
        if (msg.error === 'addrinuse') resolve('addrinuse');
        else reject(new Error(msg.error));
      }
    };
    worker.onerror = (e) => {
      clearTimeout(timeout);
      reject(new Error(e.message));
    };
    worker.postMessage({ port: PORT, logPath: LOG_PATH });
  });
}

// --- native window (WebView2), with Edge app-mode fallback ---

function maximizeAndBrandWindow(hwnd: Deno.PointerValue) {
  try {
    const user32 = Deno.dlopen('user32.dll', {
      ShowWindow: { parameters: ['pointer', 'i32'], result: 'i32' },
      SendMessageW: { parameters: ['pointer', 'u32', 'usize', 'isize'], result: 'isize' },
    });
    const shell32 = Deno.dlopen('shell32.dll', {
      ExtractIconW: { parameters: ['pointer', 'buffer', 'u32'], result: 'pointer' },
    });
    user32.symbols.ShowWindow(hwnd, 3); // SW_MAXIMIZE
    // UTF-16LE encode the exe path for ExtractIconW
    const path = Deno.execPath();
    const utf16 = new Uint8Array((path.length + 1) * 2);
    for (let i = 0; i < path.length; i++) {
      const code = path.charCodeAt(i);
      utf16[i * 2] = code & 0xff;
      utf16[i * 2 + 1] = code >> 8;
    }
    const hIcon = shell32.symbols.ExtractIconW(null, utf16, 0);
    if (hIcon) {
      const WM_SETICON = 0x0080;
      const iconVal = BigInt(Deno.UnsafePointer.value(hIcon));
      user32.symbols.SendMessageW(hwnd, WM_SETICON, 1n, iconVal); // ICON_BIG
      user32.symbols.SendMessageW(hwnd, WM_SETICON, 0n, iconVal); // ICON_SMALL
    }
  } catch (err) {
    log(`window branding failed (cosmetic): ${err}`);
  }
}

async function openWebviewWindow(): Promise<boolean> {
  try {
    const { Webview, SizeHint } = await import('@webview/webview');
    const wv = new Webview(false, { width: 1600, height: 900, hint: SizeHint.NONE });
    wv.title = WINDOW_TITLE;
    wv.navigate(APP_URL);
    maximizeAndBrandWindow(wv.unsafeWindowHandle);
    log('opened native WebView2 window');
    wv.run(); // blocks until the window is closed
    log('window closed; shutting down');
    return true;
  } catch (err) {
    log(`webview unavailable (${err}); falling back to Edge app window`);
    return false;
  }
}

async function openEdgeFallback(): Promise<void> {
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
    const s = await child.status;
    log(`window closed (code ${s.code}); shutting down`);
    return;
  }
  new Deno.Command('cmd', {
    args: ['/c', 'start', '', APP_URL],
    stdin: 'null',
    stdout: 'null',
    stderr: 'null',
  }).spawn();
  log('Edge not found; opened default browser (server runs until killed)');
  await new Promise(() => {}); // keep serving forever
}

// --- main ---

log(`starting: port=${PORT} kcd=${KCD_ROOT}`);

let serverState: 'ready' | 'addrinuse';
try {
  serverState = await startServer();
} catch (err) {
  log(`failed to start server: ${err}`);
  Deno.exit(1);
}

if (serverState === 'addrinuse') {
  // Another instance already serving? Then just open a window on it.
  const ours = await fetch(`${APP_URL}kcd-map/`, { signal: AbortSignal.timeout(2000) })
    .then((r) => r.ok).catch(() => false);
  if (!ours) {
    log(`port ${PORT} is in use by another program (old bridge.ps1?); exiting`);
    Deno.exit(1);
  }
  log(`port ${PORT} already served by another instance; opening window only`);
}

log(`serving ${APP_URL} (tailing ${LOG_PATH})`);

if (args.has('--no-open')) {
  if (serverState === 'addrinuse') Deno.exit(0);
  // headless: the worker's listener keeps the process alive
} else {
  const shown = await openWebviewWindow();
  if (!shown) await openEdgeFallback();
  Deno.exit(0);
}
