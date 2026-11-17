#!/usr/bin/env node
/**
 * R-137 / R-140 — prompts EXACTOS para generar con OpenAI (o cualquier modelo
 * de imagen con imágenes de referencia) los dibujos que faltan, en el estilo
 * de los de Everkinetic que ya tiene FitTrack.
 *
 * Salidas (no editar a mano; se regeneran solas con add_drawings.py):
 *   docs/fotos/PROMPTS-DIBUJOS.md   — para personas (un bloque por imagen)
 *   docs/fotos/prompts-dibujos.json — para scripts / Codex (lista de trabajos)
 * Instrucciones para Codex: docs/fotos/CODEX-DIBUJOS.md
 *
 * Uso: node scripts/make_drawing_prompts.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const ex = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/exercises/all.json'), 'utf8')).exercises;
const howto = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/exercises/howto/en.json'), 'utf8'));
const PHOTOS = path.join(ROOT, 'data/images/photos');
const have = (id, n) => ['png', 'jpg', 'jpeg', 'webp'].some((x) => fs.existsSync(path.join(PHOTOS, `${id}-${n}.${x}`)));

/** Carpeta de ejemplos: TODOS los dibujos de Everkinetic de FitTrack, en
 *  negro sobre blanco (docs/fotos/referencias/<id>-1.png / -2.png). */
const REF_DIR = 'docs/fotos/referencias';
const refFiles = fs.readdirSync(path.join(ROOT, REF_DIR)).filter((f) => f.endsWith('.png')).sort();
const byIdRef = new Map(ex.map((e) => [e.id, e]));
/** 2 de estilo general (siempre) + los 2 ejemplos más parecidos (mismo grupo y material). */
const BASE_REFS = [`${REF_DIR}/back_squat-1.png`, `${REF_DIR}/pull_ups-1.png`];
function closestRefs(e) {
  const score = (f) => {
    const o = byIdRef.get(f.replace(/-[12]\.png$/, ''));
    if (!o) return -1;
    return (o.muscle_group === e.muscle_group ? 2 : 0) + (o.equipment === e.equipment ? 1 : 0) + (f.endsWith('-1.png') ? 0.1 : 0);
  };
  const ranked = refFiles.map((f) => [score(f), f]).sort((a, b) => b[0] - a[0] || a[1].localeCompare(b[1]));
  const out = [];
  for (const [, f] of ranked) {
    const p = `${REF_DIR}/${f}`;
    const id = f.replace(/-[12]\.png$/, '');
    if (BASE_REFS.includes(p) || out.some((x) => x.includes(`/${id}-`))) continue;
    out.push(p);
    if (out.length === 2) break;
  }
  return [...BASE_REFS, ...out];
}

/** El estilo, descrito con precisión a partir de los dibujos reales. */
const STYLE = [
  'Create a new exercise illustration that matches the attached example drawings EXACTLY in style.',
  `The examples come from the folder ${'docs/fotos/referencias/'} (real Everkinetic exercise drawings, black lines on white): copy their line weight, anatomy, proportions, head, shorts, feet and the way equipment is drawn, so the new image looks like it belongs to the same set.`,
  'In short:',
  'black ink line art on a pure white background; one athletic, muscular adult man; bald, smooth head with NO facial features (no eyes, nose or mouth; only the ear outline);',
  'shirtless, wearing plain loose shorts with a waistband line; barefoot;',
  'clean, confident black contour lines of even thickness (like a 3 px pen) and thinner interior lines that only suggest the main muscles (chest, abs, deltoids, back, quads);',
  'NO shading, NO hatching, NO grey, NO colour, NO gradients, NO shadows, NO floor line, NO background objects;',
  'equipment drawn in the same simple outline style (barbell = straight bar with round plates; benches and machines = clean geometric outlines);',
  'three-quarter view (or a straight side view when it shows the movement better), the whole body and the equipment fully inside the frame with a generous white margin;',
  'anatomically correct, safe exercise technique; realistic hands and feet.',
  'Absolutely no text, letters, numbers, arrows, logos or watermarks. Square 1024×1024 image.',
].join(' ');

