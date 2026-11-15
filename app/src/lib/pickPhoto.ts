/** Elegir una foto — iOS/Android con `expo-image-picker` (aprobado por el
 *  usuario 2026-11-15). Devuelve un data URL JPEG (reducido) o null.
 *  Se guarda como data URL para no depender de la caché temporal del sistema. */
import * as ImagePicker from 'expo-image-picker';

export const canPickPhoto = true;

export async function pickPhoto(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.6,
    base64: true,
  });
  if (res.canceled || !res.assets?.length) return null;
  const a = res.assets[0];
  return a.base64 ? `data:image/jpeg;base64,${a.base64}` : a.uri;
}
