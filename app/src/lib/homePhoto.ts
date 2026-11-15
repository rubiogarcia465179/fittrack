/**
 * Foto de cabecera de Inicio. Se elige en Perfil ("Foto de Inicio") y se
 * guarda como data URL; si no hay, se usa la de la app (HERO_IMG).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const HOME_PHOTO_KEY = 'fittrack.homephoto.v1';
export const HERO_IMG = require('../../assets/session-hero.jpg');

export async function loadHomePhoto(): Promise<string | null> {
  try {
    return (await AsyncStorage.getItem(HOME_PHOTO_KEY)) || null;
  } catch {
    return null;
  }
}

/** Guarda (uri) o restablece la foto de la app (null). */
export async function saveHomePhoto(uri: string | null): Promise<void> {
  try {
    if (uri) await AsyncStorage.setItem(HOME_PHOTO_KEY, uri);
    else await AsyncStorage.removeItem(HOME_PHOTO_KEY);
  } catch {
    /* sin espacio: se queda en memoria hasta el próximo arranque */
  }
}
