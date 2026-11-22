/**
 * Sesión de la app: qué ejercicio es "el de ahora" y dónde estás
 * (ejercicio n de m · serie n de m). Funciones puras (tests/run.js).
 *
 * Antes la tarjeta "actual" no se movía al completar todas las series de un
 * ejercicio: el contador decía "Serie 3 de 3" con el ejercicio hecho, la
 * vista previa del descanso enseñaba otro ejercicio y el botón principal
 * seguía siendo "Siguiente ejercicio" con todo terminado.
 */
type DraftLike = { sets: { done?: boolean }[] };

const pending = (d: DraftLike | undefined) => !!d && d.sets.some((s) => !s.done);

/**
 * El siguiente ejercicio con series sin hacer después de `from`; si no hay,
 * el primero pendiente desde el principio (uno saltado). -1 = todo hecho.
 */
export function nextPendingIndex(draft: DraftLike[], from: number): number {
  for (let i = from + 1; i < draft.length; i++) if (pending(draft[i])) return i;
  for (let i = 0; i < Math.min(from, draft.length); i++) if (pending(draft[i])) return i;
  return -1;
}

/** ¿Queda alguna serie sin hacer en otro ejercicio que no sea `idx`? */
export const otherPending = (draft: DraftLike[], idx: number) => draft.some((d, i) => i !== idx && pending(d));

/** "Ejercicio n de m · Serie n de m" del ejercicio `idx` (serie = la primera sin hacer). */
export function positionOf(draft: DraftLike[], idx: number): { ex: number; exTotal: number; set: number; setTotal: number } | null {
  const d = draft[idx];
  if (!d) return null;
  const first = d.sets.findIndex((s) => !s.done);
  return { ex: idx + 1, exTotal: draft.length, set: first < 0 ? d.sets.length : first + 1, setTotal: d.sets.length };
}

/** Segundos de descanso que quedan, sin pasar nunca del total (el tic de 1 s llega tarde). */
export function restSecondsLeft(restUntil: number | null, now: number, total: number): number {
  if (!restUntil) return 0;
  return Math.min(Math.max(1, total), Math.max(0, Math.ceil((restUntil - now) / 1000)));
}

/** Mueve un elemento (orden de los ejercicios, R-176). Lo terminado no se mueve. */
export function moveItem<T extends DraftLike>(draft: T[], from: number, to: number): T[] {
  if (from === to || !draft[from] || to < 0 || to >= draft.length || !pending(draft[from])) return draft;
  const out = draft.slice();
  const [it] = out.splice(from, 1);
  out.splice(to, 0, it);
  return out;
}

/** Primer ejercicio con series pendientes desde `from` (incluido); si no, el primero pendiente. */
export function pendingFrom(draft: DraftLike[], from: number): number {
  for (let i = Math.max(0, from); i < draft.length; i++) if (pending(draft[i])) return i;
  return draft.findIndex(pending);
}

/**
 * Cambiar el ejercicio `idx` por `fresh` (R-177). Las series hechas se quedan
 * con el original (cuentan y se guardan) y el nuevo va justo después; sin
 * series hechas, lo sustituye. Devuelve el draft y el índice del nuevo.
 */
export function swapEntry<T extends DraftLike>(draft: T[], idx: number, fresh: T): { draft: T[]; index: number } {
  const old = draft[idx];
  if (!old) return { draft, index: idx };
  const done = old.sets.filter((s) => s.done);
  if (done.length === 0) return { draft: [...draft.slice(0, idx), fresh, ...draft.slice(idx + 1)], index: idx };
  return { draft: [...draft.slice(0, idx), { ...old, sets: done }, fresh, ...draft.slice(idx + 1)], index: idx + 1 };
}
