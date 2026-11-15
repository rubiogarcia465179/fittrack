/**
 * FitTrack — sistema de diseño (tokens + doble estado visual).
 *
 * Dos paletas:
 *  - `DEFAULT`  → modo normal, fondo crema #F3EEE3, texto azul marino oscuro,
 *                 acento naranja profundo #C44A0D. Cálido, minimal, calmado.
 *  - `WORKOUT`  → sesión en curso, fondo NEGRO con degradado (carbón
 *                 #2A2A30 → negro #000000), tipografía clara de alto
 *                 contraste, acento naranja con degradado. El cambio es
 *                 intencionado y reconocible de un vistazo.
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
  /** Texto/iconos SOBRE el acento (botones, chips seleccionados, días marcados). */
  onAccent: string;
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
  onAccent: '#FFFFFF',
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

/** Tema ÚNICO de la app — estilo X (Twitter) iOS, monocromo:
 *  fondo negro puro, texto blanco, secundario gris, separadores finos y el
 *  "acento" es el BLANCO (botones blancos con texto negro, días entrenados,
 *  series hechas y selección en blanco con texto negro). Sin color: solo el
 *  rojo para acciones destructivas confirmadas. */
export const WORKOUT: Palette = {
  bg: '#000000',
  section: '#000000',
  card: '#16181C',
  cardBorder: '#2F3336',
  text: '#E7E9EA',
  secondary: '#71767B',
  dim: '#71767B',
  border: '#2F3336',
  accent: '#FFFFFF',
  accentDark: '#D9D9D9',
  onAccent: '#000000',
  link: '#E7E9EA',
  green: '#FFFFFF',
  red: '#F4212E',
  fieldBg: '#16181C',
  chipOff: '#16181C',
  chipOffText: '#E7E9EA',
  overlay: 'rgba(91, 112, 131, 0.4)',
  headerBg: 'rgba(0, 0, 0, 0.85)',
  tabBarBg: '#000000',
  statusBar: 'light',
};

/** "Día": el inverso exacto de Noche (estilo X claro): blanco + negro. */
export const DAY: Palette = {
  bg: '#FFFFFF',
  section: '#FFFFFF',
  card: '#F7F9F9',
  cardBorder: '#EFF3F4',
  text: '#0F1419',
  secondary: '#536471',
  dim: '#536471',
  border: '#CFD9DE',
  accent: '#0F1419',
  accentDark: '#000000',
  onAccent: '#FFFFFF',
  link: '#0F1419',
  green: '#0F1419',
  red: '#F4212E',
  fieldBg: '#F7F9F9',
  chipOff: '#F7F9F9',
  chipOffText: '#0F1419',
  overlay: 'rgba(0, 0, 0, 0.4)',
  headerBg: 'rgba(255, 255, 255, 0.85)',
  tabBarBg: '#FFFFFF',
  statusBar: 'dark',
};

/** Temas de dos colores complementarios (máximo contraste, sin perder
 *  elegancia): fondo muy oscuro de un tono + acento vivo del tono opuesto.
 *  El texto sobre el acento es el propio fondo (onAccent). */
function duo(o: { bg: string; card: string; border: string; text: string; secondary: string; accent: string; accentDark: string }): Palette {
  return {
    bg: o.bg,
    section: o.bg,
    card: o.card,
    cardBorder: o.border,
    text: o.text,
    secondary: o.secondary,
    dim: o.secondary,
    border: o.border,
    accent: o.accent,
    accentDark: o.accentDark,
    onAccent: o.bg,
    link: o.text,
    green: o.accent,
    red: '#FF4D4D',
    fieldBg: o.card,
    chipOff: o.card,
    chipOffText: o.text,
    overlay: 'rgba(0, 0, 0, 0.55)',
    headerBg: o.bg,
    tabBarBg: o.bg,
    statusBar: 'light',
  };
}
/** Ámbar: azul medianoche ↔ ámbar (azul / naranja). */
export const AMBER = duo({ bg: '#0A1128', card: '#121B38', border: '#24325C', text: '#F2F4FA', secondary: '#8A94B3', accent: '#FFB547', accentDark: '#F59E0B' });
/** Neón: violeta profundo ↔ lima ácida (violeta / amarillo verdoso). */
export const NEON = duo({ bg: '#140A24', card: '#1E1236', border: '#35235C', text: '#F4F0FF', secondary: '#9C8FBF', accent: '#C6FF3D', accentDark: '#A8E61F' });
/** Rubí: verde bosque ↔ coral rubí (verde / rojo). */
export const RUBY = duo({ bg: '#06150F', card: '#0D2219', border: '#1E3D2E', text: '#EEF7F2', secondary: '#84A595', accent: '#FF5A7A', accentDark: '#E63E60' });

export type ThemeId = 'night' | 'day' | 'amber' | 'neon' | 'ruby';
export const THEME_IDS: ThemeId[] = ['night', 'day', 'amber', 'neon', 'ruby'];
export const THEMES: Record<ThemeId, Palette> = {
  night: WORKOUT,
  day: DAY,
  amber: AMBER,
  neon: NEON,
  ruby: RUBY,
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
    // Negro puro (como X): sin degradado de fondo.
    bg: ['#000000', '#000000'],
    // Botón principal BLANCO con texto negro (levísimo degradado de volumen).
    cta: ['#FFFFFF', '#E6E6E6'],
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
