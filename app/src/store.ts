/** Persistencia local (AsyncStorage), sin red.
 *  Modelo:
 *    { sessions: [ { id, date, type?, exercises: [{ exercise_id,
 *      sets: [{ reps, weight_kg, rpe? }] }], notes, duration_min,
 *      body_weight_kg, created_at } ],
 *      profile: { benchmarks: [...], experience, intensity } }
 *  `type: 'benchmark'` marca sesiones de referencia (benchmark). Los datos
 *  viejos (sin profile / sin type) se normalizan al leer.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CardioIntensity } from './lib/gym';
import type { Goal } from './lib/types';
import { currentExerciseId } from './lib/merged-ids';
import { deletePhotos, deleteAllPhotos } from './lib/sessionPhotos';

/** Ejercicios fusionados (R-119): el historial y las marcas apuntan al que queda. */
function remapSessions(list: Session[]): Session[] {
  return list.map((s) => {
    if (!Array.isArray(s.exercises)) return s;
    const byId = new Map<string, ExerciseLog>();
    for (const ex of s.exercises) {
      const id = currentExerciseId(ex.exercise_id);
      const prev = byId.get(id);
      if (prev) prev.sets = [...prev.sets, ...(ex.sets || [])];
      else byId.set(id, { ...ex, exercise_id: id, sets: [...(ex.sets || [])] });
    }
    return { ...s, exercises: [...byId.values()] };
  });
}
function remapBenchmarks<T extends BenchmarkRef>(list: T[]): T[] {
  const best = new Map<string, T>();
  for (const b of list) {
    const id = currentExerciseId(b.exercise_id);
    const prev = best.get(id);
    if (!prev || b.estimated_1rm > prev.estimated_1rm) best.set(id, { ...b, exercise_id: id });
  }
  return [...best.values()];
}

const KEY = 'fittrack.data.v1';

export interface SetLog {
  reps: number;
  weight_kg: number;
  rpe?: number | null;
  /** Serie COMPLETADA (el usuario la marcó). Sin esto, el progreso
   *  confundiría los valores sugeridos con series ya hechas. */
  done?: boolean;
  /** Cardio (Fase 12): minutos, km opcionales e intensidad. */
  duration_min?: number;
  distance_km?: number;
  intensity?: CardioIntensity;
}

export interface ExerciseLog {
  exercise_id: string;
  sets: SetLog[];
}

export type SessionType = 'training' | 'benchmark';

export interface Session {
  id: string;
  date: string; // ISO yyyy-mm-dd
  type?: SessionType;
  exercises: ExerciseLog[];
  notes?: string;
  duration_min?: number | null;
  body_weight_kg?: number | null;
  /** Altura personal en cm (opcional; se registra si el usuario la lleva). */
  height_cm?: number | null;
  /** Valoración opcional al terminar (1–5): energía del día y sensación. */
  energy?: number | null;
  feeling?: number | null;
  created_at?: string;
  /** Fase 15: ids de fotos (cada una en su clave; ver lib/sessionPhotos). */
  photos?: string[];
  /** Fase 15: comentarios propios en el diario. */
  comments?: SessionComment[];
}

export interface SessionComment {
  id: string;
  text: string;
  at: string; // ISO
}

export interface Benchmark {
  exercise_id: string;
  estimated_1rm: number;
  weight_kg: number | null; // set origen (null = 1RM manual)
  reps: number | null;
  date: string;
}

export type BenchmarkRef = { exercise_id: string; estimated_1rm: number };

export type Experience = 'beginner' | 'intermediate' | 'advanced';
export type Intensity = 'low' | 'moderate' | 'high';

/** Entrada del perfil para datos que evolucionan en el tiempo (altura). */
export interface ProfileEntry {
  date: string; // ISO yyyy-mm-dd
  value: number; // cm
}

export type Sex = 'male' | 'female' | 'other';

export interface Profile {
  benchmarks: Benchmark[];
  experience: Experience;
  intensity: Intensity;
  /** Alturas registradas (la última = la actual). Opcional. */
  height_entries?: ProfileEntry[];
  /** Pesos registrados desde Perfil (además del peso anotado en sesiones). */
  weight_entries?: ProfileEntry[];
  /** Datos fijos (Fase 12), todos opcionales. */
  sex?: Sex;
  birth_year?: number;
  goal?: Goal;
}

export interface Data {
  sessions: Session[];
  profile: Profile;
}

export function emptyData(): Data {
  return { sessions: [], profile: { benchmarks: [], experience: 'beginner', intensity: 'moderate' } };
}

function migrate(d: Partial<Data> | null): Data {
  const base = emptyData();
  if (!d) return base;
  const out: Data = {
    sessions: Array.isArray(d.sessions) ? remapSessions(d.sessions) : [],
    profile: { ...base.profile },
  };
  if (d.profile) {
    // Conserva TODOS los campos del perfil (antes se perdían height_entries
    // en cada lectura y solo sobrevivía la última altura).
    out.profile = {
      ...base.profile,
      ...d.profile,
      benchmarks: Array.isArray(d.profile.benchmarks) ? remapBenchmarks(d.profile.benchmarks) : [],
      experience: d.profile.experience || base.profile.experience,
      intensity: d.profile.intensity || base.profile.intensity,
    };
  }
  return out;
}

