/**
 * Progresión automática (sobrecarga progresiva), solo desde datos reales.
 *
 * Regla: si en la última sesión de ese ejercicio TODAS las series hechas con
 * el peso más alto (W) llegaron a las reps planeadas hoy, se propone
 * W + 2,5 kg (el paso de la rueda de peso). Si falló alguna serie, si pasaron
 * más de 21 días o si el ejercicio va sin carga, no hay propuesta.
 */
import type { Session } from '../store';

export const PROGRESS_STEP = 2.5;
const MAX_DAYS = 21;

export interface Progression {
  from: number; // W de la última vez
  to: number; // W + paso
  sets: number; // series hechas con W
  reps: number; // reps mínimas con W
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b + 'T00:00:00') - Date.parse(a + 'T00:00:00')) / 86400000);
}

/** `sessions`: cualquier orden. `today`: yyyy-mm-dd. */
export function progressionFor(
  exerciseId: string,
  sessions: Session[],
  plannedReps: number,
  today: string,
  /** Siguiente peso estándar (R-171: mancuerna de 12 → 14, no 14,5). Por defecto +2,5. */
  next: (w: number) => number = (w) => w + PROGRESS_STEP,
): Progression | null {
  const last = sessions
    .filter((s) => s.type !== 'benchmark' && s.exercises.some((e) => e.exercise_id === exerciseId))
    .sort((a, b) => (a.date === b.date ? String(b.created_at || '').localeCompare(String(a.created_at || '')) : a.date < b.date ? 1 : -1))[0];
  if (!last || daysBetween(last.date, today) > MAX_DAYS) return null;
  const sets = (last.exercises.find((e) => e.exercise_id === exerciseId)?.sets || []).filter(
    (s) => s.weight_kg > 0 && s.reps > 0 && !s.duration_min,
  );
  if (sets.length === 0) return null;
  const w = Math.max(...sets.map((s) => s.weight_kg));
  const top = sets.filter((s) => s.weight_kg === w);
  const minReps = Math.min(...top.map((s) => s.reps));
  if (minReps < plannedReps) return null;
  return { from: w, to: Math.round(next(w) * 100) / 100, sets: top.length, reps: minReps };
}
