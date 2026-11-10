/**
 * FitTrack — sistema de diseño (tokens + doble estado visual).
 *
 * Dos paletas:
 *  - `DEFAULT`  → modo normal, fondo crema #F3EEE3, texto azul marino oscuro,
 *                 acento naranja #D9541E. Cálido, minimal, calmado.
 *  - `WORKOUT`  → sesión en curso, fondo azul marino oscuro, tipografía clara
 *                 de alto contraste, acento naranja más vivo. El cambio es
 *                 intencionado y reconocible de un vistazo.
 *
 * El resto de la app consume los tokens a través de `useTheme()` (contexto en
 * App.tsx), de modo que cambiar el estado de la sesión recolorea TODO sin
 * tocar cada pantalla.
 */

export interface Palette {
  bg: string;
  section: string;
  card: string;
  cardBorder: string;
  text: string;
  secondary: string;
  dim: string;
  border: string;
  accent: string; // color principal (antes "blue")
  accentDark: string; // hover / degradado inferior
  link: string;
  green: string;
  red: string;
  fieldBg: string;
  chipOff: string;
  chipOffText: string;
  overlay: string; // scrim de modales
  headerBg: string;
  tabBarBg: string;
  statusBar: 'dark' | 'light';
}

/** Modo normal: crema cálido + acento naranja. */
export const DEFAULT: Palette = {
  bg: '#F3EEE3',
  section: '#ECE5D8',
  card: '#FFFCF6',
  cardBorder: '#E3DACA',
  text: '#182440',
  secondary: '#5C6A85',
  dim: '#646C82',
  border: '#D8CFBE',
  accent: '#D9541E',
  accentDark: '#B8430F',
  link: '#B8430F',
  green: '#2E7D44',
  red: '#C43C2A',
  fieldBg: '#EFE8DA',
  chipOff: '#E7DFCE',
  chipOffText: '#182440',
  overlay: 'rgba(24, 36, 64, 0.42)',
  headerBg: 'rgba(255, 252, 246, 0.82)',
  tabBarBg: 'rgba(255, 252, 246, 0.96)',
  statusBar: 'dark',
};

/** Sesión en curso: azul marino oscuro + texto claro. */
export const WORKOUT: Palette = {
  bg: '#0E1730',
  section: '#0A1224',
  card: '#182342',
  cardBorder: '#26345C',
  text: '#F3EEE3',
  secondary: '#A9B6D1',
  dim: '#8896B5',
  border: '#2A3A63',
  accent: '#F0622B',
  accentDark: '#D9541E',
  link: '#FF8A50',
  green: '#4CC97A',
  red: '#FF6B57',
  fieldBg: '#20305A',
  chipOff: '#22335C',
  chipOffText: '#F3EEE3',
  overlay: 'rgba(4, 8, 18, 0.55)',
  headerBg: 'rgba(14, 23, 48, 0.86)',
  tabBarBg: 'rgba(14, 23, 48, 0.96)',
  statusBar: 'light',
};

/** Compatibilidad: alias del acento clásico (algunos estilos aún lo citan). */
export const COLORS: Palette = DEFAULT;

/** Colores por grupo muscular (compartidos por ambos estados). */
export const GROUP_COLORS: Record<string, string> = {
  chest: '#D9541E',
  back: '#6E5CE6',
  legs: '#2E7D44',
  shoulders: '#E0900F',
  arms: '#C43C2A',
  core: '#2E86AB',
  cardio: '#C43C2A',
  full_body: '#9B59B6',
  other: '#5C6A85',
};

export const RADII = {
  card: 20,
  tile: 18,
  field: 12,
  pill: 980,
};

/** Sombras suaves (estilo Apple: difusas y bajas). En modo oscuro se atenúan. */
export function shadowFor(p: Palette) {
  const dark = p.statusBar === 'light';
  return {
    card: {
      shadowColor: dark ? '#000000' : '#182440',
      shadowOpacity: dark ? 0.35 : 0.06,
      shadowRadius: dark ? 14 : 10,
      shadowOffset: { width: 0, height: dark ? 8 : 4 },
      elevation: 2,
    },
    cta: {
      shadowColor: dark ? 'rgba(240,98,43,0.45)' : 'rgba(217,84,30,0.35)',
      shadowOpacity: 1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
  };
}

/** Gradiente de la CTA principal (vertical, acento). */
export function gradientStops(p: Palette) {
  return [p.accent, p.accentDark];
}
