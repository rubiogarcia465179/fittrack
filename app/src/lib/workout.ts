/**
 * FitTrack — generación inteligente de entrenamientos (lógica pura, sin
 * plataforma). Cubre:
 *   - Benchmark: 1RM estimado (Epley) y pesos recomendados por reps/intensidad.
 *   - Generación personalizada: grupo, duración, experiencia, intensidad,
 *     modo de equipamiento e historial reciente.
 *   - Reemplazo de ejercicios con equipamiento ocupado: mismas fibras,
 *     patrón similar, respetando el modo y sin reutilizar peso ciegamente.
 *
 * No hay azar: la selección es determinista (relevancia → nivel → nombre),
 * lo que hace los tests estables y el resultado predecible para el usuario.
 */
import type { ExerciseRow, Experience, Intensity } from './types';
import { oneRm, type SessionLike } from './gym';

export type { Experience, Intensity } from './types';

export type EquipmentMode = 'full_gym' | 'dumbbells' | 'bodyweight';
/** Estado del material durante la sesión (tarea 3B). */
export type EquipmentStatus = 'available' | 'busy' | 'unavailable';

export interface BenchmarkRef {
  exercise_id: string;
  estimated_1rm: number;
}

/** Última referencia de peso/reps de un ejercicio (para escalar pesos). */
export interface RecentRow {
  exercise_id: string;
  last_weight: number;
  last_reps: number;
}

/**
 * Convierte sesiones (recientes primero) en filas de "último peso":
 * el set más pesado de la sesión más reciente de cada ejercicio.
 */
export function recentRows(sessions: SessionLike[] | null | undefined): RecentRow[] {
  const out = new Map<string, RecentRow>();
  for (const s of sessions || []) {
    for (const ex of s.exercises || []) {
      if (out.has(ex.exercise_id)) continue;
      let bestW = 0;
      let bestR = 0;
      for (const st of ex.sets || []) {
        if (st.weight_kg > 0 && st.weight_kg > bestW) {
          bestW = st.weight_kg;
          bestR = st.reps;
        }
      }
      if (bestW > 0) out.set(ex.exercise_id, { exercise_id: ex.exercise_id, last_weight: bestW, last_reps: bestR || 1 });
    }
  }
  return [...out.values()];
}

export interface WorkoutPlanExercise {
  exercise_id: string;
  sets: number;
  reps: number;
  rest_sec: number;
  recommended_weight_kg: number; // 0 = peso corporal / sin carga
  weight_source: 'benchmark' | 'history' | 'conservative' | 'bodyweight';
}

export interface WorkoutPlan {
  id: string;
  muscle_groups: string[];
  equipment_mode: EquipmentMode;
  exercises: WorkoutPlanExercise[];
  estimated_duration_min: number;
  experience: Experience;
  intensity: Intensity;
}

/** Palabras que delatan peso corporal aunque la base lo marque "other". */
const BODY_WEIGHT_HINTS = [
  'push up', 'push-up', 'pushup', 'sit up', 'sit-up', 'situp', 'crunch',
  'plank', 'hollow', 'deadbug', 'flutter', 'leg raise', 'leg-raise',
  'mountain climber', 'jack', 'jumping jack', 'body', 'pull up', 'pull-up',
  'pullup', 'chin up', 'chin-up', 'dip', 'l hold', 'l-hold', 'full sit',
  'superman', 'bridge', 'sissy', 'pike push', 'wall pushup', 'wall push',
  'wall sit', 'crawling', 'inchworm', 'high knee', 'burpee',
];

const MACHINE_HINTS = ['machine', 'cable', 'pulley', 'lat pulldown', 'pulldown', 'rope', 'bar attachment'];

export function isBodyweightExercise(e: ExerciseRow): boolean {
  if (e.equipment === 'bodyweight') return true;
  if (e.equipment === 'barbell' || e.equipment === 'dumbbell') return false;
  const hay = [e.name_en, e.name_nl, ...((e.instructions || []).slice(0, 2))].join(' ').toLowerCase();
  if (MACHINE_HINTS.some((m) => hay.includes(m))) return false;
  return BODY_WEIGHT_HINTS.some((h) => hay.includes(h));
}

/** ¿Es compatible el ejercicio con el modo de equipamiento elegido? */
export function fitsMode(e: ExerciseRow, mode: EquipmentMode): boolean {
  if (mode === 'full_gym') return true;
  const bw = isBodyweightExercise(e);
  if (mode === 'bodyweight') return bw;
  // dumbbells: mancuernas o peso corporal simple (nada de cables ni máquinas).
  return e.equipment === 'dumbbell' || bw;
}

/**
 * Peso recomendado a partir de un 1RM (benchmark o histórico).
 * Fracción del 1RM según reps objetivo e intensidad:
 *   más reps → % más bajo (volumen); intensidad alta → % más alto.
 * Devuelve 0 cuando no hay referencia (el UI permite entrada manual).
 */
