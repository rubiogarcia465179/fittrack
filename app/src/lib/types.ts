/** Tipos compartidos de la lógica de entrenamiento. */
export type Experience = 'beginner' | 'intermediate' | 'advanced';
export type Intensity = 'low' | 'moderate' | 'high';
export type EquipmentMode = 'full' | 'dumbbells' | 'bodyweight';

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
