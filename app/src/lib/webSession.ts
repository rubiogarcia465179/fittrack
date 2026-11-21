/**
 * Web pública (R-152): seguir la sesión creada en la web, sin guardar nada.
 * Estado puro y funciones sin efectos (se prueban en tests/run.js):
 * una serie cada vez → "Serie hecha" → descanso con cuenta atrás → siguiente.
 * Los tiempos son marcas de Date.now() (ms); la pantalla solo los pinta.
 */
export interface WsSet {
  reps: number;
  kg: number;
  /** Cardio: minutos (reps y kg = 0). */
  min?: number;
  done_at?: number;
}
export interface WsExercise {
  id: string;
  rest: number; // s
  cardio: boolean;
  /** Sin carga: no se muestra el peso. */
  bodyweight: boolean;
  sets: WsSet[];
}
export interface WsState {
  started: number;
  ex: WsExercise[];
  /** Fin del descanso en curso (ms) o null. */
  restUntil: number | null;
  finished: number | null;
}

export interface WsPlanRow {
  exercise_id: string;
  sets: number;
  reps: number;
  rest_sec: number;
  recommended_weight_kg: number;
}

export function startSession(
  rows: WsPlanRow[],
  info: (id: string) => { cardio: boolean; bodyweight: boolean },
  cardioMin: number,
  now: number,
): WsState {
  return {
    started: now,
    restUntil: null,
    finished: null,
    ex: rows.map((r) => {
      const { cardio, bodyweight } = info(r.exercise_id);
      return {
        id: r.exercise_id,
        rest: r.rest_sec,
        cardio,
        bodyweight: bodyweight || cardio,
        sets: cardio
          ? [{ reps: 0, kg: 0, min: cardioMin }]
          : Array.from({ length: Math.max(1, r.sets) }, () => ({ reps: r.reps, kg: bodyweight ? 0 : r.recommended_weight_kg })),
      };
    }),
  };
}

/** La serie que toca: el primer ejercicio con una serie sin hacer. null = todo hecho. */
export function current(s: WsState): { ei: number; si: number } | null {
  for (let ei = 0; ei < s.ex.length; ei++) {
    const si = s.ex[ei].sets.findIndex((x) => !x.done_at);
    if (si >= 0) return { ei, si };
  }
  return null;
}

export const totalSets = (s: WsState) => s.ex.reduce((a, e) => a + e.sets.length, 0);
export const doneSets = (s: WsState) => s.ex.reduce((a, e) => a + e.sets.filter((x) => x.done_at).length, 0);

/** Marca la serie actual como hecha. Si quedan más, empieza el descanso; si no, termina. */
export function completeSet(s: WsState, now: number): WsState {
  const c = current(s);
  if (!c) return s;
  const ex = s.ex.map((e, ei) =>
    ei !== c.ei ? e : { ...e, sets: e.sets.map((x, si) => (si === c.si ? { ...x, done_at: now } : x)) },
  );
  const next: WsState = { ...s, ex };
  if (!current(next)) return { ...next, restUntil: null, finished: now };
  return { ...next, restUntil: now + s.ex[c.ei].rest * 1000 };
}

/** Segundos de descanso que quedan (0 = no hay descanso). */
export function restLeft(s: WsState, now: number): number {
  return s.restUntil ? Math.max(0, Math.ceil((s.restUntil - now) / 1000)) : 0;
}
export const addRest = (s: WsState, sec: number, now: number): WsState =>
  s.restUntil ? { ...s, restUntil: Math.max(s.restUntil, now) + sec * 1000 } : s;
export const skipRest = (s: WsState): WsState => ({ ...s, restUntil: null });

/**
 * Ajusta reps / kg / min de la serie actual; el cambio pasa también a las
 * series que quedan de ese ejercicio (si el peso era mucho, lo es en todas).
 */
export function adjust(s: WsState, field: 'reps' | 'kg' | 'min', delta: number): WsState {
  const c = current(s);
  if (!c) return s;
  const step = (v: number) => {
    const n = Math.round((v + delta) * 10) / 10;
    return Math.max(field === 'kg' ? 0 : 1, n);
  };
  const ex = s.ex.map((e, ei) =>
    ei !== c.ei ? e : { ...e, sets: e.sets.map((x, si) => (si >= c.si ? { ...x, [field]: step((x[field] as number) || 0) } : x)) },
  );
  return { ...s, ex };
}

/** Terminar antes de tiempo: lo hecho queda en el resumen. */
export const endNow = (s: WsState, now: number): WsState => ({ ...s, restUntil: null, finished: now });

/** "1:05", "12:34", "1:02:03". */
export function clock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}