export function weightFromOneRm(
  one_rm: number,
  reps: number,
  intensity: Intensity = 'moderate',
): number {
  if (!one_rm || one_rm <= 0 || !reps) return 0;
  const pct = 0.9 - Math.min(reps, 20) / 20 * 0.5; // 1 rep → 90%, 20 reps → 40%
  const adj = intensity === 'high' ? 1.05 : intensity === 'low' ? 0.92 : 1;
  return Math.max(2.5, Math.round(one_rm * pct * adj * 10) / 10);
}

/** Fracción conservadora del 1RM cuando no hay benchmark (inicio seguro).
 *  Nada de máximas: pesos bajos que se pueden ajustar con un clic. */
export function conservativeOneRm(equipment: string): number {
  switch (equipment) {
    case 'barbell': return 20;
    case 'machine': return 20;
    case 'cable': return 15;
    case 'dumbbell': return 10;
    default: return 0; // sin carga: peso corporal
  }
}

const REPS_BY_INTENSITY: Record<Intensity, [number, number]> = {
  low: [12, 15],
  moderate: [8, 12],
  high: [6, 8],
};

const REST_BY_EQUIP: Record<string, number> = {
  bodyweight: 45,
  dumbbell: 60,
  barbell: 90,
  machine: 75,
  cable: 75,
  other: 60,
};

function roundW(v: number): number {
  if (v <= 0) return 0;
  const step = v >= 50 ? 5 : 2.5;
  return Math.round(v / step) * step;
}

/**
 * Genera el entrenamiento. Determinista.
 * - Elige por grupo (prioridad: benchmark → histórico reciente → nivel).
 * - Peso: benchmark 1RM > último peso de la sesión previa > conservador.
 * - Duración estimada: sets×(60 s trabajo + descanso) por ejercicio.
 */
export function generateWorkout(opts: {
  groups: string[];
  equipment_mode: EquipmentMode;
  duration_min?: number; // objetivo aprox.
  experience: Experience;
  intensity: Intensity;
  benchmarks?: BenchmarkRef[];
  exercises: ExerciseRow[];
  recent?: RecentRow[];
  exclude_ids?: string[];
}): WorkoutPlan {
  const bench = new Map((opts.benchmarks || []).map((b) => [b.exercise_id, b.estimated_1rm]));
  const recent = new Map((opts.recent || []).map((r) => [r.exercise_id, r]));
  const excluded = new Set(opts.exclude_ids || []);

  const pool = opts.exercises.filter(
    (e) => opts.groups.includes(e.muscle_group) && fitsMode(e, opts.equipment_mode) && !excluded.has(e.id),
  );

  // Prioridad por grupo (máx. 2 por grupo para no duplicar volumen).
  const byGroup = new Map<string, ExerciseRow[]>();
  for (const e of pool) {
    const arr = byGroup.get(e.muscle_group) || [];
    arr.push(e);
    byGroup.set(e.muscle_group, arr);
  }
  const rank = (e: ExerciseRow) =>
    (bench.has(e.id) ? 2 : 0) +
    (recent.has(e.id) ? 1 : 0) +
    // El modo elegido manda: en "mancuernas" prioriza mancuernas por encima
    // del matiz de nivel (el usuario pidió ese material).
    (opts.equipment_mode === 'dumbbells' && e.equipment === 'dumbbell' ? 1 : 0) +
    (e.level === opts.experience ? 0.5 : 0);
  const picked: ExerciseRow[] = [];
  for (const g of opts.groups) {
    const arr = (byGroup.get(g) || [])
      .sort((a, b) => rank(b) - rank(a) || a.name_en.localeCompare(b.name_en))
      .slice(0, 2);
    picked.push(...arr);
  }

  const [lo, hi] = REPS_BY_INTENSITY[opts.intensity];
  const reps = Math.round((lo + hi) / 2);
  const weightPer = (e: ExerciseRow): { w: number; src: WorkoutPlanExercise['weight_source'] } => {
    if (isBodyweightExercise(e)) return { w: 0, src: 'bodyweight' };
    if (bench.has(e.id)) {
      return { w: weightFromOneRm(bench.get(e.id)!, reps, opts.intensity), src: 'benchmark' };
    }
    const r = recent.get(e.id);
    if (r && r.last_weight > 0) {
      const scaled = weightFromOneRm(r.last_weight * (1 + r.last_reps / 30), reps, opts.intensity);
      return { w: roundW(scaled) || r.last_weight, src: 'history' };
    }
    return { w: roundW(conservativeOneRm(e.equipment) * (1 + reps / 30) * 0.8), src: 'conservative' };
  };

  let out: WorkoutPlanExercise[] = picked.map((e) => {
    const { w, src } = weightPer(e);
    return {
      exercise_id: e.id,
      sets: 3,
      reps,
      rest_sec: REST_BY_EQUIP[e.equipment] ?? 60,
      recommended_weight_kg: w,
      weight_source: src,
    };
  });

  // Ajusta nº de ejercicios a la duración objetivo (si se indica).
  const estMin = (ws: WorkoutPlanExercise[]) =>
    Math.ceil(ws.reduce((a, x) => a + (x.sets * (60 + x.rest_sec)) / 60, 0));
  if (opts.duration_min && out.length > 1) {
    let minutes = estMin(out);
    if (minutes > opts.duration_min + 5) {
      out = out.slice(0, Math.max(1, out.length - 1));
      minutes = estMin(out);
    }
    if (minutes < opts.duration_min - 10) {
      out = out.map((x) => ({ ...x, sets: x.sets + 1 }));
      minutes = estMin(out);
    }
  }

  return {
    id: 'w-' + Date.now().toString(36),
    muscle_groups: opts.groups,
    equipment_mode: opts.equipment_mode,
    exercises: out,
    estimated_duration_min: estMin(out),
    experience: opts.experience,
    intensity: opts.intensity,
  };
}

