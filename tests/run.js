#!/usr/bin/env node
/** FitTrack — QA (Fase 5): integridad de datos + lógica + i18n + typecheck.
 *
 *  Salidas: 0 fallos. Secciones:
 *   1. data       — all.json (61 ejercicios, campos, enums) + imágenes en las
 *                   3 ubicaciones + copias sincronizadas + mapa de assets.
 *   2. i18n       — 4 bundles (nl/es/en/fr), mismo nº de claves, valores
 *                   no vacíos; espejos app/ y web/ idénticos a i18n/.
 *   3. logic      — vectores de prueba sobre web/src/lib/gym.js (ESM).
 *   4. parity     — app/src/lib/gym.ts (transpilado) produce idénticos
 *                   resultados que la lógica de la web con las mismas entradas.
 *   5. typecheck  — tsc --noEmit en app/ (0 errores).
 *
 *  Uso:  node tests/run.js
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
let failures = 0;
let checks = 0;

function ok(cond, msg) {
  checks += 1;
  if (cond) {
    console.log('  ok  ' + msg);
  } else {
    failures += 1;
    console.error('FAIL  ' + msg);
  }
}
function eq(a, b, msg) {
  ok(
    JSON.stringify(a) === JSON.stringify(b),
    msg + (JSON.stringify(a) === JSON.stringify(b) ? '' : ` — esperado ${JSON.stringify(b)}, recibido ${JSON.stringify(a)}`),
  );
}
function section(t) {
  console.log('\n== ' + t + ' ==');
}

// ------------------------------------------------------------------ carga
const ALL = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/exercises/all.json'), 'utf8'));
const groups = new Set(ALL.groups);
const equipment = new Set(ALL.equipment);
const levels = new Set(ALL.levels);
const IMG = path.join(ROOT, 'data/images');
const WEB_IMG = path.join(ROOT, 'web/public/images/exercises');
const APP_IMG = path.join(ROOT, 'app/assets/exercises');
const APP_MAP = fs.readFileSync(path.join(ROOT, 'app/src/images.ts'), 'utf8');
const APP_DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'app/src/data/exercises.json'), 'utf8'));
const WEB_DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'web/src/data/exercises.json'), 'utf8'));

// ------------------------------------------------- 1. integridad de datos
section('data — base de ejercicios');
eq(ALL.count, 61, 'count declarado');
eq(ALL.exercises.length, 61, '61 ejercicios');
eq(ALL.source, 'seed', 'source=seed');

const ids = ALL.exercises.map((e) => e.id);
eq(new Set(ids).size, 61, 'ids únicos');
const badIds = ids.filter((i) => !/^[a-z0-9_]+$/.test(i));
eq(badIds, [], 'ids en slug válido');

let missingFields = [];
let badEnum = [];
for (const e of ALL.exercises) {
  for (const f of ['id', 'name_en', 'name_nl', 'muscle_group', 'equipment', 'level', 'aliases', 'instructions', 'image', 'source']) {
    if (e[f] === undefined) missingFields.push(e.id + ':' + f);
  }
  // strings: no vacíos; arrays: aliases puede estar vacío, instructions no.
  for (const f of ['id', 'name_en', 'name_nl', 'muscle_group', 'equipment', 'level', 'image', 'source']) {
    if (typeof e[f] !== 'string' || !e[f].trim()) missingFields.push(e.id + ':' + f);
  }
  if (!Array.isArray(e.aliases)) missingFields.push(e.id + ':aliases');
  if (!Array.isArray(e.instructions) || e.instructions.length === 0 || !e.instructions.every((s) => typeof s === 'string' && s.trim())) {
    missingFields.push(e.id + ':instructions');
  }
  if (!groups.has(e.muscle_group)) badEnum.push(e.id + ':muscle_group=' + e.muscle_group);
  if (!equipment.has(e.equipment)) badEnum.push(e.id + ':equipment=' + e.equipment);
  if (!levels.has(e.level)) badEnum.push(e.id + ':level=' + e.level);
}
eq(missingFields, [], 'todos los campos presentes y no vacíos');
eq(badEnum, [], 'enums (grupo/equipo/nivel/instrucciones) válidos');

const byId = new Map(ALL.exercises.map((e) => [e.id, e]));
let wrongImage = [];
let missingFiles = [];
for (const e of ALL.exercises) {
  const expect = '/images/exercises/' + e.id + '.png';
  if (e.image !== expect) wrongImage.push(e.id);
  for (const dir of [IMG, WEB_IMG, APP_IMG]) {
    if (!fs.existsSync(path.join(dir, e.id + '.png'))) missingFiles.push(path.relative(ROOT, dir) + '/' + e.id + '.png');
  }
}
eq(wrongImage, [], 'rutas de imagen consistentes (/images/exercises/<id>.png)');
eq(missingFiles, [], '61 PNG en data/, web/public/ y app/assets/');
eq(fs.readdirSync(IMG).filter((f) => f.endsWith('.png')).length, 61, 'solo 61 PNG en data/images');

eq(APP_DATA, ALL, 'app/src/data/exercises.json sincronizado con all.json');
eq(WEB_DATA, ALL, 'web/src/data/exercises.json sincronizado con all.json');

const mapIds = [...APP_MAP.matchAll(/'([a-z0-9_]+)':\s*require\('\.\.\/assets\/exercises\/([a-z0-9_]+)\.png'\)/g)].map((m) => m[1]);
eq(mapIds.length, 61, 'mapa de assets: 61 requires');
eq(new Set(mapIds).size, 61, 'mapa de assets: sin duplicados');
eq(ids.slice().sort().join(','), mapIds.slice().sort().join(','), 'mapa de assets cubre los 61 ids');

// ------------------------------------------------------------------ i18n
section('i18n — 4 bundles, paridad de claves');
const LANGS = ['nl', 'es', 'en', 'fr'];
const bundles = {};
for (const l of LANGS) {
  const p = path.join(ROOT, 'i18n', l + '.json');
  ok(fs.existsSync(p), 'bundle ' + l + '.json existe');
  bundles[l] = JSON.parse(fs.readFileSync(p, 'utf8'));
}
const enKeys = Object.keys(bundles.en).sort();
ok(enKeys.length >= 60, 'en.json tiene ' + enKeys.length + ' claves (>=60)');
for (const l of LANGS) {
  eq(Object.keys(bundles[l]).sort(), enKeys, 'bundle ' + l + ': mismas claves que en');
  const empty = Object.entries(bundles[l]).filter(([, v]) => typeof v !== 'string' || !v.trim());
  eq(empty.map(([k]) => k), [], 'bundle ' + l + ': sin valores vacíos');
}
for (const l of LANGS) {
  const appCopy = JSON.parse(fs.readFileSync(path.join(ROOT, 'app/src/i18n-data', l + '.json'), 'utf8'));
  const webCopy = JSON.parse(fs.readFileSync(path.join(ROOT, 'web/src/i18n', l + '.json'), 'utf8'));
  eq(appCopy, bundles[l], 'app/src/i18n-data/' + l + '.json == i18n/' + l + '.json');
  eq(webCopy, bundles[l], 'web/src/i18n/' + l + '.json == i18n/' + l + '.json');
}

// ------------------------------------------------------- lógica (web ESM)
async function main() {
section('logic — vectores sobre web/src/lib/gym.js');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fittrack-test-'));
fs.copyFileSync(path.join(ROOT, 'web/src/lib/gym.js'), path.join(tmp, 'gym_web.mjs'));

// transpila el puerto TS de la app (misma entrada → salida comparable)
const ts = require(path.join(ROOT, 'app/node_modules/typescript'));
const gymTs = fs.readFileSync(path.join(ROOT, 'app/src/lib/gym.ts'), 'utf8');
const out = ts.transpileModule(gymTs, { compilerOptions: { module: ts.ModuleKind.ES2020, target: ts.ScriptTarget.ES2020 } });
fs.writeFileSync(path.join(tmp, 'gym_app.mjs'), out.outputText);

const web = await import(path.join(tmp, 'gym_web.mjs'));
const app = await import(path.join(tmp, 'gym_app.mjs'));

const todayISO = web.todayISO;
const mk = (id, date, exercises, extra = {}) => ({
  id, date,
  exercises: exercises.map(([exercise_id, sets]) => ({ exercise_id, sets })),
  ...extra,
});
const S1 = mk('s1', todayISO(-8), [['bench_press', [{ reps: 5, weight_kg: 100 }, { reps: 5, weight_kg: 100 }]]], { body_weight_kg: 82 });
const S2 = mk('s2', todayISO(-1), [['bench_press', [{ reps: 10, weight_kg: 80 }]], ['back_squat', [{ reps: 8, weight_kg: 140 }]]], { body_weight_kg: 81.5 });

function approx(a, b, msg) {
  ok(Math.abs(a - b) < 1e-9, msg + (Math.abs(a - b) < 1e-9 ? '' : ` — esperado ${b}, recibido ${a}`));
}
approx(web.oneRm(100, 10), 100 * (1 + 10 / 30), 'oneRm(100,10) Epley');
eq(web.oneRm(0, 10), 0, 'oneRm peso 0');
eq(web.oneRm(100, 0), 0, 'oneRm reps 0');
eq(web.sessionVolume(S2), 80 * 10 + 140 * 8, 'sessionVolume(S2)=1920');
eq(web.sessionSets(S2), 2, 'sessionSets(S2)=2');

// weekStart: lunes de la semana actual
const ws = new Date(web.weekStart(todayISO(0)) + 'T00:00:00Z');
eq(ws.getUTCDay(), 1, 'weekStart devuelve lunes');
eq(ws.getTime() <= new Date(todayISO(0) + 'T00:00:00Z').getTime() && new Date(todayISO(0) + 'T00:00:00Z').getTime() - ws.getTime() <= 6 * 86400000, true, 'weekStart dentro de los últimos 7 días');

const wk = web.weeklyVolume([S1, S2], 4);
eq(wk.length, 4, 'weeklyVolume: 4 semanas');
eq(wk.reduce((a, w) => a + w.volume, 0), 1920 + 1000, 'weeklyVolume: volumen total 2920');
eq(wk.reduce((a, w) => a + w.sessions, 0), 2, 'weeklyVolume: 2 sesiones');

eq(web.streakDays([mk('a', todayISO(0), [['x', [{ reps: 1, weight_kg: 1 }]]]), mk('b', todayISO(-1), [['x', [{ reps: 1, weight_kg: 1 }]]]), mk('c', todayISO(-2), [['x', [{ reps: 1, weight_kg: 1 }]]])]), 3, 'streakDays=3 (hoy, ayer, anteayer)');
eq(web.streakDays([]), 0, 'streakDays vacío=0');

const prs = web.newPrs(S2, [S1, S2]);
eq(prs.length, 1, 'newPrs: 1 PR (squat nuevo, bench no supera 1RM previo)');
eq(prs[0].exercise_id, 'back_squat', 'newPrs: ejercicio=back_squat');
eq(prs[0].one_rm, Math.round(140 * (1 + 8 / 30) * 10) / 10, 'newPrs: 1RM=177.3');

const gt = web.groupTotals([S2], ALL.exercises, 7);
eq(Object.keys(gt), ['legs', 'chest'], 'groupTotals ordenado (legs>chest)');
eq(gt.legs, 1120, 'groupTotals legs=1120');
eq(gt.chest, 800, 'groupTotals chest=800');

eq(web.latestWeight([S1, S2]), 81.5, 'latestWeight=81.5');
eq(web.weightTrend([S1, S2]).length, 2, 'weightTrend: 2 puntos');

const found = web.searchExercises(ALL.exercises, 'squ', 'all', 'all');
ok(found.some((e) => e.id === 'back_squat'), 'searchExercises encuentra back_squat con "squ"');
eq(web.searchExercises(ALL.exercises, '', 'cardio', 'all').every((e) => e.muscle_group === 'cardio'), true, 'filtro por grupo=cardio');
ok(web.searchExercises(ALL.exercises, 'press', 'chest', 'barbell').every((e) => e.muscle_group === 'chest' && e.equipment === 'barbell'), true, 'filtro grupo+equipo');
ok(web.searchExercises(ALL.exercises, 'BENCH', 'all', 'all').some((e) => e.id === 'bench_press'), true, 'búsqueda case-insensitive');

const norm = web.normalizeSession({ id: 'n1', date: todayISO(0), exercises: [{ exercise_id: 'bench_press', sets: [{ reps: 0, weight_kg: 0 }, { reps: 10.4, weight_kg: 100.456 }] }] });
eq(norm.exercises[0].sets.length, 1, 'normalizeSession descarta sets vacíos');
eq(norm.exercises[0].sets[0].reps, 10, 'normalizeSession redondea reps');
eq(norm.exercises[0].sets[0].weight_kg, 100.46, 'normalizeSession redondea peso a 2 dec');
let threw = false;
try { web.normalizeSession({ date: todayISO(0), exercises: [] }); } catch { threw = true; }
ok(threw, 'normalizeSession lanza sin ejercicios');

eq(web.sortByDate([S1, S2]).map((s) => s.id), ['s2', 's1'], 'sortByDate más reciente primero');

// ------------------------------------------------------ paridad TS vs JS
section('parity — app/src/lib/gym.ts ≡ web/src/lib/gym.js');
function same(fn, inputs, label) {
  const a = JSON.stringify(fn(web, ...inputs));
  const b = JSON.stringify(fn(app, ...inputs));
  ok(a === b, label);
}
same((m) => m.oneRm(100, 10), [], 'oneRm');
same((m) => m.sessionVolume(S2), [], 'sessionVolume');
same((m) => m.weekStart(todayISO(0)), [], 'weekStart');
same((m) => m.weeklyVolume([S1, S2], 4), [], 'weeklyVolume');
same((m) => m.streakDays([S1, S2]), [], 'streakDays');
same((m) => m.newPrs(S2, [S1, S2]), [], 'newPrs');
same((m) => m.groupTotals([S2, S1], ALL.exercises, 14), [], 'groupTotals');
same((m) => m.weightTrend([S1, S2]), [], 'weightTrend');
same((m) => m.searchExercises(ALL.exercises, 'row', 'back', 'barbell'), [], 'searchExercises');
same((m) => m.normalizeSession({ id: 'p', date: todayISO(0), exercises: [{ exercise_id: 'x', sets: [{ reps: 3, weight_kg: 12.345 }]}] }), [], 'normalizeSession');
same((m) => m.sortByDate([S2, S1]), [], 'sortByDate');

// ------------------------------------------------------------- typecheck
section('typecheck — tsc --noEmit (app/)');
let tscOk = true;
try {
  const outTsc = execFileSync(
    process.execPath,
    [path.join(ROOT, 'app/node_modules/typescript/bin/tsc'), '--noEmit'],
    { cwd: path.join(ROOT, 'app'), stdio: 'pipe' },
  );
  ok(String(outTsc).trim() === '', 'tsc sin salida');
} catch (e) {
  tscOk = false;
  console.error('  tsc output:\n' + (e.stdout ? e.stdout.toString() : '') + (e.stderr ? e.stderr.toString() : ''));
}
ok(tscOk, 'tsc --noEmit exit 0');

// ------------------------------------------------------------------ fin
console.log('\n' + (checks - failures) + '/' + checks + ' comprobaciones OK');
if (failures) {
  console.error('RESULTADO: ' + failures + ' FALLOS');
  process.exit(1);
}
console.log('RESULTADO: 0 FALLOS');
} // fin main

main().catch((e) => {
  console.error('TEST_HARNESS_FAIL', e && e.stack ? e.stack.slice(0, 800) : e);
  process.exit(1);
});
