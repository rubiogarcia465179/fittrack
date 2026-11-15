// FitTrack — capturas reales del build web (expo export) en Chrome headless
// vía DevTools Protocol. Sin dependencias (Node ≥ 22: fetch + WebSocket).
// Uso (Windows, Node ≥ 22 + Chrome): node app/qa/shots/shoot.js <distDir> <outDir> [--frames <dir>]
// distDir = salida de `npx expo export --platform web` (p. ej. \wsl.localhostBUNTU-24.04	MPT-DIST).
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const [DIST, OUT] = process.argv.slice(2);
const FRAMES = process.argv.includes('--frames') ? process.argv[process.argv.indexOf('--frames') + 1] : null;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 8095, DBG = 9333, W = 393, H = 852;
fs.mkdirSync(OUT, { recursive: true });
if (FRAMES) fs.mkdirSync(FRAMES, { recursive: true });

// ---------- servidor estático (SPA) ----------
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.ttf': 'font/ttf', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  let f = path.join(DIST, p);
  if (!f.startsWith(path.resolve(DIST)) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(DIST, 'index.html');
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(PORT, '127.0.0.1');

// ---------- datos de ejemplo ----------
const iso = (d) => { const t = new Date(); t.setDate(t.getDate() + d); return t.toISOString().slice(0, 10); };
const set = (reps, kg, done) => ({ reps, weight_kg: kg, ...(done !== undefined ? { done } : {}) });
const SESSIONS = [
  { id: 's1', date: iso(-1), type: 'training', exercises: [{ exercise_id: 'bench_press_narrow_grip', sets: [set(10, 40), set(10, 40), set(8, 45)] }, { exercise_id: 'biceps_curls_with_dumbbell', sets: [set(12, 12), set(12, 12), set(10, 14)] }], notes: '', duration_min: 50, body_weight_kg: 78.4, created_at: iso(-1) + 'T18:00:00Z' },
  { id: 's2', date: iso(-3), type: 'training', exercises: [{ exercise_id: 'hammercurls', sets: [set(12, 10), set(12, 10)] }, { exercise_id: 'close_grip_bench_press', sets: [set(8, 50), set(8, 50), set(6, 55)] }], notes: '', duration_min: 45, body_weight_kg: 78.9, created_at: iso(-3) + 'T18:00:00Z' },
  { id: 's3', date: iso(-9), type: 'training', exercises: [{ exercise_id: 'preacher_curls', sets: [set(10, 20), set(10, 20), set(10, 20)] }], notes: '', duration_min: 30, created_at: iso(-9) + 'T18:00:00Z' },
  { id: 's4', date: iso(-16), type: 'training', exercises: [{ exercise_id: 'bench_press_narrow_grip', sets: [set(10, 35), set(10, 35), set(10, 35)] }], notes: '', created_at: iso(-16) + 'T18:00:00Z' },
];
const DATA = { sessions: SESSIONS, profile: { benchmarks: [{ exercise_id: 'close_grip_bench_press', estimated_1rm: 68, weight_kg: 55, reps: 6, date: iso(-3) }], experience: 'intermediate', intensity: 'moderate', height_entries: [{ date: iso(-20), value: 178 }] } };
const ACTIVE = {
  id: 'a1', started_at: Date.now() - 14 * 60 * 1000, paused: false, paused_total_ms: 0, type: 'training', equipment_mode: 'full_gym', date: iso(0),
  draft: [
    { exercise_id: 'close_grip_bench_press', sets: [set(8, 50, true), set(8, 50), set(8, 50), set(8, 50)], equipment_status: 'available' },
    { exercise_id: 'biceps_curls_with_dumbbell', sets: [set(12, 12), set(12, 12), set(12, 12)], equipment_status: 'available' },
    { exercise_id: 'hammercurls', sets: [set(12, 10), set(12, 10), set(12, 10)], equipment_status: 'available' },
  ],
  postponed: [], benchmarks: [],
};

// ---------- CDP mínimo ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, seq = 0; const pending = new Map(); const listeners = [];
function send(method, params = {}) {
  const id = ++seq; ws.send(JSON.stringify({ id, method, params }));
  return new Promise((res, rej) => pending.set(id, { res, rej }));
}
async function evaluate(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error('eval: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
  return r.result.value;
}
async function shot(name) {
  await sleep(500);
  const r = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(r.data, 'base64'));
  console.log('shot', name);
}
/** Toca el elemento visible cuyo texto coincide exactamente (o empieza por). */
async function tap(text, { prefix = false, nth = 0 } = {}) {
  const box = await evaluate(`(() => {
    const want = ${JSON.stringify(text)};
    const match = [...document.querySelectorAll('div,span,button,a')].filter((e) => {
      const t = (e.innerText || '').trim();
      if (!(${prefix} ? t.startsWith(want) : t === want)) return false;
      const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0;
    });
    // "Visible" = dentro del viewport Y es lo que recibe el clic en su centro
    // (no tapado por la barra flotante ni por barras fijas).
    const inView = (e) => {
      const r = e.getBoundingClientRect();
      if (r.top < 0 || r.bottom > innerHeight + 2) return false;
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!hit && (e.contains(hit) || hit.contains(e));
    };
    // el más interno (sin hijos que también coincidan); primero los visibles
    const leafOf = (els) => els.filter((e) => !els.some((o) => o !== e && e.contains(o)));
    const visible = leafOf(match.filter(inView));
    let e = visible[${nth}];
    if (!e) { e = leafOf(match)[${nth}]; if (!e) return null; e.scrollIntoView({ block: 'center' }); }
    const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);
  if (!box) throw new Error('no encontrado: ' + text);
  await sleep(150);
  for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: box.x, y: box.y, button: 'left', clickCount: 1 });
  await sleep(450);
}
/** Toca el elemento visible cuyo aria-label empieza por `label` (pestañas sin texto, iconos). */
async function tapLabel(label, { nth = 0 } = {}) {
  const box = await evaluate(`(() => {
    const want = ${JSON.stringify(label)};
    const els = [...document.querySelectorAll('[aria-label]')].filter((e) => {
      if (!(e.getAttribute('aria-label') || '').startsWith(want)) return false;
      const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= innerHeight + 2;
    });
    const e = els[${nth}]; if (!e) return null;
    const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);
  if (!box) throw new Error('aria-label no encontrado: ' + label);
  for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: box.x, y: box.y, button: 'left', clickCount: 1 });
  await sleep(450);
}
/** Arrastre real (ratón) desde el centro del elemento con ese aria-label:
 *  sirve para girar el cuerpo 3D (dx = girar, dy = inclinar). */
async function drag(label, dx, dy = 0, steps = 14) {
  const box = await evaluate(`(() => {
    const e = [...document.querySelectorAll('[aria-label]')].find((x) => (x.getAttribute('aria-label') || '').startsWith(${JSON.stringify(label)}));
    if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);
  if (!box) throw new Error('aria-label no encontrado: ' + label);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: box.x, y: box.y, button: 'left', buttons: 1, clickCount: 1 });
  for (let i = 1; i <= steps; i++) {
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: box.x + (dx * i) / steps, y: box.y + (dy * i) / steps, button: 'left', buttons: 1 });
    await sleep(16);
  }
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: box.x + dx, y: box.y + dy, button: 'left', buttons: 0, clickCount: 1 });
  await sleep(300);
}
async function scrollBy(dy) {
  await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: W / 2, y: H / 2, deltaX: 0, deltaY: dy });
  await sleep(500);
}
async function load(storage) {
  await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });
  await sleep(800);
  await evaluate(`localStorage.clear(); ${Object.entries(storage).map(([k, v]) => `localStorage.setItem(${JSON.stringify(k)}, ${JSON.stringify(typeof v === 'string' ? v : JSON.stringify(v))});`).join(' ')} true`);
  await send('Page.reload', {});
  await sleep(2600);
}

(async () => {
  const prof = path.join(require('os').tmpdir(), 'fittrack-chrome-' + Date.now());
  const chrome = spawn(CHROME, ['--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', `--remote-debugging-port=${DBG}`, `--user-data-dir=${prof}`, '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' });
  let target;
  for (let i = 0; i < 40 && !target; i++) {
    try { target = (await (await fetch(`http://127.0.0.1:${DBG}/json/list`)).json()).find((t) => t.type === 'page'); } catch {} if (!target) await sleep(250);
  }
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pending.has(d.id)) { const p = pending.get(d.id); pending.delete(d.id); d.error ? p.rej(new Error(d.error.message)) : p.res(d.result); }
    else if (d.method) listeners.forEach((l) => l(d));
  };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 2, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: false });
  const errors = [];
  listeners.push((d) => { if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.text + ' ' + (d.params.exceptionDetails.exception?.description || '').slice(0, 200)); });

  if (FRAMES) {
    let n = 0;
    listeners.push(async (d) => {
      if (d.method !== 'Page.screencastFrame') return;
      fs.writeFileSync(path.join(FRAMES, String(Date.now()).padStart(15, '0') + '.jpg'), Buffer.from(d.params.data, 'base64'));
      n++; send('Page.screencastFrameAck', { sessionId: d.params.sessionId });
    });
    await send('Page.startScreencast', { format: 'jpeg', quality: 85, maxWidth: W * 2, maxHeight: H * 2, everyNthFrame: 1 });
  }

  const base = { 'fittrack.lang': 'es' };
  const scenario = require(process.env.SCENARIO || path.join(__dirname, 'scenario.js'));
  await scenario({ load, shot, tap, tapLabel, drag, scrollBy, evaluate, sleep, base, DATA, ACTIVE, iso });

  if (FRAMES) await send('Page.stopScreencast');
  console.log('errors', errors.length ? errors : 'none');
  ws.close(); chrome.kill(); server.close();
  setTimeout(() => { try { fs.rmSync(prof, { recursive: true, force: true }); } catch {} process.exit(0); }, 500);
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
