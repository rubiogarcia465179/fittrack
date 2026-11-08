/** Tipos compartidos de la lógica de entrenamiento. */
export type Experience = 'beginner' | 'intermediate' | 'advanced';
export type Intensity = 'low' | 'moderate' | 'high';
export type EquipmentMode = 'full' | 'dumbbells' | 'bodyweight';
/** Objetivo del entrenamiento: define el esquema de series×reps. */
export type Goal =
  | 'build_muscle'
  | 'lose_fat'
  | 'definition'
  | 'lose_weight'
  | 'strength'
  | 'endurance';

export interface ExerciseRow {
  id: string;
  name_en: string;
  name_nl: string;
  aliases?: string[];
  muscle_group: string;
  secondary_muscles?: string[];
  equipment: string;
  level: string;
  instructions?: string[];
  image: string;
  source: string;
}
