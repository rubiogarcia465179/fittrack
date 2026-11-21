/**
 * Web sin historial (R-150): una sola pregunta — cuánto levantas en press de
 * banca — da el nivel y una marca estimada (1RM) para cada ejercicio con carga.
 * Con eso el generador recomienda peso, series y repeticiones según el
 * objetivo. Solo lo usa la web pública (WebPlanner), que no guarda nada.
 *
 * Los cocientes son aproximaciones prudentes de tablas de fuerza habituales
 * (press de banca = 1). En mancuernas el peso es POR MANO. Se prefiere quedarse
 * corto: el usuario sube peso al ver que le sobra.
 */
import type { BenchmarkRef } from './workout';
import type { ExerciseRow, Experience, Intensity } from './types';

/** Peso de banca que se elige en la web (kg para ~8 repeticiones). */
export const BENCH_CHOICES = [20, 40, 60, 80, 100] as const;
/** Repeticiones a las que se refiere la pregunta. */
export const BENCH_REPS = 8;

/** 1RM estimado (Epley) a partir de peso × repeticiones. */
export function benchOneRm(kg: number, reps = BENCH_REPS): number {
  return kg > 0 ? kg * (1 + reps / 30) : 0;
}

/** Nivel según el 1RM de banca (sin pedir peso corporal: umbrales prudentes). */
export function levelFromBench(oneRm: number): Experience {
  if (oneRm < 45) return 'beginner';
  if (oneRm < 95) return 'intermediate';
  return 'advanced';
}

/** Series según nivel: principiante una menos (mín. 2), avanzado una más. */
export function setsForLevel(base: number, level: Experience): number {
  return level === 'beginner' ? Math.max(2, base - 1) : level === 'advanced' ? base + 1 : base;
}

/** Intensidad según nivel: el principiante empieza suave. */
export function intensityForLevel(level: Experience): Intensity {
  return level === 'beginner' ? 'low' : level === 'advanced' ? 'high' : 'moderate';
}

/** [patrón del nombre en inglés, cociente respecto al 1RM de banca]. El primero que encaja manda. */
const RATIOS: Array<[RegExp, Partial<Record<string, number>>]> = [
  // [patrón, cociente por material]
  [/calf/i, { machine: 1.0, barbell: 0.8, dumbbell: 0.3, other: 0.6 }],
  [/leg press|hack/i, { machine: 1.8, barbell: 0.9, other: 1.5 }],
  [/leg curl|leg extension/i, { machine: 0.45, cable: 0.3, other: 0.4 }],
  [/deadlift|good morning|rack pull/i, { barbell: 1.3, dumbbell: 0.4, other: 0.9 }],
  [/hip thrust|glute bridge/i, { barbell: 1.2, machine: 1.0, dumbbell: 0.4 }],
  [/squat/i, { barbell: 1.1, dumbbell: 0.3, machine: 1.2, other: 0.5 }],
  [/lunge|split|step/i, { barbell: 0.55, dumbbell: 0.22, other: 0.3 }],
  [/fly|flye|butterfly|cross.?over/i, { dumbbell: 0.16, cable: 0.22, machine: 0.5 }],
  [/incline.*press|press.*incline/i, { barbell: 0.85, dumbbell: 0.34, machine: 0.8 }],
  [/decline.*press/i, { barbell: 1.0, dumbbell: 0.4 }],
  [/shoulder press|military|overhead press|push press|arnold/i, { barbell: 0.6, dumbbell: 0.24, machine: 0.6 }],
  [/close.?grip/i, { barbell: 0.85, dumbbell: 0.32, machine: 0.75 }],
  [/bench press|chest press|benchpress|floor press/i, { barbell: 1.0, dumbbell: 0.38, machine: 0.85 }],
  [/pullover/i, { dumbbell: 0.25, barbell: 0.3 }],
  [/shrug/i, { barbell: 1.0, dumbbell: 0.4 }],
  [/upright row/i, { barbell: 0.45, dumbbell: 0.18, cable: 0.4 }],
  [/pull.?down|pulldown/i, { cable: 0.75, machine: 0.75 }],
  [/row/i, { barbell: 0.75, dumbbell: 0.35, cable: 0.7, machine: 0.75, other: 0.6 }],
  [/lateral|front raise|rear delt|reverse fly|face ?pull|raise/i, { dumbbell: 0.09, cable: 0.1, machine: 0.3 }],
  [/hammer|curl/i, { barbell: 0.4, dumbbell: 0.17, cable: 0.35, machine: 0.4, other: 0.35 }],
  [/kickback/i, { dumbbell: 0.08, cable: 0.12 }],
  [/tricep|skull|french|extension|pushdown/i, { barbell: 0.35, dumbbell: 0.14, cable: 0.35, machine: 0.4, other: 0.3 }],
  [/crunch|woodchop|rotation|oblique/i, { cable: 0.35, machine: 0.4, dumbbell: 0.15, other: 0.2 }],
];
/** Si el nombre no encaja con nada: por material. */
const DEFAULT_RATIO: Record<string, number> = { barbell: 0.6, dumbbell: 0.2, machine: 0.6, cable: 0.4, other: 0.3 };

/** Cociente respecto al 1RM de banca para un ejercicio (null = sin carga). */
export function benchRatio(e: Pick<ExerciseRow, 'name_en' | 'equipment'>): number | null {
  if (e.equipment === 'bodyweight') return null;
  for (const [re, by] of RATIOS) {
    if (!re.test(e.name_en)) continue;
    const r = by[e.equipment] ?? by.other;
    if (r != null) return r;
  }
  return DEFAULT_RATIO[e.equipment] ?? DEFAULT_RATIO.other;
}

/** Marcas estimadas (1RM) para todos los ejercicios con carga a partir de la banca. */
/** `isBodyweight`: el clasificador de la app (`isBodyweightExercise`), para no dar marca a lo que no lleva carga. */
export function benchmarksFromBench(benchKg: number, exercises: ExerciseRow[], isBodyweight: (e: ExerciseRow) => boolean = () => false, reps = BENCH_REPS): BenchmarkRef[] {
  const one = benchOneRm(benchKg, reps);
  if (!one) return [];
  const out: BenchmarkRef[] = [];
  for (const e of exercises) {
    if (isBodyweight(e)) continue;
    const r = benchRatio(e);
    if (r) out.push({ exercise_id: e.id, estimated_1rm: Math.round(one * r * 10) / 10 });
  }
  return out;
}
