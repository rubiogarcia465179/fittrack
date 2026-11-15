#!/usr/bin/env node
/**
 * Fase 13 — genera los prompts de las 3 fotos explicativas por ejercicio.
 *
 *   node scripts/make_photo_prompts.js
 *
 * Lee data/exercises/all.json y escribe:
 *   docs/fotos/PROMPTS.md     → para copiar/pegar en ChatGPT (1 bloque por foto)
 *   docs/fotos/prompts.json   → lo mismo, legible por máquina (futuro script/API)
 *
 * Nombres de archivo esperados de vuelta: data/images/photos/<id>-1.png … -3.png
 * Estilo tomado de data/images/ejemplo/ (gym minimalista luminoso, foto real).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const { exercises } = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/exercises/all.json'), 'utf8'));

const STYLE = [
  'Photorealistic fitness photograph, shot on a full-frame camera, 50mm, natural soft daylight.',
  'Bright minimalist modern gym: light grey concrete walls, dark rubber floor, large window on the left, one green plant, black equipment.',
  'Athletic adult in a plain grey tank top, black shorts and grey sneakers; correct, safe technique; realistic anatomy and hands.',
  'Full body visible, camera at a 3/4 side angle so the movement is easy to read. Vertical 4:5 format.',
  'Annotations drawn on top of the photo in clean flat orange (#F05B1F): thick curved arrows for the direction of movement and thin circles around the key form points. Arrows and circles only — NO text, letters, numbers or logos anywhere.',
].join(' ');

/** Puntos de técnica a marcar con círculos, por grupo muscular / material. */
const CUES = {
  chest: 'elbows at about 45° from the torso, wrists stacked over elbows, shoulder blades pulled together',
  back: 'neutral spine, shoulder blades squeezing back and down, elbows driving toward the hips',
  legs: 'knees tracking over the toes, heels flat on the floor, neutral spine',
  shoulders: 'core braced, ribs down, wrists stacked over elbows, no lower-back arch',
  arms: 'upper arms fixed close to the body, wrists neutral, controlled elbow movement',
  core: 'lower back neutral and in contact, ribs down, neck relaxed',
  cardio: 'upright posture, relaxed shoulders, soft landing under the hips',
  full_body: 'neutral spine, hips and shoulders moving together, braced core',
};
const EQUIP = {
  barbell: 'a loaded Olympic barbell',
  dumbbell: 'a pair of dumbbells',
  machine: 'the gym machine for this exercise',
  cable: 'a cable station with the proper handle',
  bodyweight: 'only body weight',
  other: 'the appropriate equipment for this exercise',
};

const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
/** Pasos de wger con punto final (algunos no lo traen y se pegaban a la frase siguiente). */
const steps = (e) =>
  (e.instructions || [])
    .map(clean)
    .filter(Boolean)
    .map((s) => (/[.!?]$/.test(s) ? s : s + '.'));

function promptsFor(e) {
  const st = steps(e);
  const first = st[0] || 'Set up in the starting position.';
  const mid = st[Math.min(1, st.length - 1)] || 'Perform the movement under control.';
  const last = st[st.length - 1] || 'Return to the start under control.';
  const name = clean(e.name_en);
  const kit = EQUIP[e.equipment] || EQUIP.other;
  const cues = CUES[e.muscle_group] || CUES.full_body;
  const head = `Exercise: "${name}" using ${kit}.`;
  return [
    {
      file: `${e.id}-1.png`,
      title: 'Posición inicial',
      prompt: `${STYLE} ${head} Photo 1 of 3 — STARTING POSITION. ${first} Circle the key setup points (${cues}). One small arrow showing where the movement will go next.`,
    },
    {
      file: `${e.id}-2.png`,
      title: 'Movimiento',
      prompt: `${STYLE} ${head} Photo 2 of 3 — MID-MOVEMENT / PEAK. ${mid} Large curved arrows showing the path of the movement; circle the working muscles and joints.`,
    },
    {
      file: `${e.id}-3.png`,
      title: 'Técnica clave y vuelta',
      prompt: `${STYLE} ${head} Photo 3 of 3 — KEY FORM AND RETURN. ${last} Circle the most common mistake area to watch (${cues}); an arrow showing the controlled return to the start.`,
    },
  ];
}

const out = exercises.map((e) => ({ id: e.id, name: e.name_en, muscle_group: e.muscle_group, equipment: e.equipment, photos: promptsFor(e) }));
const dir = path.join(ROOT, 'docs/fotos');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'prompts.json'), JSON.stringify(out, null, 2) + '\n');

const md = [
  '# Fase 13 — Prompts de fotos por ejercicio',
  '',
  `**${out.length} ejercicios × 3 fotos = ${out.length * 3} imágenes.** Generado por`,
  '`scripts/make_photo_prompts.js` desde `data/exercises/all.json` (no editar a mano).',
  '',
  '## Cómo usarlo',
  '1. Pega cada bloque en ChatGPT (generación de imágenes), un bloque = una imagen.',
  '2. Guarda la imagen con el nombre indicado en `data/images/photos/`.',
  '3. Revisa la técnica: si la postura es incorrecta o insegura, regenera.',
  '4. Cuando haya lotes listos, avisa al agente para integrarlos (carrusel en el',
  '   detalle + `source_note` declarando que son imágenes generadas con IA).',
  '',
  '## Estilo común (incluido en cada prompt)',
  '',
  '> ' + STYLE,
  '',
  '---',
  '',
];
for (const e of out) {
  md.push(`## ${e.name} \`${e.id}\``, '', `Grupo: ${e.muscle_group} · Material: ${e.equipment}`, '');
  for (const ph of e.photos) {
    md.push(`**${ph.title}** → \`data/images/photos/${ph.file}\``, '', '```text', ph.prompt, '```', '');
  }
}
fs.writeFileSync(path.join(dir, 'PROMPTS.md'), md.join('\n'));
console.log(`OK ${out.length} ejercicios, ${out.length * 3} prompts → docs/fotos/`);
