#!/usr/bin/env node
/**
 * Fotos explicativas por ejercicio (Fase 13) → app.
 *
 * 1. Deja las fotos en  data/images/photos/<id>-1.jpg, <id>-2.jpg, <id>-3.jpg
 *    (también .png / .jpeg / .webp; <id> = el id del ejercicio, ver
 *    docs/EJERCICIOS.md o data/exercises/all.json). Los nombres exactos
 *    salen en docs/fotos/PROMPTS.md.
 * 2. Ejecuta:  node scripts/make_photo_map.js
 *    → copia las fotos a app/assets/photos/ y regenera
 *      app/src/exercisePhotos.ts (require() estáticos que Metro necesita).
 * Los ejercicios sin fotos siguen mostrando la imagen de ejemplo, marcada
 * como tal en la app.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'data/images/photos');
const DST = path.join(ROOT, 'app/assets/photos');
const OUT = path.join(ROOT, 'app/src/exercisePhotos.ts');
const CREDITS = path.join(SRC, 'credits.json');
const credits = fs.existsSync(CREDITS) ? JSON.parse(fs.readFileSync(CREDITS, 'utf8')) : {};
const isEk = (f) => !!credits[f] && /everkinetic/i.test(credits[f].author || '');
const isDrawing = (f) => isEk(f) || (!!credits[f] && credits[f].kind === 'drawing');
const ids = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'data/exercises/all.json'), 'utf8')).exercises.map((e) => e.id));

fs.mkdirSync(DST, { recursive: true });
const byId = new Map();
const unknown = [];
for (const f of fs.existsSync(SRC) ? fs.readdirSync(SRC).sort() : []) {
  const m = /^(.+)-([1-3])\.(png|jpe?g|webp)$/i.exec(f);
  if (!m) continue;
  const [, id, n] = m;
  if (!ids.has(id)) {
    unknown.push(f);
    continue;
  }
  fs.copyFileSync(path.join(SRC, f), path.join(DST, f));
  if (!byId.has(id)) byId.set(id, []);
  byId.get(id)[Number(n) - 1] = f;
}

const lines = [...byId.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([id, files]) => {
    const fs_ = files.filter(Boolean);
    const kind = fs_.every(isDrawing) ? 'drawing' : 'photo';
    const credit = fs_.every(isEk) ? 'everkinetic' : 'ai';
    // Página de cada original en Wikimedia Commons (autor, licencia, fuente).
    const pages = fs_.map((f) => (credits[f] && credits[f].page) || '');
    return `  ${JSON.stringify(id)}: { kind: '${kind}', credit: '${credit}', pages: ${JSON.stringify(pages)}, images: [${fs_.map((f) => `require('../assets/photos/${f}')`).join(', ')}] },`;
  });

const ts = `/**
 * GENERADO por scripts/make_photo_map.js — no editar a mano.
 * Fotos explicativas por ejercicio (hasta 3). Para añadir fotos: déjalas en
 * data/images/photos/<id>-1.jpg … -3.jpg y vuelve a ejecutar el script.
 */
const HERO = require('../assets/session-hero.jpg');

/** kind: 'drawing' = dibujo de línea real (Everkinetic, CC BY-SA 3.0; fondo
 *  transparente, se tiñe con el color del tema); 'photo' = foto propia. */
const PHOTOS: Record<string, { kind: 'drawing' | 'photo'; credit: 'everkinetic' | 'ai'; pages: string[]; images: number[] }> = {
${lines.join('\n')}
};

export type PhotoKind = 'drawing' | 'photo' | 'sample';

/** Imágenes de un ejercicio; si aún no tiene, la imagen de ejemplo (kind 'sample', marcada). */
/** credit: 'everkinetic' (dibujo real, CC BY-SA 3.0) o 'ai' (generado con IA por el usuario). */
export function photosFor(id: string): { images: number[]; kind: PhotoKind; placeholder: boolean; credit: 'everkinetic' | 'ai' | null; pages: string[] } {
  const own = PHOTOS[id];
  return own && own.images.length
    ? { images: own.images, kind: own.kind, placeholder: false, credit: own.credit, pages: own.pages }
    : { images: [HERO, HERO, HERO], kind: 'sample', placeholder: true, credit: null, pages: [] };
}

export const PHOTO_COUNT = ${byId.size};
`;
fs.writeFileSync(OUT, ts);

// Atribución completa (CC BY-SA 3.0): título, autor, fuente, licencia y cambios, por archivo.
const rows = Object.values(credits)
  .filter((c) => /everkinetic/i.test(c.author || ''))
  .sort((a, b) => a.file.localeCompare(b.file))
  .map((c) => `| \`${c.file}\` | [${(c.commons || '').replace(/^File:/, '')}](${c.page}) | Everkinetic | CC BY-SA 3.0 | ${c.note || ''} |`);
const doc = `# Créditos de los dibujos de ejercicios

Generado por \`node scripts/make_photo_map.js\` desde \`data/images/photos/credits.json\` (no editar a mano).

- **Autor**: Everkinetic (http://everkinetic.com/).
- **Fuente**: Wikimedia Commons (enlace por archivo, abajo).
- **Licencia**: Creative Commons Attribution-ShareAlike 3.0 Unported
  (CC BY-SA 3.0) — https://creativecommons.org/licenses/by-sa/3.0/
- **Cambios hechos por FitTrack**: fondo blanco convertido en transparente,
  recorte de márgenes, reducción a 600 px como máximo, conversión a gris con
  transparencia y, en la app, tinte con el color del tema (blanco o negro).
  En algunos ejercicios se invirtió el orden de los fotogramas para empezar
  por la posición inicial (lo indica la columna "Cambios").
- **Licencia de las versiones modificadas**: las mismas condiciones,
  **CC BY-SA 3.0** (ShareAlike). Puedes reutilizarlas citando a Everkinetic,
  enlazando la licencia e indicando los cambios.
- Los dibujos son material de terceros: la licencia del resto de FitTrack no
  se aplica a ellos.

| Archivo en FitTrack | Original en Wikimedia Commons | Autor | Licencia | Cambios |
|---|---|---|---|---|
${rows.join('\n')}
`;
fs.writeFileSync(path.join(ROOT, 'docs/CREDITOS-DIBUJOS.md'), doc);
console.log(`Créditos: ${rows.length} archivos → docs/CREDITOS-DIBUJOS.md`);
console.log(`OK ${byId.size} ejercicios con fotos → app/src/exercisePhotos.ts`);
if (unknown.length) console.warn('Ignoradas (id desconocido): ' + unknown.join(', '));
