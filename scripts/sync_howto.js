#!/usr/bin/env node
/**
 * Copia los pasos "¿Cómo se hace?" por idioma (fuente de verdad:
 * data/exercises/howto/<lang>.json, redactados localmente por FitTrack en
 * lenguaje para principiantes) a los espejos de la app y la web.
 *
 *   node scripts/sync_howto.js
 *
 * Falla si algún idioma no cubre los ids de data/exercises/all.json.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LANGS = ['nl', 'es', 'en', 'fr'];
const SRC = path.join(ROOT, 'data/exercises/howto');
const DESTS = [path.join(ROOT, 'app/src/data/howto'), path.join(ROOT, 'web/src/data/howto')];

const all = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/exercises/all.json'), 'utf8'));
const ids = all.exercises.map((e) => e.id);

let bad = 0;
for (const l of LANGS) {
  const data = JSON.parse(fs.readFileSync(path.join(SRC, l + '.json'), 'utf8'));
  const missing = ids.filter((id) => !Array.isArray(data[id]) || data[id].length === 0);
  const extra = Object.keys(data).filter((id) => !ids.includes(id));
  if (missing.length || extra.length) {
    bad += 1;
    console.error(`${l}: faltan ${missing.length} (${missing.slice(0, 5).join(', ')}), sobran ${extra.length}`);
    continue;
  }
  // Orden estable = orden de all.json.
  const ordered = {};
  for (const id of ids) ordered[id] = data[id];
  const text = JSON.stringify(ordered, null, 1) + '\n';
  for (const d of DESTS) {
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, l + '.json'), text);
  }
  console.log(`${l}: ${ids.length} ejercicios → app + web`);
}
process.exit(bad ? 1 : 0);
