/**
 * Qué toca hoy: los bloques de grupos (empuje / tirón / pierna) ordenados
 * por "hace más tiempo que no lo entrenas". Lo usan Inicio ("Hoy toca …") y
 * la hoja rápida, así que siempre dicen lo mismo.
 *
 * - Por defecto se propone el primero (sin decidir nada: cero fatiga de
 *   decisión). "Cambiar" en Inicio pasa al siguiente con un toque.
 * - Lunes: el empuje (pecho) va al final — en muchos gimnasios el lunes es
 *   "el día de pecho" y los bancos están llenos (convención popular, no un
 *   dato medido). Si todo lo demás está muy reciente, sigue disponible con
 *   "Cambiar".
 */
import type { Session } from '../store';

export const SPLITS: string[][] = [
  ['chest', 'shoulders', 'arms'],
  ['back', 'arms'],
  ['legs', 'core'],
];
const PUSH = 0;

/** Bloques en orden de propuesta (el primero = el de hoy por defecto). */
export function orderedSplits(sessions: Session[], groupOf: Map<string, string>, today: Date = new Date(), mondayRule = true): string[][] {
  // sessions: de más reciente a más antigua.
  const lastDate = (groups: string[]) => {
    for (const s of sessions) {
      if (s.exercises.some((x) => groups.includes(groupOf.get(x.exercise_id) || ''))) return s.date;
    }
    return '0000-00-00';
  };
  const order = SPLITS.map((g, i) => ({ g, i, last: lastDate(g) })).sort((a, b) => (a.last < b.last ? -1 : a.last > b.last ? 1 : a.i - b.i));
  if (mondayRule && today.getDay() === 1) {
    const k = order.findIndex((o) => o.i === PUSH);
    if (k >= 0) order.push(...order.splice(k, 1));
  }
  return order.map((o) => o.g);
}

/** El bloque de hoy; `skip` = cuántas veces se tocó "Cambiar". */
export function nextSplit(sessions: Session[], groupOf: Map<string, string>, skip = 0, today: Date = new Date()): string[] {
  const o = orderedSplits(sessions, groupOf, today);
  return o[((skip % o.length) + o.length) % o.length];
}

/** ¿Se apartó el pecho por ser lunes? Solo si, sin la regla, hoy tocaba
 *  empuje (para explicarlo en una línea, nunca de más). */
export function mondayPushSkipped(sessions: Session[], groupOf: Map<string, string>, today: Date = new Date()): boolean {
  return today.getDay() === 1 && orderedSplits(sessions, groupOf, today, false)[0] === SPLITS[PUSH];
}

/** "Pecho, hombros y brazos" en el idioma de la app. */
export function splitLabel(groups: string[], t: (k: string) => string): string {
  const names = groups.map((g, i) => {
    const n = t(`group_${g}`);
    return i === 0 ? n : n.toLocaleLowerCase();
  });
  if (names.length < 2) return names.join('');
  return `${names.slice(0, -1).join(', ')} ${t('list_and')} ${names[names.length - 1]}`;
}
