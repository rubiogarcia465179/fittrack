/**
 * FitTrack — sistema de diseño (tokens + doble estado visual).
 *
 * Dos paletas:
 *  - `DEFAULT`  → modo normal, fondo crema #F3EEE3, texto azul marino oscuro,
 *                 acento naranja profundo #C44A0D. Cálido, minimal, calmado.
 *  - `WORKOUT`  → sesión en curso, fondo azul marino profundo (degradado
 *                 #080D1C → #182656), tipografía clara de alto contraste,
 *                 acento naranja intenso. El cambio es intencionado y
 *                 reconocible de un vistazo.
 *
 * Los degradados premium (fondo de sesión y CTA principal) se definen en
 * `GRADIENTS`; la app los consume vía `useTheme()` de modo que cambiar el
 * estado de la sesión recolorea TODO sin tocar cada pantalla.
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

export interface GradientStops {
  /** Fondo del modo sesión (de arriba a abajo). */
  bg: string[];
  /** Barra de acción / CTA (de arriba a abajo). */
  cta: string[];
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
  accent: '#C44A0D',
  accentDark: '#A63D08',
  link: '#A63D08',
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

/** Sesión en curso: azul marino profundo + texto claro. */
export const WORKOUT: Palette = {
  bg: '#0A1228',
  section: '#070E1F',
  card: '#141F3E',
  cardBorder: '#243259',
  text: '#F4EFE5',
  secondary: '#A9B6D1',
  dim: '#8A97B7',
  border: '#283A66',
  accent: '#F05B1F',
  accentDark: '#C2440A',
  link: '#FF8A50',
  green: '#4CC97A',
  red: '#FF6B57',
  fieldBg: '#1D2A4E',
  chipOff: '#22335C',
  chipOffText: '#F4EFE5',
  overlay: 'rgba(4, 8, 18, 0.55)',
  headerBg: 'rgba(10, 18, 40, 0.82)',
  tabBarBg: 'rgba(10, 18, 40, 0.92)',
  statusBar: 'light',
};

/** Compatibilidad: alias del acento clásico (algunos estilos aún lo citan). */
export const COLORS: Palette = DEFAULT;

/** Degradados premium por estado (navegación y CTA). */
export const GRADIENTS: Record<'default' | 'workout', GradientStops> = {
  default: {
    bg: ['#F5F0E6', '#EEE7D9'],
    cta: ['#D9541E', '#B04007'],
  },
  workout: {
    bg: ['#182656', '#070D1D'],
    cta: ['#F05B1F', '#BC3D06'],
  },
};

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
      shadowColor: dark ? 'rgba(240,91,31,0.45)' : 'rgba(217,84,30,0.35)',
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
