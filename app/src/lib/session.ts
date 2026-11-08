/**
 * Estado del entrenamiento ACTIVO (levanta al App y se persiste en
 * AsyncStorage): sobrevive a navegación entre pestañas y a recarga de
 * página, y es la fuente del tema "workout".
 */
import type { SetLog } from '../store';
import type { EquipmentMode, EquipmentStatus } from './workout';

export type ActiveDraftExercise = {
  exercise_id: string;
  sets: SetLog[];
  /** Estado del material (tarea 3B/4): por defecto "available". */
  equipment_status?: EquipmentStatus;
  /** Tiempo de descanso sugerido (segundos). */
  rest_after?: number;
  /** Cuántas veces pidió "otra sugerencia" este ejercicio ocupado. Sin
   *  temporizador: el usuario decide el ritmo. Cuando el ciclo llega de
   *  vuelta al original, puede elegir hacerlo ahora. */
  alt_attempts?: number;
};

export type PostponedExercise = {
  exercise_id: string;
  reason: 'busy' | 'unavailable';
  /** Cuántas veces pidió el usuario "otra sugerencia". Sin temporizador:
   *  el usuario decide el ritmo. Cuando el ciclo llega de vuelta al
   *  ejercicio original, puede elegir hacerlo ahora. */
  attempts: number;
  /** Series que el usuario ya había registrado (se conservan). */
  sets?: import('../store').SetLog[];
};

export type ActiveSession = {
  id: string;
  started_at: number;
  paused: boolean;
  /** Instante en que empezó la pausa actual. */
  paused_since?: number;
  /** Pausas anteriores acumuladas (ms). */
  paused_total_ms: number;
  type: 'training' | 'benchmark';
  equipment_mode: EquipmentMode;
  date: string;
  duration_min?: number;
  body_weight_kg?: number;
  notes?: string;
  draft: ActiveDraftExercise[];
  postponed: PostponedExercise[];
  /** Benchmarks vigentes (para recomendar pesos). */
  benchmarks: { exercise_id: string; estimated_1rm: number }[];
};

export function newActiveSession(
  partial: Pick<ActiveSession, 'type' | 'equipment_mode'> & {
    benchmarks?: { exercise_id: string; estimated_1rm: number }[];
  },
  todayISO: () => string,
  uid: () => string,
): ActiveSession {
  return {
    id: uid(),
    started_at: Date.now(),
    paused: false,
    paused_total_ms: 0,
    type: partial.type,
    equipment_mode: partial.equipment_mode,
    date: todayISO(),
    draft: [],
    postponed: [],
    benchmarks: partial.benchmarks || [],
  };
}
