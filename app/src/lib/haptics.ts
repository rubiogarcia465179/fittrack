/** Hápticos (expo-haptics, aprobado por el usuario 2026-11-15).
 *  En web no hacen nada (y nunca rompen: errores silenciados). */
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/** Toque ligero: marcar una serie como hecha. */
export function tapLight() {
  if (Platform.OS === 'web') return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

/** Éxito: fin del descanso, sesión guardada. */
export function success() {
  if (Platform.OS === 'web') return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}
