#!/usr/bin/env node
/**
 * R-137 — prompts de DIBUJO (estilo de línea, como Everkinetic) para los
 * ejercicios que aún no tienen dibujo → docs/fotos/PROMPTS-DIBUJOS.md.
 * Genera las imágenes (p. ej. ChatGPT), guárdalas en
 * data/images/photos/inbox/<id>-1.png y <id>-2.png y ejecuta
 *   python3 scripts/add_drawings.py
 * (las limpia igual que las de Everkinetic y las marca "generado con IA").
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const ex = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/exercises/all.json'), 'utf8')).exercises;
const howto = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/exercises/howto/en.json'), 'utf8'));
const have = new Set(fs.readdirSync(path.join(ROOT, 'data/images/photos')).filter((f) => /-1\.png$/.test(f)).map((f) => f.replace(/-1\.png$/, '')));
const STYLE =
  'Black ink line drawing on a pure white background, in the style of classic exercise-instruction diagrams: ' +
  'an athletic man in shorts, barefoot, clean uniform black outlines (about 3 px), light anatomical muscle lines, ' +
  'no shading, no grey, no colour, no floor shadow. Full body visible, 3/4 side view so the movement is easy to read; ' +
  'the equipment drawn in the same line style. No text, letters, numbers, arrows or logos. Square image.';
const todo = ex.filter((e) => !have.has(e.id) && e.muscle_group !== 'cardio').sort((a, b) => a.muscle_group.localeCompare(b.muscle_group) || a.name_en.localeCompare(b.name_en));
let md = `# Prompts de dibujos (estilo línea, como Everkinetic)

Generado por \`node scripts/make_drawing_prompts.js\` (no editar a mano).
**${todo.length} ejercicios** sin dibujo (sin contar cardio). Para cada uno, 2 imágenes:
posición inicial (\`-1\`) y final (\`-2\`).

1. Pega cada bloque en un generador de imágenes (p. ej. ChatGPT).
2. Revisa la técnica (si es incorrecta o insegura, regenera).
3. Guarda como \`data/images/photos/inbox/<id>-1.png\` y \`<id>-2.png\`.
4. \`python3 scripts/add_drawings.py\` → fondo transparente, recorte, tinte
   con el tema; en la app aparecen marcados como "Dibujo generado con IA".
5. \`node scripts/photo_status.js\` actualiza la cuenta (\`docs/fotos/STATUS.md\`).

## Estilo común (va en cada prompt)

> ${STYLE}

`;
for (const e of todo) {
  const steps = howto[e.id] || [];
  md += `## ${e.name_en} \`${e.id}\`\n\nGrupo: ${e.muscle_group} · Material: ${e.equipment}\n\n`;
  [['STARTING position', steps[0] || ''], ['END position (the hardest point of the movement)', steps[1] || steps[0] || '']].forEach(([pos, step], k) => {
    md += `**${k === 0 ? 'Inicio' : 'Final'}** → \`data/images/photos/inbox/${e.id}-${k + 1}.png\`\n\n\`\`\`text\n${STYLE} Exercise: "${e.name_en}". Show the ${pos}. ${step}\n\`\`\`\n\n`;
  });
}
fs.writeFileSync(path.join(ROOT, 'docs/fotos/PROMPTS-DIBUJOS.md'), md);
console.log(`OK ${todo.length} ejercicios → docs/fotos/PROMPTS-DIBUJOS.md`);