/**
 * Alternativas a un ejercicio con la misma finalidad (mismo grupo) y, de ser
 * posible, patrón similar (mismo tipo de equipamiento o similar).
 * Excluye: el original, los ya en la sesión/aplazados y los que no encajan
 * en el modo. Determinista por relevancia.
 */
export function suggestAlternatives(
  original: ExerciseRow | null,
  exercises: ExerciseRow[],
  opts: {
    mode: EquipmentMode;
    benchmarks?: BenchmarkRef[];
    recent?: RecentRow[];
    intensity?: Intensity;
    reps?: number;
    exclude?: string[];
    limit?: number;
  },
): ExerciseRow[] {
  if (!original) return [];
  const excluded = new Set([...(opts.exclude || []), original.id]);
  const bench = new Set((opts.benchmarks || []).map((b) => b.exercise_id));
  const recent = new Set((opts.recent || []).map((r) => r.exercise_id));
  const scored = exercises
    .filter(
      (e) =>
        !excluded.has(e.id) &&
        e.muscle_group === original.muscle_group &&
        fitsMode(e, opts.mode),
    )
    .map((e) => {
      let score = 0;
      if (e.equipment === original.equipment) score += 3;
      else if (isBodyweightExercise(e) === isBodyweightExercise(original)) score += 2;
      const shared = (e.secondary_muscles || []).filter((m) => (original.secondary_muscles || []).includes(m)).length;
      score += shared;
      if (e.level === original.level) score += 1;
      if (bench.has(e.id)) score += 1; // prefiere lo que el usuario ya domina
      if (recent.has(e.id)) score += 0.5;
      const a = original.name_en.split(/[\s,]+/);
      const b = e.name_en.split(/[\s,]+/);
      score += a.filter((w) => w.length > 3 && b.includes(w)).length * 0.5;
      return { e, score };
    })
    .sort((x, y) => y.score - x.score || x.e.name_en.localeCompare(y.e.name_en));
  return scored.slice(0, opts.limit ?? 3).map((s) => s.e);
}

/**
 * Peso recomendado para un ejercicio (usado al añadir/alternar).
 * NO reutiliza el peso de otro ejercicio a ciegas: se calcula desde el 1RM
 * propio (benchmark o histórico) o se devuelve null para entrada manual.
 */
export function weightForExercise(
  ex: ExerciseRow,
  opts: {
    benchmarks?: BenchmarkRef[];
    recent?: RecentRow[];
    mode?: EquipmentMode;
    intensity?: Intensity;
    reps?: number;
  },
): { weight_kg: number; source: WorkoutPlanExercise['weight_source'] } | null {
  const reps = opts.reps ?? 10;
  const intensity = opts.intensity ?? 'moderate';
  if (isBodyweightExercise(ex)) return { weight_kg: 0, source: 'bodyweight' };
  const b = (opts.benchmarks || []).find((x) => x.exercise_id === ex.id);
  if (b && b.estimated_1rm > 0) return { weight_kg: weightFromOneRm(b.estimated_1rm, reps, intensity), source: 'benchmark' };
  const r = (opts.recent || []).find((x) => x.exercise_id === ex.id);
  if (r && r.last_weight > 0) {
    return {
      weight_kg: roundW(weightFromOneRm(oneRm(r.last_weight, r.last_reps), reps, intensity)) || r.last_weight,
      source: 'history',
    };
  }
  const w = roundW(conservativeOneRm(ex.equipment) * (1 + reps / 30) * 0.8);
  return w > 0 ? { weight_kg: w, source: 'conservative' } : null;
}

/**
 * Ejercicios sugeridos para un benchmark (tarea 2): compuestos priorizando
 * máquinas/barra (más fáciles de dosificar), uno por patrón de grupo.
 */
export function suggestedBenchmarks(
  groups: string[],
  exercises: ExerciseRow[],
  perGroup = 3,
): string[] {
  const order: Record<string, number> = { machine: 0, barbell: 1, dumbbell: 2, cable: 3, other: 4, bodyweight: 5 };
  const out: string[] = [];
  for (const g of groups) {
    const arr = exercises
      .filter((e) => e.muscle_group === g)
      .sort((a, b) => (order[a.equipment] ?? 9) - (order[b.equipment] ?? 9) || a.name_en.localeCompare(b.name_en))
      .slice(0, perGroup);
    out.push(...arr.map((e) => e.id));
  }
  return out;
}
