/**
 * Fotos de las sesiones (Fase 15, InstaGym).
 * Cada foto es un data URL JPEG en SU PROPIA clave de AsyncStorage
 * (`fittrack.photo.<id>`): el JSON principal (sesiones) sigue pequeño y la
 * exportación no arrastra imágenes. La sesión solo guarda los ids.
 * ⛔ Pasar a archivos con `expo-file-system` necesita aprobación (dependencia).
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
