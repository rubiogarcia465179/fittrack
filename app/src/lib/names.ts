/** Nombre del ejercicio en el idioma de la app (fallback: inglés).
 *  name_es / name_fr son traducciones locales (ver data/exercises/names-i18n.json). */
export interface Named {
  name_en: string;
  name_nl?: string;
  name_es?: string;
  name_fr?: string;
  /** Nombres de pantalla EN/NL (R-143); name_en/name_nl son los de wger. */
  display_en?: string;
  display_nl?: string;
}

export function exName(e: Named | null | undefined, lang: string): string {
  if (!e) return '';
  const v =
    lang === 'nl' ? e.display_nl || e.name_nl : lang === 'es' ? e.name_es : lang === 'fr' ? e.name_fr : e.display_en;
  return v || e.name_en;
}
