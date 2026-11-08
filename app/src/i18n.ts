import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import nlRes from './i18n-data/nl.json';
import esRes from './i18n-data/es.json';
import enRes from './i18n-data/en.json';
import frRes from './i18n-data/fr.json';

export const LANGS = ['nl', 'es', 'en', 'fr'] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_LABELS: Record<Lang, string> = {
  nl: 'Nederlands',
  es: 'Español',
  en: 'English',
  fr: 'Français',
};

/** Clave de idioma en AsyncStorage (conmutación instantánea, sin red). */
export const LANG_KEY = 'fittrack.lang';

type Bundle = Record<string, string>;

/**
 * Cada JSON de `i18n/` es un bundle plano de 84 claves (espejo de la web,
 * sin envoltorio). Los 4 bundles se embeben al compilar: cambiar de idioma
 * es un cambio local de strings, SIN red.
 */
const resources = {
  nl: { translation: nlRes as unknown as Bundle },
  es: { translation: esRes as unknown as Bundle },
  en: { translation: enRes as unknown as Bundle },
  fr: { translation: frRes as unknown as Bundle },
};

i18n
  .use(initReactI18next)
  .init({
    lng: 'es',
    fallbackLng: 'es',
    resources,
    // Hermes en iOS no expone Intl.PluralRules; los bundles no usan plurales,
    // así que el formato v3 evita el aviso de pluralResolver sin polyfill.
    compatibilityJSON: 'v3',
    interpolation: { escapeValue: false },
  })
  .catch(() => {
    // init fallido: la app sigue usando los defaults.
  });

export const i18nInstance = i18n;

export function setLanguage(lng: Lang): void {
  void i18n.changeLanguage(lng);
}
