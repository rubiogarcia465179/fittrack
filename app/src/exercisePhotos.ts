/**
 * GENERADO por scripts/make_photo_map.js — no editar a mano.
 * Fotos explicativas por ejercicio (hasta 3). Para añadir fotos: déjalas en
 * data/images/photos/<id>-1.jpg … -3.jpg y vuelve a ejecutar el script.
 */
const HERO = require('../assets/session-hero.jpg');

/** kind: 'drawing' = dibujo de línea real (Everkinetic, CC BY-SA 3.0; fondo
 *  transparente, se tiñe con el color del tema); 'photo' = foto propia. */
const PHOTOS: Record<string, { kind: 'drawing' | 'photo'; images: number[] }> = {

};

export type PhotoKind = 'drawing' | 'photo' | 'sample';

/** Imágenes de un ejercicio; si aún no tiene, la imagen de ejemplo (kind 'sample', marcada). */
export function photosFor(id: string): { images: number[]; kind: PhotoKind; placeholder: boolean } {
  const own = PHOTOS[id];
  return own && own.images.length
    ? { images: own.images, kind: own.kind, placeholder: false }
    : { images: [HERO, HERO, HERO], kind: 'sample', placeholder: true };
}

export const PHOTO_COUNT = 0;
