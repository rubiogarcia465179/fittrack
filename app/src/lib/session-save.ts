/** Solo el trabajo completado entra al historial y a las marcas. */
import type { ExerciseLog, BenchmarkRef } from '../store';
import type { ActiveDraftExercise, PostponedExercise } from './session';
import { oneRm } from './gym';

export function completedExercises(
  draft: ActiveDraftExercise[],
  postponed: PostponedExercise[],
): ExerciseLog[] {
  const byId = new Map<string, ExerciseLog>();
  for (const row of [...draft, ...postponed]) {
    const sets = (row.sets || []).filter((s) => s.done === true &&
      (((s.duration_min ?? 0) > 0) ||
        (Number.isFinite(s.reps) && s.reps > 0 &&
          Number.isFinite(s.weight_kg) && s.weight_kg >= 0)));
    if (!sets.length) continue;
    const entry = byId.get(row.exercise_id) || { exercise_id: row.exercise_id, sets: [] };
    entry.sets.push(...sets.map((s) => ({ ...s })));
    byId.set(row.exercise_id, entry);
  }
  return [...byId.values()];
}

export function benchmarkEntries(
  exercises: ExerciseLog[],
  manual: Record<string, number>,
): BenchmarkRef[] {
  return exercises.flatMap((ex) => {
    const estimated = ex.sets.reduce((best, s) => Math.max(best, oneRm(s.weight_kg, s.reps)), 0);
    const value = manual[ex.exercise_id] ?? Math.round(estimated);
    return Number.isFinite(value) && value > 0
      ? [{ exercise_id: ex.exercise_id, estimated_1rm: value }]
      : [];
  });
}
