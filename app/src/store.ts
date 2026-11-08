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

const KEY = 'fittrack.data.v1';

export interface SetLog {
  reps: number;
  weight_kg: number;
  rpe?: number | null;
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
  created_at?: string;
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

export interface Profile {
  benchmarks: Benchmark[];
  experience: Experience;
  intensity: Intensity;
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
    sessions: Array.isArray(d.sessions) ? d.sessions : [],
    profile: { ...base.profile },
  };
  if (d.profile) {
    out.profile = {
      benchmarks: Array.isArray(d.profile.benchmarks) ? d.profile.benchmarks : [],
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
  async addSession(s: Session): Promise<void> {
    const d = await read();
    d.sessions.push(s);
    await write(d);
  },
  async deleteSession(id: string): Promise<void> {
    const d = await read();
    d.sessions = d.sessions.filter((x) => x.id !== id);
    await write(d);
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
  },
};
