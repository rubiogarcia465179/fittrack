/** Hápticos (expo-haptics, aprobado por el usuario 2026-11-15).
 *  En web no hacen nada (y nunca rompen: errores silenciados). */
import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

/** Toque ligero: marcar una serie como hecha. */
export function tapLight() {
  if (Platform.OS === 'web') {
    primeWebAlerts(); // el toque del usuario desbloquea el aviso del descanso
    return;
  }
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

/** Éxito: sesión guardada. */
export function success() {
  if (Platform.OS === 'web') return;
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

// ---- Web (R-159): el iPhone no tiene API de vibración en Safari. Al acabar
// el descanso: vibración donde exista (Android), el "toque" háptico de iOS 18+
// (un interruptor nativo <input switch> que se activa) y un pitido corto con
// Web Audio (el audio se desbloquea con el primer toque del usuario).
let audio: AudioContext | null = null;
let iosSwitch: HTMLLabelElement | null = null;

/** Llamar dentro de un toque del usuario (p. ej. "Serie hecha"): prepara audio y háptico. */
export function primeWebAlerts() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  try {
    const AC = (globalThis as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
      || (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!audio && AC) audio = new AC();
    if (audio && audio.state === 'suspended') void audio.resume();
  } catch {
    audio = null;
  }
  if (!iosSwitch) {
    try {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('switch', '');
      label.appendChild(input);
      label.setAttribute('aria-hidden', 'true');
      label.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none;';
      document.body.appendChild(label);
      iosSwitch = label;
    } catch {
      iosSwitch = null;
    }
  }
}

function beep() {
  if (!audio) return;
  try {
    const t0 = audio.currentTime;
    [0, 0.28].forEach((d) => {
      const o = audio!.createOscillator();
      const g = audio!.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, t0 + d);
      g.gain.exponentialRampToValueAtTime(0.35, t0 + d + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.2);
      o.connect(g).connect(audio!.destination);
      o.start(t0 + d);
      o.stop(t0 + d + 0.22);
    });
  } catch {
    /* sin audio */
  }
}

/** Fin del descanso: vibración clara (dos pulsos) + háptico de éxito, para
 *  notarlo con el móvil en el bolsillo. Web: vibración, háptico iOS y pitido. */
export function restDone() {
  if (Platform.OS === 'web') {
    try {
      (globalThis.navigator as Navigator | undefined)?.vibrate?.([300, 150, 300]);
    } catch {
      /* sin vibración en este navegador */
    }
    try {
      iosSwitch?.click();
      setTimeout(() => iosSwitch?.click(), 180);
    } catch {
      /* sin háptico */
    }
    beep();
    return;
  }
  // Android respeta el patrón; iOS vibra con su patrón fijo.
  Vibration.vibrate(Platform.OS === 'android' ? [0, 400, 180, 400] : 400);
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}
