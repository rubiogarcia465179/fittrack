#!/usr/bin/env node
/** FitTrack — QA (Fase 5): integridad de datos + lógica + i18n + typecheck.
 *
 *  Salidas: 0 fallos. Secciones:
 *   1. data       — all.json (campos, enums) + imágenes en data/ y app/assets/
 *                   + copia sincronizada + mapa de assets.
 *   2. i18n       — 4 bundles (nl/es/en/fr), mismo nº de claves, valores
 *                   no vacíos; espejo app/ idéntico a i18n/.
 *   3. logic      — vectores sobre la lógica de la app (gym, workout, records,
 *                   progression, session-save, energy), transpilada.
 *   4. store      — copia de seguridad: ida y vuelta, migración, rechazos.
 *   5. typecheck  — tsc --noEmit en app/ (0 errores).
 *  La web ES la app (web/ compila app/ con expo export; R-131).
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
const APP_IMG = path.join(ROOT, 'app/assets/exercises');
const APP_MAP = fs.readFileSync(path.join(ROOT, 'app/src/images.ts'), 'utf8');
const APP_DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'app/src/data/exercises.json'), 'utf8'));

// ------------------------------------------------- 1. integridad de datos
section('data — base de ejercicios');
const EXPECTED_COUNT = ALL.count;
eq(ALL.count, ALL.exercises.length, 'count declarado == nº real');
ok(ALL.count >= 200, ALL.count + ' ejercicios (>=200, dataset real wger)');
eq(ALL.source, 'real', 'source=real');

const ids = ALL.exercises.map((e) => e.id);
ok(new Set(ids).size === ids.length, 'ids únicos (' + ids.length + ')');
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
  for (const dir of [IMG, APP_IMG]) {
    if (!fs.existsSync(path.join(dir, e.id + '.png'))) missingFiles.push(path.relative(ROOT, dir) + '/' + e.id + '.png');
  }
}
eq(wrongImage, [], 'rutas de imagen consistentes (/images/exercises/<id>.png)');
eq(missingFiles, [], EXPECTED_COUNT + ' PNG en data/ y app/assets/');
eq(fs.readdirSync(IMG).filter((f) => f.endsWith('.png')).length, EXPECTED_COUNT, 'solo ' + EXPECTED_COUNT + ' PNG en data/images');

eq(APP_DATA, ALL, 'app/src/data/exercises.json sincronizado con all.json');

const mapIds = [...APP_MAP.matchAll(/'([a-z0-9_]+)':\s*require\('\.\.\/assets\/exercises\/([a-z0-9_]+)\.png'\)/g)].map((m) => m[1]);
eq(mapIds.length, EXPECTED_COUNT, 'mapa de assets: ' + EXPECTED_COUNT + ' requires');
eq(new Set(mapIds).size, EXPECTED_COUNT, 'mapa de assets: sin duplicados');
eq(ids.slice().sort().join(','), mapIds.slice().sort().join(','), 'mapa de assets cubre los ' + EXPECTED_COUNT + ' ids');

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
  eq(appCopy, bundles[l], 'app/src/i18n-data/' + l + '.json == i18n/' + l + '.json');
}

// ------------------------------------------- "cómo se hace" por idioma
section('howto — pasos en los 4 idiomas');
for (const l of LANGS) {
  const src = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/exercises/howto', l + '.json'), 'utf8'));
  const bad = ids.filter((id) => !Array.isArray(src[id]) || src[id].length < 2 || !src[id].every((s) => typeof s === 'string' && s.trim()));
  eq(bad, [], 'howto/' + l + '.json: ' + EXPECTED_COUNT + ' ejercicios con ≥2 pasos');
  eq(Object.keys(src).filter((id) => !byId.has(id)), [], 'howto/' + l + '.json: sin ids desconocidos');
  for (const mirror of ['app/src/data/howto']) {
    const copy = JSON.parse(fs.readFileSync(path.join(ROOT, mirror, l + '.json'), 'utf8'));
    eq(copy, Object.fromEntries(ids.map((id) => [id, src[id]])), mirror + '/' + l + '.json sincronizado (node scripts/sync_howto.js)');
  }
}

// ------------------------------------------------------- lógica (app, TS transpilado)
async function main() {
section('logic — vectores sobre app/src/lib/gym.ts');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fittrack-test-'));

// transpila el puerto TS de la app (misma entrada → salida comparable)
const ts = require(path.join(ROOT, 'app/node_modules/typescript'));
const gymTs = fs.readFileSync(path.join(ROOT, 'app/src/lib/gym.ts'), 'utf8');
const out = ts.transpileModule(gymTs, { compilerOptions: { module: ts.ModuleKind.ES2020, target: ts.ScriptTarget.ES2020 } });
fs.writeFileSync(path.join(tmp, 'gym_app.mjs'), out.outputText);

const app = await import(path.join(tmp, 'gym_app.mjs'));
// La web ES la app (R-131): los vectores corren sobre el mismo módulo.
const web = app;

// workout.ts (app): clasificación peso corporal / carga — nunca 0 kg en un
// ejercicio con barra aunque wger lo marque "other" (back_squat: "Dip under the bar").
const wTs = fs.readFileSync(path.join(ROOT, 'app/src/lib/workout.ts'), 'utf8');
const wOut = ts.transpileModule(wTs, { compilerOptions: { module: ts.ModuleKind.ES2020, target: ts.ScriptTarget.ES2020 } });
fs.writeFileSync(path.join(tmp, 'workout_app.mjs'), wOut.outputText.replace(/from '\.\/gym'/g, "from './gym_app.mjs'"));
const wlib = await import(path.join(tmp, 'workout_app.mjs'));
eq(wlib.isBodyweightExercise(byId.get('back_squat')), false, 'back_squat (wger "other") = con carga, no peso corporal');
eq(wlib.isBodyweightExercise(byId.get('crunches')), true, 'crunches = peso corporal (el nombre manda)');
eq(wlib.isBodyweightExercise(byId.get('crunches_with_cable')), false, 'crunches_with_cable = con carga (polea)');
eq(wlib.movementKey(byId.get('leg_curls_laying')) === wlib.movementKey(byId.get('leg_curls_sitting')), true, 'movementKey: "Leg Curls (laying)" ≈ "Leg Curls (sitting)"');
// R-119: catálogo sin duplicados y fusión trazable.
{
  const merged = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/exercises/merged-ids.json'), 'utf8'));
  eq(Object.keys(merged).every((g) => !byId.has(g) && byId.has(merged[g])), true, 'merged-ids: cada id fusionado ya no existe y apunta a uno que sí');
  for (const k of ['name_en', 'name_nl', 'name_es', 'name_fr', 'display_en', 'display_nl']) {
    const names = [...byId.values()].map((e) => (e[k] || '').toLowerCase().trim());
    eq(new Set(names).size, names.length, `catálogo sin nombres repetidos (${k})`);
  }
  // R-143: nombres de pantalla EN/NL naturales: sin comas ni paréntesis, mayúscula solo al principio.
  const bad = [...byId.values()].filter((e) => /[,()]/.test(e.display_en + e.display_nl) || !e.display_en || !e.display_nl);
  eq(bad.map((e) => e.id), [], 'nombres de pantalla EN/NL sin comas ni paréntesis y sin huecos');
  const titleCase = [...byId.values()].filter((e) => e.display_en.split(' ').length > 2 && e.display_en.split(' ').slice(1).every((w) => /^[A-Z]/.test(w)));
  eq(titleCase.map((e) => e.id), [], 'nombres EN en formato frase (no "Title Case")');
}
{
  const allEx = [...byId.values()];
  const plan = wlib.generateWorkout({ groups: ['back'], equipment_mode: 'full_gym', experience: 'intermediate', intensity: 'moderate', exercises: allEx });
  const keys = plan.exercises.map((x) => wlib.movementKey(byId.get(x.exercise_id)));
  eq(new Set(keys).size, keys.length, 'generateWorkout: sin dos ejercicios casi iguales en la sesión');
  // Con marcas, los pesos se pueden cargar de verdad (múltiplos de 2,5 kg; nunca "37,1").
  const bm = plan.exercises.filter((x) => !wlib.isBodyweightExercise(byId.get(x.exercise_id))).map((x) => ({ exercise_id: x.exercise_id, estimated_1rm: 57 }));
  const plan2 = wlib.generateWorkout({ groups: ['back'], equipment_mode: 'full_gym', experience: 'intermediate', intensity: 'moderate', exercises: allEx, benchmarks: bm });
  const ws = plan2.exercises.map((x) => x.recommended_weight_kg).filter((w) => w > 0);
  eq(ws.length > 0 && ws.every((w) => Math.abs(w / 2.5 - Math.round(w / 2.5)) < 1e-9), true, 'generateWorkout: pesos desde marcas en múltiplos de 2,5 kg');
}
// R-150: web sin historial — el press de banca da nivel y pesos para toda la sesión.
{
  const bTs = fs.readFileSync(path.join(ROOT, 'app/src/lib/benchEstimate.ts'), 'utf8');
  const bOut = ts.transpileModule(bTs, { compilerOptions: { module: ts.ModuleKind.ES2020, target: ts.ScriptTarget.ES2020 } });
  fs.writeFileSync(path.join(tmp, 'bench_app.mjs'), bOut.outputText);
  const be = await import(path.join(tmp, 'bench_app.mjs'));
  const allEx = [...byId.values()];
  eq([20, 60, 100].map((kg) => be.levelFromBench(be.benchOneRm(kg))), ['beginner', 'intermediate', 'advanced'], 'banca 20/60/100 kg × 8 → principiante/intermedio/avanzado');
  const bm = be.benchmarksFromBench(60, allEx, wlib.isBodyweightExercise);
  eq(bm.some((b) => b.exercise_id === 'push_ups' || b.exercise_id === 'crunches'), false, 'benchmarksFromBench: nada para ejercicios de peso corporal');
  const one = (id) => bm.find((b) => b.exercise_id === id)?.estimated_1rm || 0;
  eq(one('bench_press') > 0 && one('back_squat') > one('bench_press') && one('lateral_raises') < one('bench_press') / 5, true, 'cocientes: sentadilla > banca > elevaciones laterales');
  for (const goal of ['strength', 'build_muscle', 'endurance']) {
    const plan = wlib.generateWorkout({ groups: ['chest', 'shoulders', 'arms'], equipment_mode: 'full_gym', experience: 'intermediate', intensity: 'moderate', goal, exercises: allEx, benchmarks: bm });
    const loaded = plan.exercises.filter((x) => !wlib.isBodyweightExercise(byId.get(x.exercise_id)));
    eq(loaded.length > 0 && loaded.every((x) => x.recommended_weight_kg > 0), true, `web con banca (${goal}): peso recomendado en cada ejercicio con carga`);
  }
  const heavy = wlib.generateWorkout({ groups: ['chest'], equipment_mode: 'full_gym', experience: 'intermediate', intensity: 'moderate', goal: 'strength', exercises: allEx, benchmarks: [{ exercise_id: 'bench_press', estimated_1rm: 76 }], prefer: { bench_press: 99 } });
  const light = wlib.generateWorkout({ groups: ['chest'], equipment_mode: 'full_gym', experience: 'intermediate', intensity: 'moderate', goal: 'endurance', exercises: allEx, benchmarks: [{ exercise_id: 'bench_press', estimated_1rm: 76 }], prefer: { bench_press: 99 } });
  const w = (pl) => pl.exercises.find((x) => x.exercise_id === 'bench_press').recommended_weight_kg;
  eq(w(heavy) > w(light), true, `objetivo manda: fuerza (${w(heavy)} kg) > resistencia (${w(light)} kg)`);
  eq([be.setsForLevel(3, 'beginner'), be.setsForLevel(3, 'advanced'), be.setsForLevel(2, 'beginner')], [2, 4, 2], 'series por nivel (mín. 2)');
}
// R-153: la sesión de la web cabe en el tiempo elegido (máximo) y no se queda corta.
{
  const fTs = fs.readFileSync(path.join(ROOT, 'app/src/lib/webFit.ts'), 'utf8');
  const fOut = ts.transpileModule(fTs, { compilerOptions: { module: ts.ModuleKind.ES2020, target: ts.ScriptTarget.ES2020 } });
  fs.writeFileSync(path.join(tmp, 'fit_app.mjs'), fOut.outputText);
  const fit = await import(path.join(tmp, 'fit_app.mjs'));
  const allEx = [...byId.values()];
  const groupOf = (id) => byId.get(id)?.muscle_group || '';
  const bad = [];
  const groupsSets = { push: ['chest', 'shoulders', 'arms'], legs: ['legs', 'core'], full: ['legs', 'chest', 'back', 'shoulders', 'core'] };
  for (const [fname, groups] of Object.entries(groupsSets)) for (const goal of ['strength', 'build_muscle', 'lose_fat', 'endurance']) for (const T of [30, 45, 60, 90, 120]) {
    const gen = (ex) => wlib.generateWorkout({ groups, equipment_mode: 'full_gym', experience: 'intermediate', intensity: 'moderate', goal, exercises: allEx, exclude_ids: ex });
    const base = wlib.GOAL_SCHEME[goal].sets;
    const rows = fit.fitToDuration(gen([]).exercises.map((x) => ({ ...x, sets: base })), T, {
      isCardio: () => false, cardioMin: 15, baseSets: base, groupOf,
      more: (taken) => {
        const keys = new Set(taken.map((id) => wlib.movementKey(byId.get(id))));
        const c = gen(taken).exercises.filter((x) => !keys.has(wlib.movementKey(byId.get(x.exercise_id))));
        const n = (g) => taken.filter((id) => groupOf(id) === g).length;
        return c.sort((a, b) => n(groupOf(a.exercise_id)) - n(groupOf(b.exercise_id)))[0] ?? null;
      },
    });
    const m = fit.planMinutes(rows, () => false, 15);
    if (m > T || m < T - 10) bad.push(`${fname}/${goal}/${T}: ${m.toFixed(1)} min, ${rows.length} ej.`);
  }
  eq(bad, [], 'webFit: 3 enfoques × 4 objetivos × 30/45/60/90/120 min → entre T−10 y T minutos');
}
// R-152: seguir la sesión en la web (series, descanso, resumen).
{
  const sTs = fs.readFileSync(path.join(ROOT, 'app/src/lib/webSession.ts'), 'utf8');
  const sOut = ts.transpileModule(sTs, { compilerOptions: { module: ts.ModuleKind.ES2020, target: ts.ScriptTarget.ES2020 } });
  fs.writeFileSync(path.join(tmp, 'ws_app.mjs'), sOut.outputText);
  const ws = await import(path.join(tmp, 'ws_app.mjs'));
  const rows = [
    { exercise_id: 'a', sets: 2, reps: 10, rest_sec: 60, recommended_weight_kg: 40 },
    { exercise_id: 'b', sets: 1, reps: 12, rest_sec: 45, recommended_weight_kg: 0 },
  ];
  let s = ws.startSession(rows, (id) => ({ cardio: false, bodyweight: id === 'b' }), 15, 0);
  eq([ws.totalSets(s), ws.current(s)], [3, { ei: 0, si: 0 }], 'webSession: 3 series, empieza por la 1.ª');
  s = ws.adjust(s, 'kg', 2.5);
  eq(s.ex[0].sets.map((x) => x.kg), [42.5, 42.5], 'ajustar kg pasa a las series que quedan');
  s = ws.completeSet(s, 1000);
  eq([ws.restLeft(s, 1000), ws.restLeft(s, 31000)], [60, 30], 'tras "Serie hecha": descanso de 60 s que cuenta atrás');
  s = ws.addRest(s, 15, 31000);
  eq(ws.restLeft(s, 31000), 45, '+15 s');
  s = ws.skipRest(s);
  eq([ws.restLeft(s, 31000), ws.current(s)], [0, { ei: 0, si: 1 }], 'Saltar → siguiente serie');
  s = ws.completeSet(ws.skipRest(ws.completeSet(s, 40000)), 90000);
  eq([s.finished, ws.doneSets(s), s.restUntil], [90000, 3, null], 'última serie → resumen, sin descanso');
  eq([ws.clock(65), ws.clock(754), ws.clock(3723)], ['1:05', '12:34', '1:02:03'], 'reloj m:ss / h:mm:ss');
  const early = ws.endNow(ws.completeSet(ws.startSession(rows, () => ({ cardio: false, bodyweight: false }), 15, 0), 5), 9);
  eq([early.finished, ws.doneSets(early)], [9, 1], 'Terminar antes: lo hecho queda en el resumen');
}

// records.ts: marcas efectivas y días de récord (círculo verde).
const rTs = fs.readFileSync(path.join(ROOT, 'app/src/lib/records.ts'), 'utf8');
const rOut = ts.transpileModule(rTs, { compilerOptions: { module: ts.ModuleKind.ES2020, target: ts.ScriptTarget.ES2020 } });
fs.writeFileSync(path.join(tmp, 'records_app.mjs'), rOut.outputText.replace(/from '\.\/gym'/g, "from './gym_app.mjs'"));
const rec = await import(path.join(tmp, 'records_app.mjs'));
const noCardio = () => false;
const R1 = { id: 'r1', date: '2026-01-01', exercises: [{ exercise_id: 'bench_press', sets: [{ reps: 5, weight_kg: 80 }] }] };
const R2 = { id: 'r2', date: '2026-01-08', exercises: [{ exercise_id: 'bench_press', sets: [{ reps: 5, weight_kg: 85 }] }] };
const R3 = { id: 'r3', date: '2026-01-15', exercises: [{ exercise_id: 'bench_press', sets: [{ reps: 5, weight_kg: 70 }] }] };
eq([...rec.recordDays([R1, R2, R3], [], noCardio)], ['2026-01-08'], 'recordDays: solo el día que supera la marca previa (la 1.ª vez no cuenta)');
eq([...rec.recordDays([R1], [{ exercise_id: 'bench_press', estimated_1rm: 90 }], noCardio)], ['2026-01-01'], 'recordDays: supera la marca del test');
const effR = rec.effectiveRecords([R1, R2], [{ exercise_id: 'bench_press', estimated_1rm: 120 }], noCardio).get('bench_press');
eq([effR.kg, effR.source], [120, 'manual'], 'effectiveRecords: gana el test si es mayor');
const effS = rec.effectiveRecords([R1, R2], [{ exercise_id: 'bench_press', estimated_1rm: 90 }], noCardio).get('bench_press');
eq([effS.kg, effS.source, effS.best_date], [99, 'sessions', '2026-01-08'], 'effectiveRecords: si lo superas entrenando, manda la sesión (85×5 → 99 kg)');
eq(rec.BENCHMARK_TEST.every((id) => byId.has(id)), true, 'BENCHMARK_TEST: los 5 clásicos existen en la base');

// progression.ts (Fase 11k): +2,5 kg solo si completaste todas las reps, ≤ 21 días.
const pTs = fs.readFileSync(path.join(ROOT, 'app/src/lib/progression.ts'), 'utf8');
const pOut = ts.transpileModule(pTs, { compilerOptions: { module: ts.ModuleKind.ES2020, target: ts.ScriptTarget.ES2020 } });
fs.writeFileSync(path.join(tmp, 'progression_app.mjs'), pOut.outputText);
const prog = await import(path.join(tmp, 'progression_app.mjs'));
const P1 = { id: 'p1', date: '2026-03-01', exercises: [{ exercise_id: 'bench_press', sets: [{ reps: 8, weight_kg: 50 }, { reps: 8, weight_kg: 50 }, { reps: 8, weight_kg: 50 }] }] };
const P2 = { id: 'p2', date: '2026-03-01', exercises: [{ exercise_id: 'bench_press', sets: [{ reps: 8, weight_kg: 50 }, { reps: 6, weight_kg: 50 }] }] };
eq(prog.progressionFor('bench_press', [P1], 8, '2026-03-05'), { from: 50, to: 52.5, sets: 3, reps: 8 }, 'progressionFor: 3×8 con 50 kg completadas → 52,5 kg');
eq(prog.progressionFor('bench_press', [P2], 8, '2026-03-05'), null, 'progressionFor: una serie fallida → sin subida');
eq(prog.progressionFor('bench_press', [P1], 8, '2026-04-01'), null, 'progressionFor: más de 21 días → sin subida');
eq(prog.progressionFor('bench_press', [P1], 10, '2026-03-05'), null, 'progressionFor: hoy pide más reps de las hechas → sin subida');

// session-save.ts: solo las series HECHAS se guardan (también cardio por minutos).
const ssTs = fs.readFileSync(path.join(ROOT, 'app/src/lib/session-save.ts'), 'utf8');
const ssOut = ts.transpileModule(ssTs, { compilerOptions: { module: ts.ModuleKind.ES2020, target: ts.ScriptTarget.ES2020 } });
fs.writeFileSync(path.join(tmp, 'session_save_app.mjs'), ssOut.outputText.replace(/from '\.\/gym'/g, "from './gym_app.mjs'"));
const ss = await import(path.join(tmp, 'session_save_app.mjs'));
const doneOnly = ss.completedExercises([
  { exercise_id: 'bench_press', sets: [{ reps: 8, weight_kg: 50, done: true }, { reps: 8, weight_kg: 50 }] },
  { exercise_id: 'curl', sets: [{ reps: 12, weight_kg: 12 }] },
  { exercise_id: 'run', sets: [{ reps: 0, weight_kg: 0, duration_min: 20, done: true }] },
], []);
eq(doneOnly.map((e) => [e.exercise_id, e.sets.length]), [['bench_press', 1], ['run', 1]], 'completedExercises: fuera las series sin hacer; el cardio hecho cuenta');
const withPostponed = ss.completedExercises(
  [{ exercise_id: 'curl', sets: [{ reps: 12, weight_kg: 12, done: true }] }],
  [{ exercise_id: 'bench_press', reason: 'busy', attempts: 0, sets: [{ reps: 8, weight_kg: 50, done: true }, { reps: 8, weight_kg: 50, done: true }, { reps: 8, weight_kg: 50 }] }],
);
eq(withPostponed.map((e) => [e.exercise_id, e.sets.length]), [['curl', 1], ['bench_press', 2]], 'completedExercises: las series hechas de un ejercicio aplazado se guardan');
const sessSrc = fs.readFileSync(path.join(ROOT, 'app/src/screens/SessionScreen.tsx'), 'utf8');
eq(/completedExercises\(draft, postponed\)/.test(sessSrc), true, 'SessionScreen guarda también los aplazados (completedExercises(draft, postponed))');

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

// ------------------------------------------- Fase 12: cardio + valoración
section('Fase 12 — cardio, valoración y calorías');
const CARDIO = { id: 'c', date: todayISO(0), created_at: '2026-11-15T10:00:00.000Z', energy: 4, feeling: 9,
  exercises: [{ exercise_id: 'run_treadmill', sets: [{ reps: 0, weight_kg: 0, duration_min: 25.04, distance_km: 4.256, intensity: 'hard' }, { reps: 0, weight_kg: 0 }] }] };
const nc = web.normalizeSession(CARDIO);
eq(nc.exercises[0].sets.length, 1, 'normalizeSession conserva la serie de cardio y descarta la vacía');
eq(nc.exercises[0].sets[0].duration_min, 25, 'cardio: minutos redondeados a 1 decimal');
eq(nc.exercises[0].sets[0].distance_km, 4.26, 'cardio: km redondeados a 2 decimales');
eq(nc.exercises[0].sets[0].intensity, 'hard', 'cardio: intensidad conservada');
eq(nc.energy, 4, 'valoración: energía 1–5 conservada');
eq(nc.feeling, undefined, 'valoración: fuera de rango (9) se descarta');
eq('energy' in norm, false, 'sesión sin valoración no añade campos');
eq(web.sessionCardioMinutes(nc), 25, 'sessionCardioMinutes');

const energyTs = fs.readFileSync(path.join(ROOT, 'app/src/lib/energy.ts'), 'utf8');
const energyJs = ts.transpileModule(energyTs, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const energyMod = { exports: {} };
new Function('module', 'exports', energyJs)(energyMod, energyMod.exports);
const E = energyMod.exports;
// Mifflin-St Jeor: hombre 80 kg, 180 cm, 30 años → 10·80 + 6,25·180 − 5·30 + 5 = 1780
eq(Math.round(E.mifflinStJeor(80, 180, 30, 'male')), 1780, 'Mifflin-St Jeor hombre (1780)');
eq(Math.round(E.mifflinStJeor(60, 165, 30, 'female')), 1320, 'Mifflin-St Jeor mujer (1320,25 → 1320)');
eq(E.activityFromTraining(0, 0).factor, 1.2, 'actividad: sin sesiones → sedentaria ×1,2');
eq(E.activityFromTraining(12, 0).factor, 1.55, 'actividad: 3 sesiones/semana → moderada ×1,55');
eq(E.activityFromTraining(8, 600).factor, 1.55, 'actividad: 2/semana + 150 min cardio/semana → moderada');
const est = E.estimateEnergy({ weight_kg: 80, height_cm: 180, birth_year: 1996, sex: 'male', sessions_28d: 12, cardio_min_28d: 0, year: 2026 });
eq(est && est.tdee, Math.round(1780 * 1.55), 'TDEE = BMR × factor');
eq(E.estimateEnergy({ weight_kg: 80, height_cm: null, birth_year: 1996, sessions_28d: 0, cardio_min_28d: 0 }), null, 'sin altura → sin cálculo');
eq(E.cardioKcal(30, 70, 'moderate'), 245, 'kcal cardio: MET 7 × 70 kg × 0,5 h = 245');

// ------------------------------------------------- Fase 16: copia de seguridad
section('Fase 16 — copia de seguridad completa (store.backupJson / parseBackup / restore)');
{
  const storeTs = fs.readFileSync(path.join(ROOT, 'app/src/store.ts'), 'utf8');
  const storeJs = ts.transpileModule(storeTs, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mem = new Map();
  const AS = {
    getItem: async (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: async (k, v) => void mem.set(k, v),
    removeItem: async (k) => void mem.delete(k),
  };
  const photos = new Map();
  let home = null;
  const stubs = {
    '@react-native-async-storage/async-storage': { __esModule: true, default: AS },
    './lib/merged-ids': { currentExerciseId: (id) => ({ squats: 'back_squat' })[id] || id },
    './lib/sessionPhotos': {
      deletePhotos: async (ids) => ids.forEach((i) => photos.delete(i)),
      deleteAllPhotos: async () => photos.clear(),
      exportPhotos: async (ids) => Object.fromEntries(ids.filter((i) => photos.has(i)).map((i) => [i, photos.get(i)])),
      importPhotos: async (m) => { for (const [k, v] of Object.entries(m)) photos.set(k, v); return Object.keys(m).length; },
    },
    './lib/homePhoto': { loadHomePhoto: async () => home, saveHomePhoto: async (u) => void (home = u) },
  };
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', storeJs)(mod, mod.exports, (n) => {
    if (!(n in stubs)) throw new Error('stub falta: ' + n);
    return stubs[n];
  });
  const S = mod.exports;
  const sess = { id: 's1', date: '2026-11-10', exercises: [{ exercise_id: 'squats', sets: [{ reps: 5, weight_kg: 80, done: true }] }], photos: ['p1'], comments: [{ id: 'c1', text: 'ok', at: '2026-11-10T10:00:00Z' }] };
  await S.store.addSession(sess);
  await S.store.logWeight(80, '2026-11-10');
  photos.set('p1', 'data:image/jpeg;base64,AAAA');
  home = 'data:image/jpeg;base64,BBBB';
  const json = await S.store.backupJson();
  const b = S.parseBackup(json);
  ok(b && b.version === S.BACKUP_VERSION, 'la copia se lee (versión ' + S.BACKUP_VERSION + ')');
  eq(b && Object.keys(b.photos), ['p1'], 'la copia lleva las fotos del diario');
  eq(b && b.home_photo, 'data:image/jpeg;base64,BBBB', 'la copia lleva la foto de Inicio');
  await S.store.clearAll(); home = null;
  eq((await S.store.sessions()).length, 0, 'tras borrar todo no queda nada');
  const n = await S.store.restore(b);
  eq(n, 1, 'restaurar devuelve 1 sesión');
  const back = await S.store.all();
  eq(back.sessions[0].exercises[0].exercise_id, 'back_squat', 'restaurar migra ids fusionados (squats → back_squat)');
  eq(back.sessions[0].comments.length, 1, 'restaurar conserva los comentarios');
  eq(back.profile.weight_entries, [{ date: '2026-11-10', value: 80 }], 'restaurar conserva el peso corporal');
  eq(photos.get('p1'), 'data:image/jpeg;base64,AAAA', 'restaurar devuelve la foto con su id');
  eq(home, 'data:image/jpeg;base64,BBBB', 'restaurar devuelve la foto de Inicio');
  eq(S.parseBackup('no es json'), null, 'rechaza texto que no es JSON');
  eq(S.parseBackup(JSON.stringify({ app: 'otra', version: 1, sessions: [], profile: {} })), null, 'rechaza la copia de otra app');
  eq(S.parseBackup(JSON.stringify({ app: 'fittrack', version: 99, sessions: [], profile: {} })), null, 'rechaza una versión más nueva');
  const v1 = S.parseBackup(JSON.stringify({ app: 'fittrack', version: 1, exported_at: 'x', sessions: [sess, null, 7], profile: { benchmarks: [] } }));
  ok(v1 && v1.sessions.length === 1 && Object.keys(v1.photos).length === 0, 'acepta la exportación vieja (v1, sin fotos) y filtra entradas rotas');
  ok(/^fittrack-backup-\d{4}-\d{2}-\d{2}\.json$/.test(S.backupFileName(new Date(2026, 0, 5))), 'nombre del archivo: fittrack-backup-AAAA-MM-DD.json');
  eq(S.backupFileName(new Date(2026, 0, 5)), 'fittrack-backup-2026-01-05.json', 'fecha con ceros');
}

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
