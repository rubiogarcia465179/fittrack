#!/usr/bin/env node
/**
 * Fusiona las traducciones LOCALES de nombres (data/exercises/names-i18n.json)
 * en la base como `name_es` / `name_fr`, y las propaga a las copias de la app
 * y la web. Falla si falta algún id (los 226 deben estar traducidos).
 *
 *   node scripts/merge_exercise_names.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'data/exercises/all.json');
const MIRRORS = ['app/src/data/exercises.json'].map((p) => path.join(ROOT, p));
const names = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/exercises/names-i18n.json'), 'utf8'));
// R-143: nombres de PANTALLA en inglés y neerlandés (naturales, material primero).
// name_en / name_nl siguen siendo los originales de wger (los usa la lógica).
const display = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/exercises/names-display.json'), 'utf8'));

const db = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const missing = db.exercises.filter((e) => !Array.isArray(names[e.id])).map((e) => e.id);
if (missing.length) throw new Error('Sin traducción: ' + missing.join(', '));

const noDisplay = db.exercises.filter((e) => !Array.isArray(display[e.id])).map((e) => e.id);
if (noDisplay.length) throw new Error('Sin nombre de pantalla EN/NL: ' + noDisplay.join(', '));
for (const e of db.exercises) {
  const [es, fr] = names[e.id];
  e.name_es = es;
  e.name_fr = fr;
  const [en, nl] = display[e.id];
  e.display_en = en;
  e.display_nl = nl;
}
const NOTE = 'name_es/name_fr: traducciones locales curadas (no de wger), en data/exercises/names-i18n.json.';
if (!String(db.source_note || '').includes('name_es/name_fr')) db.source_note = `${db.source_note || ''} ${NOTE}`.trim();

const out = JSON.stringify(db, null, 2) + '\n';
fs.writeFileSync(SRC, out);
for (const m of MIRRORS) {
  if (!fs.existsSync(m)) continue;
  const cur = JSON.parse(fs.readFileSync(m, 'utf8'));
  // Las copias pueden ser la base completa o solo la lista de ejercicios.
  if (Array.isArray(cur)) fs.writeFileSync(m, JSON.stringify(db.exercises, null, 2) + '\n');
  else fs.writeFileSync(m, out);
}
console.log(`OK ${db.exercises.length} ejercicios con name_es/name_fr → all.json + ${MIRRORS.length} copias`);
