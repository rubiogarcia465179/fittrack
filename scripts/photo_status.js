#!/usr/bin/env node
/**
 * Fase 13 — cuenta de fotos por ejercicio → docs/fotos/STATUS.md (no editar a mano).
 * Mira data/images/photos/<id>-<n>.(png|jpg|jpeg|webp) y credits.json:
 *   ✏️  dibujo real de Everkinetic (CC BY-SA 3.0, Wikimedia Commons)
 *   📷  foto propia / generada por el usuario (sin crédito externo)
 *   ⬜  pendiente (la app muestra la imagen de ejemplo, marcada)
 * Uso: node scripts/photo_status.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'data/images/photos');
const ex = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/exercises/all.json'), 'utf8')).exercises;
const credits = fs.existsSync(path.join(DIR, 'credits.json')) ? JSON.parse(fs.readFileSync(path.join(DIR, 'credits.json'), 'utf8')) : {};
const files = fs.existsSync(DIR) ? fs.readdirSync(DIR) : [];
const slot = (id, n) => {
  const f = files.find((x) => new RegExp(`^${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-${n}\\.(png|jpe?g|webp)$`, 'i').test(x));
  if (!f) return '⬜';
  if (credits[f] && /everkinetic/i.test(credits[f].author)) return '✏️';
  return credits[f] && credits[f].kind === 'drawing' ? '🖊️' : '📷';
};
const rows = ex
  .slice()
  .sort((a, b) => a.muscle_group.localeCompare(b.muscle_group) || a.name_en.localeCompare(b.name_en))
  .map((e) => ({ e, s: [1, 2, 3].map((n) => slot(e.id, n)) }));
const count = (k) => rows.reduce((a, r) => a + r.s.filter((x) => x === k).length, 0);
const any = rows.filter((r) => r.s.some((x) => x !== '⬜')).length;
const total = rows.length * 3;
let md = `# Fase 13 — Estado de las fotos por ejercicio

Generado por \`node scripts/photo_status.js\` (no editar a mano). Fuente de
cada imagen: \`data/images/photos/credits.json\`. Prompts para las que faltan:
\`docs/fotos/PROMPTS.md\`.

| | Cuántas |
|---|---|
| Ejercicios | ${rows.length} |
| Huecos (3 por ejercicio) | ${total} |
| ✏️ Dibujo real Everkinetic (CC BY-SA 3.0) | ${count('✏️')} |
| 🖊️ Dibujo generado con IA (usuario, \`PROMPTS-DIBUJOS.md\`) | ${count('🖊️')} |
| 📷 Foto propia / generada | ${count('📷')} |
| ⬜ Pendientes | ${count('⬜')} |
| Ejercicios con al menos una imagen real | ${any} de ${rows.length} |

Leyenda: ✏️ dibujo real (posición inicial = 1, final = 2) · 🖊️ dibujo generado con IA · 📷 foto propia ·
⬜ pendiente (la app muestra la imagen de ejemplo, marcada como tal).
Everkinetic dibuja 2 posiciones; el hueco 3 (técnica clave) queda para una
foto propia.

| Grupo | Ejercicio | id | 1 | 2 | 3 |
|---|---|---|---|---|---|
`;
for (const { e, s } of rows) md += `| ${e.muscle_group} | ${e.name_en} | \`${e.id}\` | ${s.join(' | ')} |\n`;
// Lista corta de lo pendiente (huecos 1 y 2, los que llevan dibujo): la usa Codex.
const pending = rows.filter((r) => r.s[0] === '⬜' || r.s[1] === '⬜');
md += `\n## Pendientes de dibujo (${pending.length})\n\nPrompts: \`docs/fotos/PROMPTS-DIBUJOS.md\` · trabajos: \`docs/fotos/prompts-dibujos.json\`.\n\n`;
md += pending.map((r) => `- \`${r.e.id}\` — ${r.e.name_en}${r.s[0] !== '⬜' ? ' (falta la 2)' : r.s[1] !== '⬜' ? ' (falta la 1)' : ''}`).join('\n') + '\n';
fs.writeFileSync(path.join(ROOT, 'docs/fotos/STATUS.md'), md);
console.log(`STATUS: ✏️ ${count('✏️')} · 📷 ${count('📷')} · ⬜ ${count('⬜')} de ${total} (${any}/${rows.length} ejercicios con imagen)`);