const EQUIP = {
  barbell: 'a barbell',
  dumbbell: 'dumbbells',
  bodyweight: 'only body weight (no equipment)',
  cable: 'a cable machine',
  machine: 'a gym machine',
  other: 'the equipment the exercise needs',
};

/** Posición inicial / final a partir de los pasos sencillos en inglés. */
function positions(e) {
  const s = howto[e.id] || [];
  if (e.muscle_group === 'cardio') {
    return [
      `Show a natural moment of the activity: ${s[0] || e.name_en}.`,
      `Show the opposite phase of the same movement (the other leg/arm forward), same scene: ${s[1] || s[0] || e.name_en}.`,
    ];
  }
  return [
    `Show the STARTING POSITION. ${s[0] || ''}`.trim(),
    `Show the END POSITION (the hardest point of the movement). ${s[1] || s[0] || ''}`.trim(),
  ];
}

const items = [];
for (const e of ex.slice().sort((a, b) => a.muscle_group.localeCompare(b.muscle_group) || a.name_en.localeCompare(b.name_en))) {
  const [p1, p2] = positions(e);
  for (const n of [1, 2]) {
    if (have(e.id, n)) continue;
    const pos = n === 1 ? p1 : p2;
    const same =
      n === 2
        ? ` This is image 2 of 2: use the SAME man, the SAME camera angle, scale and equipment as the attached image 1 (data/images/photos/inbox/${e.id}-1.png), only the body position changes.`
        : '';
    const refs = closestRefs(e);
    items.push({
      id: e.id,
      name: e.display_en || e.name_en,
      group: e.muscle_group,
      equipment: e.equipment,
      frame: n,
      out: `data/images/photos/inbox/${e.id}-${n}.png`,
      references: n === 2 ? [...refs, `data/images/photos/inbox/${e.id}-1.png`] : refs,
      prompt: `${STYLE} Attached examples from docs/fotos/referencias/: ${refs.map((r) => r.split('/').pop()).join(', ')}. Exercise: "${e.display_en || e.name_en}" (muscle group: ${e.muscle_group}), performed with ${EQUIP[e.equipment] || EQUIP.other}. ${pos}${same}`,
    });
  }
}

fs.writeFileSync(
  path.join(ROOT, 'docs/fotos/prompts-dibujos.json'),
  JSON.stringify({ generated_by: 'scripts/make_drawing_prompts.js', examples_folder: REF_DIR, style: STYLE, count: items.length, items }, null, 1) + '\n',
);

const ids = [...new Set(items.map((i) => i.id))];
let md = `# Prompts de dibujos para OpenAI (estilo Everkinetic)

Generado por \`node scripts/make_drawing_prompts.js\` (no editar a mano; se
regenera solo cada vez que entran dibujos). **${ids.length} ejercicios ·
${items.length} imágenes pendientes.** Instrucciones paso a paso para Codex:
\`docs/fotos/CODEX-DIBUJOS.md\`. Versión para scripts:
\`docs/fotos/prompts-dibujos.json\`. Estado de todas las imágenes:
\`docs/fotos/STATUS.md\`.

## Ejemplos de estilo: carpeta \`${REF_DIR}/\`

Todos los dibujos reales de Everkinetic de FitTrack (${refFiles.length} imágenes, negro
sobre blanco). **Adjunta en cada petición las imágenes que indica su bloque**
(2 de estilo general + las 2 más parecidas al ejercicio). Para la imagen 2,
adjunta además la imagen 1 ya generada (misma persona, mismo ángulo).

## Estilo (va dentro de cada prompt)

> ${STYLE}

`;
let cur = '';
for (const it of items) {
  if (it.id !== cur) {
    cur = it.id;
    md += `## ${it.name} \`${it.id}\`\n\nGrupo: ${it.group} · Material: ${it.equipment}\n\n`;
  }
  md += `**Imagen ${it.frame} (${it.frame === 1 ? 'inicio' : 'final'})** → \`${it.out}\`\n\n\`\`\`text\n${it.prompt}\n\`\`\`\n\n`;
}
fs.writeFileSync(path.join(ROOT, 'docs/fotos/PROMPTS-DIBUJOS.md'), md);
console.log(`OK ${ids.length} ejercicios · ${items.length} imágenes → docs/fotos/PROMPTS-DIBUJOS.md + prompts-dibujos.json`);
