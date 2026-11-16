/**
 * Fotos de las sesiones — WEB (Fase 15; API común con `sessionPhotos.ts`).
 * Cada foto es un data URL JPEG en SU PROPIA clave de localStorage
 * (`fittrack.photo.<id>`): el JSON principal (sesiones) sigue pequeño.
 * La sesión solo guarda los ids. En iOS/Android son archivos (Fase 16).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'fittrack.photo.';

export async function savePhoto(dataUrl: string): Promise<string | null> {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  try {
    await AsyncStorage.setItem(PREFIX + id, dataUrl);
    return id;
  } catch {
    return null; // sin espacio: no se añade (nunca una foto rota)
  }
}

export async function loadPhotos(ids: string[]): Promise<Record<string, string>> {
  if (!ids.length) return {};
  try {
    const pairs = await AsyncStorage.multiGet(ids.map((i) => PREFIX + i));
    const out: Record<string, string> = {};
    for (const [k, v] of pairs) if (v) out[k.slice(PREFIX.length)] = v;
    return out;
  } catch {
    return {};
  }
}

export async function deletePhotos(ids: string[]): Promise<void> {
  if (!ids.length) return;
  try {
    await AsyncStorage.multiRemove(ids.map((i) => PREFIX + i));
  } catch {
    /* nada */
  }
}

/** "Borrar todos los datos": también las fotos. */
export async function deleteAllPhotos(): Promise<void> {
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
    if (keys.length) await AsyncStorage.multiRemove(keys);
  } catch {
    /* nada */
  }
}

const safeId = (id: string) => /^[a-z0-9_-]{1,64}$/i.test(id);

/** Copia de seguridad: id → data URL JPEG. */
export async function exportPhotos(ids: string[]): Promise<Record<string, string>> {
  return loadPhotos(ids.filter(safeId));
}

/** Restaurar: escribe cada foto con SU id. Devuelve cuántas se guardaron. */
export async function importPhotos(map: Record<string, string>): Promise<number> {
  let n = 0;
  for (const [id, src] of Object.entries(map)) {
    if (!safeId(id) || !/^data:image\//.test(src)) continue;
    try {
      await AsyncStorage.setItem(PREFIX + id, src);
      n++;
    } catch {
      /* sin espacio */
    }
  }
  return n;
}
