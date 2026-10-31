/** Persistencia local (AsyncStorage), sin red.
 *  Modelo (igual que la web):
 *    { sessions: [ { id, date, exercises: [{ exercise_id,
 *      sets: [{ reps, weight_kg, rpe? }] }], notes, duration_min,
 *      body_weight_kg, created_at } ] }
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

export interface Session {
  id: string;
  date: string; // ISO yyyy-mm-dd
  exercises: ExerciseLog[];
  notes?: string;
  duration_min?: number | null;
  body_weight_kg?: number | null;
  created_at?: string;
}

export interface Data {
  sessions: Session[];
}

export function emptyData(): Data {
  return { sessions: [] };
}

async function read(): Promise<Data> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return emptyData();
    const d = JSON.parse(raw) as Data;
    if (!Array.isArray(d.sessions)) d.sessions = [];
    return d;
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
};
