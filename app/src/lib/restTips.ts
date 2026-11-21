/**
 * Consejos para el descanso entre series (R-164 / R-167): respirar, beber,
 * qué comer antes y después. Consejo general de nutrición deportiva (no
 * médico); el texto vive en i18n (`tip_1` … `tip_N`). Uno al azar en cada
 * descanso, sin repetir el anterior.
 */
export const TIP_COUNT = 16;

/** Índice 1..TIP_COUNT. `rand` ∈ [0,1) (inyectable para tests); evita `prev`. */
export function pickTip(prev: number | null, rand: number = Math.random()): number {
  const n = Math.floor(rand * (prev ? TIP_COUNT - 1 : TIP_COUNT)) + 1;
  return prev && n >= prev ? n + 1 : n;
}

/** Mensajes al terminar (R-170), inspirados en David Goggins: `gg_1` … `gg_N`. */
export const GOGGINS_COUNT = 32;
export const pickGoggins = (rand: number = Math.random()) => Math.floor(rand * GOGGINS_COUNT) + 1;
