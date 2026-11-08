import exercisesData from './data/exercises.json';
import { exerciseImage, EXERCISE_IMAGE_IDS } from './images';
import type { ExerciseRow } from './lib/gym';

export interface Exercise extends ExerciseRow {
  imageAsset: number; // asset de Metro (61 imágenes embebidas)
}

/** Carga la base de ejercicios embebida (61, source: seed) y resuelve
 *  cada imagen a un asset de Metro. */
export function loadExercises(): Exercise[] {
  const data = exercisesData as unknown as { exercises: ExerciseRow[] };
  return data.exercises.map((e) => ({
    ...e,
    imageAsset: safeImage(e.id),
  }));
}

function safeImage(id: string): number {
  try {
    return exerciseImage(id);
  } catch {
    return exerciseImage(EXERCISE_IMAGE_IDS[0]);
  }
}