async function read(): Promise<Data> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return emptyData();
    return migrate(JSON.parse(raw));
  } catch {
    return emptyData();
  }
}

async function write(data: Data): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // storage no disponible: la app sigue en memoria.
  }
}

export const store = {
  async all(): Promise<Data> {
    return read();
  },
  async sessions(): Promise<Session[]> {
    return (await read()).sessions;
  },
  async profile(): Promise<Profile> {
    return (await read()).profile;
  },
  /** Benchmarks (1RM por ejercicio) como lista compacta para la UI. */
  async benchmarks(): Promise<BenchmarkRef[]> {
    return (await read()).profile.benchmarks.map((b) => ({
      exercise_id: b.exercise_id,
      estimated_1rm: b.estimated_1rm,
    }));
  },
  /** Guarda/actualiza los 1RM de varios ejercicios de golpe (al terminar
   *  un benchmark: toma el mejor de cada ejercicio y lo sobreescribe). */
  async setBenchmarks(entries: BenchmarkRef[]): Promise<Profile> {
    const d = await read();
    const now = new Date().toISOString();
    const byId = new Map(d.profile.benchmarks.map((b) => [b.exercise_id, b]));
    for (const e of entries) {
      const prev = byId.get(e.exercise_id);
      byId.set(e.exercise_id, {
        exercise_id: e.exercise_id,
        estimated_1rm: e.estimated_1rm,
        weight_kg: prev?.weight_kg ?? null,
        reps: prev?.reps ?? null,
        date: now.slice(0, 10),
      });
    }
    d.profile.benchmarks = [...byId.values()];
    await write(d);
    return d.profile;
  },
  /** Borra un benchmark por ejercicio. */
  async removeBenchmark(exerciseId: string): Promise<Profile> {
    const d = await read();
    d.profile.benchmarks = d.profile.benchmarks.filter((b) => b.exercise_id !== exerciseId);
    await write(d);
    return d.profile;
  },
  /** Alturas registradas, de la más reciente a la más antigua. */
  async heightHistory(): Promise<ProfileEntry[]> {
    const p = (await read()).profile;
    return (p.height_entries || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  },
  /** Registra una altura (reemplaza la del mismo día; la actual = la última). */
  async logHeight(value: number, date: string): Promise<Profile> {
    const d = await read();
    const entries = (d.profile.height_entries || []).filter((e) => e.date !== date);
    entries.push({ date, value });
    entries.sort((a, b) => (a.date < b.date ? 1 : -1));
    d.profile.height_entries = entries;
    await write(d);
    return d.profile;
  },
  /** Pesos registrados desde Perfil, del más reciente al más antiguo. */
  async weightHistory(): Promise<ProfileEntry[]> {
    const p = (await read()).profile;
    return (p.weight_entries || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  },
  /** Registra un peso corporal (reemplaza el del mismo día). */
  async logWeight(value: number, date: string): Promise<Profile> {
    const d = await read();
    const entries = (d.profile.weight_entries || []).filter((e) => e.date !== date);
    entries.push({ date, value });
    entries.sort((a, b) => (a.date < b.date ? 1 : -1));
    d.profile.weight_entries = entries;
    await write(d);
    return d.profile;
  },
  async addSession(s: Session): Promise<void> {
    const d = await read();
    d.sessions.push(s);
    await write(d);
  },
  async deleteSession(id: string): Promise<void> {
    const d = await read();
    const gone = d.sessions.find((x) => x.id === id);
    d.sessions = d.sessions.filter((x) => x.id !== id);
    await write(d);
    if (gone?.photos?.length) await deletePhotos(gone.photos);
  },
  /** Cambia campos de una sesión (fotos, comentarios). */
  async updateSession(id: string, patch: Partial<Pick<Session, 'photos' | 'comments'>>): Promise<Session | null> {
    const d = await read();
    const i = d.sessions.findIndex((x) => x.id === id);
    if (i < 0) return null;
    d.sessions[i] = { ...d.sessions[i], ...patch };
    await write(d);
    return d.sessions[i];
  },
  /** Actualiza el perfil (experiencia, intensidad). */
  async setProfile(p: Partial<Profile>): Promise<Profile> {
    const d = await read();
    d.profile = { ...d.profile, ...p, benchmarks: d.profile.benchmarks };
    await write(d);
    return d.profile;
  },
  /** JSON completo de los datos (exportación). */
  async toJson(): Promise<string> {
    const d = await read();
    return JSON.stringify({ app: 'fittrack', version: 1, exported_at: new Date().toISOString(), ...d }, null, 2);
  },
  /** Borra TODOS los datos (sesiones y perfil incluidos). */
  async clearAll(): Promise<void> {
    await write(emptyData());
    await deleteAllPhotos();
  },
};
