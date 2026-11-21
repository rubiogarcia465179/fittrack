/**
 * Web (R-153): ajustar la sesión al tiempo elegido. Con 1 hora, ejercicios,
 * series y descansos caben en 1 hora como mucho (y no se queda en 35 min).
 * Estimación por ejercicio: series × (trabajo + descanso) + 1 min de
 * preparación (cambiar discos, ir a la máquina). Determinista.
 */
export interface FitRow {
  exercise_id: string;
  sets: number;
  reps: number;
  rest_sec: number;
  recommended_weight_kg: number;
  weight_source?: string;
}

/** Segundos de trabajo de una serie: ~3 s por repetición, entre 30 y 75 s. */
const workSec = (reps: number) => Math.min(75, Math.max(30, reps * 3));
export const SETUP_MIN = 1;
export const MAX_SETS = 5;
export const MIN_SETS = 2;
export const MAX_EXERCISES = 12;

export function rowMinutes(r: FitRow, cardioMin?: number): number {
  if (cardioMin != null) return cardioMin + SETUP_MIN;
  return (r.sets * (workSec(r.reps) + r.rest_sec)) / 60 + SETUP_MIN;
}

export function planMinutes(rows: FitRow[], isCardio: (id: string) => boolean, cardioMin: number): number {
  return rows.reduce((a, r) => a + rowMinutes(r, isCardio(r.exercise_id) ? cardioMin : undefined), 0);
}

/**
 * Ajusta `rows` a `target` minutos (máximo). Orden de preferencia:
 * - Sobra tiempo: primero una serie más donde haya menos (hasta `baseSets + 1`),
 *   luego otro ejercicio (`more()` da el siguiente candidato o null), y si ya
 *   no hay candidatos, más series hasta MAX_SETS.
 * - Falta tiempo: quita series (hasta MIN_SETS) y luego el último ejercicio
 *   de los grupos con más de uno.
 * Nunca pasa de `target`; se para cuando falta < 4 min o no hay más que añadir.
 */
export function fitToDuration(
  input: FitRow[],
  target: number,
  opts: {
    isCardio: (id: string) => boolean;
    cardioMin: number;
    baseSets: number;
    groupOf: (id: string) => string;
    more: (taken: string[]) => FitRow | null;
  },
): FitRow[] {
  let rows = input.map((r) => ({ ...r }));
  const est = () => planMinutes(rows, opts.isCardio, opts.cardioMin);
  const lifts = () => rows.filter((r) => !opts.isCardio(r.exercise_id));

  // 1) Recortar si se pasa.
  for (let guard = 0; est() > target && guard < 100; guard++) {
    const most = lifts().reduce<FitRow | null>((a, r) => (r.sets > MIN_SETS && (!a || r.sets > a.sets) ? r : a), null);
    if (most && most.sets > opts.baseSets - 1) {
      most.sets--;
      continue;
    }
    // Quita el último ejercicio de un grupo con más de uno (o el último, si quedan > 1).
    const count = new Map<string, number>();
    for (const r of rows) count.set(opts.groupOf(r.exercise_id), (count.get(opts.groupOf(r.exercise_id)) || 0) + 1);
    let idx = -1;
    for (let i = rows.length - 1; i >= 0; i--) if ((count.get(opts.groupOf(rows[i].exercise_id)) || 0) > 1) { idx = i; break; }
    if (idx < 0 && rows.length > 1) idx = rows.length - 1;
    if (idx >= 0) {
      rows.splice(idx, 1);
      continue;
    }
    if (most) { most.sets--; continue; }
    break;
  }

  // 2) Rellenar si sobra.
  const fits = (extra: number) => est() + extra <= target;
  for (let guard = 0; target - est() >= 4 && guard < 100; guard++) {
    const ls = lifts();
    const fewest = ls.reduce<FitRow | null>((a, r) => (!a || r.sets < a.sets ? r : a), null);
    const setMin = (r: FitRow) => (workSec(r.reps) + r.rest_sec) / 60;
    if (fewest && fewest.sets < opts.baseSets + 1 && fits(setMin(fewest))) {
      fewest.sets++;
      continue;
    }
    if (rows.length < MAX_EXERCISES) {
      const cand = opts.more(rows.map((r) => r.exercise_id));
      if (cand) {
        const c = { ...cand, sets: opts.baseSets };
        while (c.sets > MIN_SETS && !fits(rowMinutes(c))) c.sets--;
        if (fits(rowMinutes(c))) {
          rows.push(c);
          continue;
        }
      }
    }
    const room = ls.filter((r) => r.sets < MAX_SETS && fits(setMin(r))).sort((a, b) => a.sets - b.sets)[0];
    if (room) {
      room.sets++;
      continue;
    }
    break;
  }
  return rows;
}
