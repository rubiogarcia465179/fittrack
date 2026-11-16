#!/usr/bin/env node
/**
 * Quita los ejercicios DUPLICADOS del catálogo (R-119, 2026-11-16).
 *
 * Cada duplicado se fusiona en el que se queda: sus alias pasan al que queda
 * y su id se guarda en `data/exercises/merged-ids.json` (id viejo → id que
 * queda) para que el historial y las marcas guardadas se migren solos
 * (`app/src/lib/merged-ids.ts`, generado aquí).
 *
 * Toca la FUENTE (data/exercises/all.json, names-i18n.json, howto/<lang>.json
 * y data/images/<id>.png). Después:
 *   python3 scripts/sync_data.py && node scripts/sync_howto.js \
 *     && python3 scripts/make_image_map.py && node scripts/make_photo_map.js
 *
 * Idempotente: si un id ya no está, se salta.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const P = (...a) => path.join(ROOT, ...a);
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const writeJson = (f, o) => fs.writeFileSync(f, JSON.stringify(o, null, 2) + '\n');

/** id que se va → id que se queda (mismo movimiento, mismo material). */
const MERGE = {
  bench_press_narrow_grip: 'close_grip_bench_press',
  dips_1: 'triceps_dips',
  military_press_2: 'military_press_1',
  leg_extension_2: 'leg_extension_1',
  leg_extension_3: 'leg_extension_1',
  pushups: 'push_ups',
  squats: 'back_squat',
  side_raise: 'lateral_raises',
  chin_up: 'chin_ups',
  bent_over_rowing: 'bent_over_barbell_row',
  row: 'bent_over_barbell_row',
  reverse_bar_curl: 'reverse_curl',
  shoulder_shrug: 'shrugs_barbells',
  leg_curl: 'leg_curls_laying',
  standing_bicep_curl: 'biceps_curls_with_dumbbell',
  leg_raise: 'leg_raises_lying',
  weighted_step: 'weighted_step_ups',
  jogging: 'run',
  high_knee_jumps: 'high_knees',
  calf_raises: 'standing_calf_raises',
  hip_raise_lying: 'glute_bridge',
};

/** Ajustes del que se queda (grupo correcto; nombres sin "(variante)"). */
const FIX = {
  military_press_1: { muscle_group: 'shoulders' },
  push_ups: { muscle_group: 'chest' },
  back_squat: { equipment: 'barbell' },
  dips_2: { names: { es: 'Fondos', fr: 'Dips' } },
};

// ---- base ----
const allFile = P('data/exercises/all.json');
const all = readJson(allFile);
const byId = new Map(all.exercises.map((e) => [e.id, e]));
let removed = 0;
for (const [gone, keep] of Object.entries(MERGE)) {
  const g = byId.get(gone);
  const k = byId.get(keep);
  if (!g) continue;
  if (!k) throw new Error(`falta el ejercicio que se queda: ${keep}`);
  const aliases = new Set([...(k.aliases || []), ...(g.aliases || []), g.name_en, g.name_nl].filter(Boolean));
  for (const n of [k.name_en, k.name_nl]) aliases.delete(n);
  k.aliases = [...aliases];
  byId.delete(gone);
  removed++;
}
for (const [id, fix] of Object.entries(FIX)) {
  const e = byId.get(id);
  if (!e) continue;
  if (fix.muscle_group) e.muscle_group = fix.muscle_group;
  if (fix.equipment) e.equipment = fix.equipment;
  if (fix.names?.es) e.name_es = fix.names.es;
  if (fix.names?.fr) e.name_fr = fix.names.fr;
}
all.exercises = all.exercises.filter((e) => byId.has(e.id));
all.count = all.exercises.length;
writeJson(allFile, all);

// ---- nombres locales ES/FR ----
const namesFile = P('data/exercises/names-i18n.json');
const names = readJson(namesFile);
for (const gone of Object.keys(MERGE)) delete names[gone];
for (const [id, fix] of Object.entries(FIX)) {
  if (fix.names && names[id]) names[id] = [fix.names.es ?? names[id][0], fix.names.fr ?? names[id][1]];
}
writeJson(namesFile, names);

// ---- pasos "cómo se hace" ----
for (const lang of ['es', 'en', 'nl', 'fr']) {
  const f = P('data/exercises/howto', `${lang}.json`);
  if (!fs.existsSync(f)) continue;
  const h = readJson(f);
  const map = h.steps && typeof h.steps === 'object' ? h.steps : h;
  for (const gone of Object.keys(MERGE)) delete map[gone];
  writeJson(f, h);
}

// ---- imágenes placeholder ----
for (const gone of Object.keys(MERGE)) {
  const img = P('data/images', `${gone}.png`);
  if (fs.existsSync(img)) fs.unlinkSync(img);
}

// ---- mapa de migración (historial y marcas guardadas) ----
const mergedFile = P('data/exercises/merged-ids.json');
const prev = fs.existsSync(mergedFile) ? readJson(mergedFile) : {};
const merged = { ...prev, ...MERGE };
writeJson(mergedFile, merged);
const ts = `// Generado por scripts/dedupe_catalog.js — NO editar a mano.
// Ejercicios duplicados fusionados (R-119): id viejo → id que se queda.
// El store migra con esto el historial, las marcas y el entreno en curso.
export const MERGED_IDS: Record<string, string> = ${JSON.stringify(merged, null, 2)};

/** Id vigente de un ejercicio (sigue la fusión si el id ya no existe). */
export const currentExerciseId = (id: string): string => MERGED_IDS[id] ?? id;
`;
fs.writeFileSync(P('app/src/lib/merged-ids.ts'), ts);

console.log(`quitados ${removed} duplicados → ${all.count} ejercicios`);
