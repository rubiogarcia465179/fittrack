#!/usr/bin/env node
/**
 * Vídeos de YouTube por ejercicio (R-133) → app/src/videos.ts (no editar a mano).
 * Fuente: data/exercises/videos.json  { id: { url, title, channel, lang: 'en', checked } }
 * Cada vídeo se eligió a mano entre los resultados de YouTube y se comprobó con
 * el oEmbed oficial (título y canal reales; ver scripts/check_videos.py).
 * Los ejercicios sin vídeo comprobado no muestran la fila (nunca un enlace dudoso).
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const src = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/exercises/videos.json'), 'utf8'));
const ids = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/exercises/all.json'), 'utf8')).exercises.map((e) => e.id));
const entries = Object.entries(src).filter(([id, v]) => ids.has(id) && v && /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/.test(v.url));
const ts = `// GENERADO por scripts/make_video_map.js — no editar a mano.
// Un vídeo de YouTube en inglés por ejercicio, comprobado (R-133).
export interface ExerciseVideo { url: string; title: string; channel: string }
export const VIDEOS: Record<string, ExerciseVideo> = {
${entries.map(([id, v]) => `  ${JSON.stringify(id)}: { url: ${JSON.stringify(v.url)}, title: ${JSON.stringify(v.title)}, channel: ${JSON.stringify(v.channel)} },`).join('\n')}
};
export const videoFor = (id: string): ExerciseVideo | null => VIDEOS[id] ?? null;
export const VIDEO_COUNT = ${entries.length};
`;
fs.writeFileSync(path.join(ROOT, 'app/src/videos.ts'), ts);
console.log(`OK ${entries.length} vídeos → app/src/videos.ts`);
