#!/usr/bin/env node
/**
 * Lista de todos los ejercicios con su nombre en inglés →
 * docs/EJERCICIOS.md (una entrada por ejercicio, orden alfabético).
 *
 *   node scripts/make_exercise_list.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const { exercises } = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/exercises/all.json'), 'utf8'));
const list = exercises.slice().sort((a, b) => a.name_en.localeCompare(b.name_en, 'en'));

const md = [
  '# Ejercicios — nombres en inglés',
  '',
  `${list.length} ejercicios de \`data/exercises/all.json\` (fuente: wger, CC-BY-SA).`,
  'Generado por `scripts/make_exercise_list.js`; no editar a mano.',
  '',
  ...list.map((e, i) => `${i + 1}. ${e.name_en}`),
  '',
].join('\n');

fs.writeFileSync(path.join(ROOT, 'docs/EJERCICIOS.md'), md);
console.log(`OK ${list.length} ejercicios → docs/EJERCICIOS.md`);
