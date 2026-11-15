/**
 * Qué toca hoy: el bloque de grupos (empuje / tirón / pierna) que hace más
 * tiempo que no entrenas. Lo usan Inicio ("Hoy toca …") y la hoja rápida, así
 * que siempre dicen lo mismo.
 */
import type { Session } from '../store';

export const SPLITS: string[][] = [
  ['chest', 'shoulders', 'arms'],
  ['back', 'arms'],
  ['legs', 'core'],
];

export function nextSplit(sessions: Session[], groupOf: Map<string, string>): string[] {
  // sessions: de más reciente a más antigua.
  const lastDate = (groups: string[]) => {
    for (const s of sessions) {
      if (s.exercises.some((x) => groups.includes(groupOf.get(x.exercise_id) || ''))) return s.date;
    }
    return '0000-00-00';
  };
  return SPLITS.slice().sort((a, b) => (lastDate(a) < lastDate(b) ? -1 : 1))[0];
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
