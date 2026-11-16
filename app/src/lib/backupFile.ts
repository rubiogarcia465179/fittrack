/**
 * Copia de seguridad — iOS/Android (Fase 16, R-124). Sin dependencias nuevas
 * aparte de `expo-file-system` (aprobada):
 *  - Guardar: se escribe el archivo y se abre la hoja de compartir del
 *    sistema (iOS: "Guardar en Archivos", iCloud Drive, AirDrop…). En Android
 *    `Share` no acepta archivos, así que se elige una carpeta (SAF).
 *  - Restaurar: selector de archivos del sistema (`File.pickFileAsync`).
 * La web usa `backupFile.web.ts` (descarga + <input type="file">).
 */
import { Platform, Share } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';

/** true = guardado/compartido; false = cancelado o error. */
export async function saveBackupFile(name: string, json: string): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      const dir = await Directory.pickDirectoryAsync();
      const f = dir.createFile(name, 'application/json');
      f.write(json);
      return true;
    }
    const f = new File(Paths.cache, name);
    if (f.exists) f.delete();
    f.create();
    f.write(json);
    const r = await Share.share({ url: f.uri, title: name });
    return r.action === Share.sharedAction;
  } catch {
    return false;
  }
}

/** Texto del archivo elegido, o null si se cancela. */
export async function pickBackupFile(): Promise<string | null> {
  try {
    const r = await File.pickFileAsync({ mimeTypes: ['application/json', 'text/plain', '*/*'] });
    if (r.canceled || !r.result) return null;
    return await r.result.text();
  } catch {
    return null;
  }
}
