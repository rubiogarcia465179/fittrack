/**
 * Cómo cargar el peso (R-163): discos por lado sobre la barra olímpica de
 * 20 kg, o mancuerna por mano, y el total. Lógica pura (tests/run.js).
 * - Barra: (total − 20) / 2 por lado, con los discos habituales de gimnasio
 *   (25 · 20 · 15 · 10 · 5 · 2,5 · 1,25), de mayor a menor.
 * - Mancuernas: el peso de la sesión es POR MANO; total = 2 × mano.
 * - Máquina, polea y el resto: sin desglose (se elige en la columna).
 */
export const BAR_KG = 20;
export const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25] as const;

export type Load =
  | { kind: 'barbell'; bar: number; perSide: number[]; total: number; exact: boolean }
  | { kind: 'dumbbell'; perHand: number; total: number };

/** Discos por lado para `total` kg (barra incluida). `exact` = cuadra sin sobrar. */
export function platesPerSide(total: number, bar = BAR_KG): { perSide: number[]; exact: boolean; total: number } {
  let side = Math.max(0, (total - bar) / 2);
  const perSide: number[] = [];
  for (const p of PLATES) {
    while (side + 1e-9 >= p) {
      perSide.push(p);
      side -= p;
    }
  }
  const loaded = bar + 2 * perSide.reduce((a, b) => a + b, 0);
  return { perSide, exact: side < 1e-6, total: Math.round(loaded * 100) / 100 };
}

/** Desglose de carga según el material, o null si no aplica (máquina, sin peso). */
export function loadFor(equipment: string | undefined, kg: number, name_en = ''): Load | null {
  if (!(kg > 0)) return null;
  if (equipment === 'dumbbell') return { kind: 'dumbbell', perHand: kg, total: Math.round(kg * 2 * 100) / 100 };
  // Barra olímpica: press, sentadilla, peso muerto, remo… (no la barra Z ni la Smith).
  if (equipment === 'barbell' && !/sz|ez|smith/i.test(name_en)) {
    if (kg < BAR_KG) return null; // menos que la barra: no se puede cargar en barra olímpica
    const r = platesPerSide(kg);
    return { kind: 'barbell', bar: BAR_KG, perSide: r.perSide, total: r.total, exact: r.exact };
  }
  return null;
}

/** "20 + 10 + 2,5" (coma decimal en ES/NL/FR, punto en EN). */
export function fmtKg(v: number, lang = 'en'): string {
  const s = String(Math.round(v * 100) / 100);
  return lang === 'en' ? s : s.replace('.', ',');
}

/**
 * Pesos estándar (R-171): lo que hay de verdad en un gimnasio.
 * - Barra olímpica: 20 kg + discos → múltiplos de 2,5 kg (mínimo 20).
 * - Mancuernas (por mano): 1–10 kg de 1 en 1, 12–30 de 2 en 2, luego de 2,5 en 2,5.
 * - Kettlebell: 4 · 6 · 8 · 10 · 12 · 14 · 16 · 20 · 24 · 28 · 32 · 40 · 48.
 * - Máquina y polea: placas de 5 kg (2,5 por debajo de 20).
 */
const range = (a: number, b: number, s: number) => Array.from({ length: Math.round((b - a) / s) + 1 }, (_, i) => Math.round((a + i * s) * 100) / 100);
export const DUMBBELLS = [...range(1, 10, 1), ...range(12, 30, 2), ...range(32.5, 80, 2.5)];
export const KETTLEBELLS = [4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48];

type Kind = 'barbell' | 'ez' | 'dumbbell' | 'kettlebell' | 'stack' | 'free';
function kindOf(equipment: string | undefined, name_en = ''): Kind {
  if (/kettlebell/i.test(name_en)) return 'kettlebell';
  if (equipment === 'dumbbell') return 'dumbbell';
  if (equipment === 'barbell') return /sz|ez|smith/i.test(name_en) ? 'ez' : 'barbell';
  if (equipment === 'machine' || equipment === 'cable') return 'stack';
  return 'free';
}

/** Lista de pesos posibles (ordenada) o null si van de 2,5 en 2,5 sin tope. */
function ladder(k: Kind): number[] | null {
  if (k === 'dumbbell') return DUMBBELLS;
  if (k === 'kettlebell') return KETTLEBELLS;
  return null;
}
const stepOf = (k: Kind, kg: number) => (k === 'stack' ? (kg < 20 ? 2.5 : 5) : 2.5);
const minOf = (k: Kind) => (k === 'barbell' ? BAR_KG : k === 'ez' ? 10 : 2.5);

/** El peso estándar más cercano (0 = sin peso, se respeta). */
export function snapWeight(equipment: string | undefined, kg: number, name_en = ''): number {
  if (!(kg > 0)) return 0;
  const k = kindOf(equipment, name_en);
  const l = ladder(k);
  if (l) return l.reduce((a, b) => (Math.abs(b - kg) < Math.abs(a - kg) ? b : a), l[0]);
  const s = stepOf(k, kg);
  return Math.max(minOf(k), Math.round(kg / s) * s);
}

/** Siguiente peso estándar hacia arriba (dir 1) o abajo (dir −1). */
export function stepWeight(equipment: string | undefined, kg: number, dir: 1 | -1, name_en = ''): number {
  const k = kindOf(equipment, name_en);
  const l = ladder(k);
  if (l) {
    if (dir > 0) return l.find((v) => v > kg + 1e-9) ?? l[l.length - 1];
    const lower = l.filter((v) => v < kg - 1e-9);
    return lower.length ? lower[lower.length - 1] : 0;
  }
  const cur = kg > 0 ? snapWeight(equipment, kg, name_en) : 0;
  if (dir > 0) return cur <= 0 ? minOf(k) : cur + stepOf(k, cur);
  const down = cur - stepOf(k, cur - 0.01);
  return down < minOf(k) ? 0 : down;
}

/** Todos los pesos recomendados de una sesión, a valores estándar. */
export function snapPlan<T extends { exercise_id: string; recommended_weight_kg: number }>(
  rows: T[],
  info: (id: string) => { equipment?: string; name_en?: string } | undefined,
): T[] {
  return rows.map((r) => {
    const e = info(r.exercise_id);
    return { ...r, recommended_weight_kg: snapWeight(e?.equipment, r.recommended_weight_kg, e?.name_en) };
  });
}

/** Valores de la rueda de peso (app) según el material: solo pesos estándar. */
export function weightChoices(equipment: string | undefined, name_en = ''): number[] {
  const k = kindOf(equipment, name_en);
  const l = ladder(k);
  if (l) return [0, ...l];
  if (k === 'barbell') return [0, ...range(20, 300, 2.5)];
  if (k === 'ez') return [0, ...range(10, 150, 2.5)];
  if (k === 'stack') return [0, ...range(2.5, 17.5, 2.5), ...range(20, 300, 5)];
  return [0, ...range(2.5, 300, 2.5)];
}
