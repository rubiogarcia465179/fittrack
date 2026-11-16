/**
 * Aviso de fin del descanso con el móvil BLOQUEADO o la app en segundo plano
 * (Fase 16, R-125). Notificación local programada a la hora exacta en que
 * acaba el descanso (`expo-notifications`, aprobado 2026-11-16). Sin
 * servidor ni token: todo en el teléfono.
 *
 * - El permiso se pide la PRIMERA vez que empieza un descanso (cuando tiene
 *   sentido), nunca al abrir la app. Si se niega, todo sigue igual: el aviso
 *   en pantalla y la vibración de siempre.
 * - Con la app abierta no se muestra el banner (ya avisan la pantalla y la
 *   vibración): solo cuenta cuando no estás mirando.
 * - Cada cambio del descanso (+15 s, Saltar, fin) cancela el aviso anterior.
 * La web usa `restAlert.web.ts` (no hace nada).
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const CHANNEL = 'rest';
let scheduledId: string | null = null;
let ready: Promise<boolean> | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function setup(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Rest timer',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 400, 180, 400],
        sound: 'default',
      });
    }
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    if (!cur.canAskAgain) return false;
    const req = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true, allowBadge: false },
    });
    return req.granted;
  } catch {
    return false;
  }
}

/** Programa el aviso para `at` (ms). Sustituye al anterior. */
export async function scheduleRestAlert(at: number, title: string, body?: string): Promise<void> {
  await cancelRestAlert();
  if (at <= Date.now() + 1000) return;
  if (!ready) ready = setup();
  if (!(await ready)) {
    ready = null; // se reintenta la próxima vez (por si lo activa en Ajustes)
    return;
  }
  try {
    scheduledId = await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: 'default' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL },
    });
  } catch {
    scheduledId = null;
  }
}

export async function cancelRestAlert(): Promise<void> {
  const id = scheduledId;
  scheduledId = null;
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    /* ya salió o no existe */
  }
}
