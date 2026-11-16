/**
 * Fotos de las sesiones — iOS/Android (Fase 16, R-126).
 * Cada foto es un ARCHIVO JPEG en `<documentos>/photos/<id>.jpg`
 * (`expo-file-system`, aprobado por el usuario 2026-11-16). La sesión solo
 * guarda los ids. Así las fotos no llenan AsyncStorage (límite en Android).
 *
 * Migración: las fotos de la Fase 15 vivían como data URL en AsyncStorage
 * (`fittrack.photo.<id>`). Al cargarlas por primera vez se pasan a archivo y
 * se borra la clave vieja; el id no cambia.
 *
 * La web usa `sessionPhotos.web.ts` (localStorage), con la misma API.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';

const LEGACY_PREFIX = 'fittrack.photo.';

function dir(): Directory {
  const d = new Directory(Paths.document, 'photos');
  if (!d.exists) d.create({ intermediates: true, idempotent: true });
  return d;
}
const fileOf = (id: string) => new File(dir(), `${id}.jpg`);
const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const safeId = (id: string) => /^[a-z0-9_-]{1,64}$/i.test(id);

/** Base64 de un data URL (o null si no lo es). */
function base64Of(dataUrl: string): string | null {
  const m = /^data:image\/[a-z+]+;base64,(.+)$/i.exec(dataUrl);
  return m ? m[1] : null;
}

async function writeAs(id: string, src: string): Promise<boolean> {
  try {
    const f = fileOf(id);
    const b64 = base64Of(src);
    if (b64) {
      if (f.exists) f.delete();
      f.create();
      f.write(b64, { encoding: 'base64' });
    } else {
      // Uri de archivo (sin base64): se copia.
      if (f.exists) f.delete();
      new File(src).copySync(f);
    }
    return f.exists;
  } catch {
    return false;
  }
}

/** Guarda una foto (data URL o uri de archivo). Devuelve su id o null. */
export async function savePhoto(src: string): Promise<string | null> {
  const id = newId();
  return (await writeAs(id, src)) ? id : null; // sin espacio: no se añade
}

/** Uris listas para <Image source={{ uri }} />. */
export async function loadPhotos(ids: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const id of ids) {
    if (!safeId(id)) continue;
    try {
      const f = fileOf(id);
      if (f.exists) {
        out[id] = f.uri;
        continue;
      }
      const legacy = await AsyncStorage.getItem(LEGACY_PREFIX + id);
      if (legacy && (await writeAs(id, legacy))) {
        await AsyncStorage.removeItem(LEGACY_PREFIX + id);
        out[id] = fileOf(id).uri;
      }
    } catch {
      /* foto ilegible: no se muestra (nunca una imagen rota) */
    }
  }
  return out;
}

export async function deletePhotos(ids: string[]): Promise<void> {
  for (const id of ids) {
    if (!safeId(id)) continue;
    try {
      const f = fileOf(id);
      if (f.exists) f.delete();
    } catch {
      /* nada */
    }
  }
  try {
    if (ids.length) await AsyncStorage.multiRemove(ids.map((i) => LEGACY_PREFIX + i));
  } catch {
    /* nada */
  }
}

/** "Borrar todos los datos": también las fotos. */
export async function deleteAllPhotos(): Promise<void> {
  try {
    const d = new Directory(Paths.document, 'photos');
    if (d.exists) d.delete();
  } catch {
    /* nada */
  }
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(LEGACY_PREFIX));
    if (keys.length) await AsyncStorage.multiRemove(keys);
  } catch {
    /* nada */
  }
}

/** Copia de seguridad: id → data URL JPEG (las que se puedan leer). */
export async function exportPhotos(ids: string[]): Promise<Record<string, string>> {
  await loadPhotos(ids); // migra las viejas antes de leer
  const out: Record<string, string> = {};
  for (const id of ids) {
    if (!safeId(id)) continue;
    try {
      const f = fileOf(id);
      if (f.exists) out[id] = `data:image/jpeg;base64,${await f.base64()}`;
    } catch {
      /* nada */
    }
  }
  return out;
}

/** Restaurar: escribe cada foto con SU id. Devuelve cuántas se guardaron. */
export async function importPhotos(map: Record<string, string>): Promise<number> {
  let n = 0;
  for (const [id, src] of Object.entries(map)) {
    if (safeId(id) && base64Of(src) && (await writeAs(id, src))) n++;
  }
  return n;
}
