/**
 * Pasos "¿Cómo se hace?" en el idioma elegido (NL/ES/EN/FR), 226 ejercicios.
 * Fuente: data/exercises/howto/<lang>.json — redactados localmente por
 * FitTrack en lenguaje para principiantes (no son de wger). Espejo generado
 * con `node scripts/sync_howto.js`; no editar a mano.
 *
 * Los 4 idiomas van en el bundle (~40 KB c/u), así el cambio de idioma es
 * instantáneo y sin red.
 */
import nl from './data/howto/nl.json';
import es from './data/howto/es.json';
import en from './data/howto/en.json';
import fr from './data/howto/fr.json';

type HowTo = Record<string, string[]>;
const BY_LANG: Record<string, HowTo> = { nl, es, en, fr };

/** Pasos del ejercicio en `lang`; si faltan, inglés; si no, `fallback` (wger). */
export function howtoFor(id: string, lang: string, fallback: string[] = []): string[] {
  const base = (lang || 'en').slice(0, 2);
  return BY_LANG[base]?.[id] ?? BY_LANG.en[id] ?? fallback;
}
