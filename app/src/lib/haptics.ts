/** Hápticos (expo-haptics, aprobado por el usuario 2026-11-15).
 *  En web no hacen nada (y nunca rompen: errores silenciados). */
import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

/** Toque ligero: marcar una serie como hecha. */
export function tapLight() {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

/** Éxito: sesión guardada. */
export function success() {
  if (Platform.OS === 'web') return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

/** Fin del descanso: vibración clara (dos pulsos) + háptico de éxito, para
 *  notarlo con el móvil en el bolsillo. Web: API de vibración si existe. */
export function restDone() {
  if (Platform.OS === 'web') {
    try {
      (globalThis.navigator as Navigator | undefined)?.vibrate?.([300, 150, 300]);
    } catch {
      /* sin vibración en este navegador */
    }
    return;
  }
  // Android respeta el patrón; iOS vibra con su patrón fijo.
  Vibration.vibrate(Platform.OS === 'android' ? [0, 400, 180, 400] : 400);
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}
