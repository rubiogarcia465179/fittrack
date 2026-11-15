/**
 * Marcas personales (1RM estimado) — una sola fuente para Inicio, Perfil,
 * el calendario y el generador de entrenos.
 *
 * - Marca manual: la que el usuario pone en Perfil (profile.benchmarks).
 * - Marca de sesiones: la mejor serie guardada, 1RM por Epley.
 * - Marca efectiva = la mayor de las dos (si superas tu marca entrenando,
 *   manda el dato almacenado).
 * - Día de récord: una sesión que supera la mejor marca previa (manual o de
 *   sesiones anteriores). La primera vez que haces un ejercicio NO cuenta:
 *   tiene que haber algo que batir.
 */
import { oneRm } from './gym';
import type { Session, BenchmarkRef } from '../store';

export type RecordSource = 'manual' | 'sessions';
export interface RecordRow {
  exercise_id: string;
  kg: number; // efectiva, redondeada a 0,5
  source: RecordSource;
  manual: number | null;
  best: number | null; // de sesiones
  best_date: string | null;
}

const r05 = (v: number) => Math.round(v * 2) / 2;

/**
 * Test "Establecer marcas": los 5 levantamientos clásicos, los que todo el
 * mundo conoce y puede comparar con sus amigos (petición del usuario), igual
 * para todos los niveles (el principiante empieza con menos peso):
 * press de banca, sentadilla, peso muerto, press militar y curl de bíceps.
 */
export const BENCHMARK_TEST = ['bench_press', 'back_squat', 'deadlifts', 'military_press_1', 'biceps_curls_with_barbell'];

/** Mejor 1RM por ejercicio en una sesión (sin cardio). */
function sessionBest(s: Session, isCardio: (id: string) => boolean): Map<string, number> {
  const m = new Map<string, number>();
  for (const ex of s.exercises) {
    if (isCardio(ex.exercise_id)) continue;
    for (const st of ex.sets) {
      const v = oneRm(st.weight_kg, st.reps);
      if (v > (m.get(ex.exercise_id) ?? 0)) m.set(ex.exercise_id, v);
    }
  }
  return m;
}

/** Orden cronológico estable (fecha y, a igualdad, hora de guardado). */
function chrono(sessions: Session[]): Session[] {
  return sessions
    .slice()
    .sort((a, b) => (a.date === b.date ? String(a.created_at || '').localeCompare(String(b.created_at || '')) : a.date < b.date ? -1 : 1));
}

export function effectiveRecords(
  sessions: Session[],
  manual: BenchmarkRef[],
  isCardio: (id: string) => boolean,
): Map<string, RecordRow> {
  const out = new Map<string, RecordRow>();
  for (const b of manual) {
    if (b.estimated_1rm > 0) {
      out.set(b.exercise_id, { exercise_id: b.exercise_id, kg: r05(b.estimated_1rm), source: 'manual', manual: b.estimated_1rm, best: null, best_date: null });
    }
  }
  for (const s of chrono(sessions)) {
    for (const [id, v] of sessionBest(s, isCardio)) {
      const cur = out.get(id) ?? { exercise_id: id, kg: 0, source: 'sessions' as RecordSource, manual: null, best: null, best_date: null };
      if (v > (cur.best ?? 0)) {
        cur.best = v;
        cur.best_date = s.date;
      }
      const eff = Math.max(cur.manual ?? 0, cur.best ?? 0);
      cur.kg = r05(eff);
      cur.source = (cur.best ?? 0) > (cur.manual ?? 0) ? 'sessions' : 'manual';
      out.set(id, cur);
    }
  }
  return out;
}

/** Días (yyyy-mm-dd) en que se batió una marca previa. */
export function recordDays(
  sessions: Session[],
  manual: BenchmarkRef[],
  isCardio: (id: string) => boolean,
): Set<string> {
  const best = new Map<string, number>(manual.filter((b) => b.estimated_1rm > 0).map((b) => [b.exercise_id, b.estimated_1rm]));
  const days = new Set<string>();
  for (const s of chrono(sessions)) {
    for (const [id, v] of sessionBest(s, isCardio)) {
      const prev = best.get(id) ?? 0;
      if (prev > 0 && r05(v) > r05(prev)) days.add(s.date);
      if (v > prev) best.set(id, v);
    }
  }
  return days;
}

/** Marcas efectivas como BenchmarkRef[] para el generador de entrenos. */
export function recordsAsBenchmarks(rows: Map<string, RecordRow>): BenchmarkRef[] {
  return [...rows.values()].filter((r) => r.kg > 0).map((r) => ({ exercise_id: r.exercise_id, estimated_1rm: r.kg }));
}
