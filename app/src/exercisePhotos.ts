/**
 * GENERADO por scripts/make_photo_map.js — no editar a mano.
 * Fotos explicativas por ejercicio (hasta 3). Para añadir fotos: déjalas en
 * data/images/photos/<id>-1.jpg … -3.jpg y vuelve a ejecutar el script.
 */
const HERO = require('../assets/session-hero.jpg');

const PHOTOS: Record<string, number[]> = {

};

/** Fotos de un ejercicio; si aún no tiene, 3 imágenes de ejemplo (placeholder: true). */
export function photosFor(id: string): { images: number[]; placeholder: boolean } {
  const own = PHOTOS[id];
  return own && own.length ? { images: own, placeholder: false } : { images: [HERO, HERO, HERO], placeholder: true };
}

export const PHOTO_COUNT = 0;
