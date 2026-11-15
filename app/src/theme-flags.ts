/**
 * Temas por nacionalidad: la app toma los colores de la bandera del país
 * elegido en Perfil (opción aparte, desactivada por defecto).
 *
 * Regla de calidad: legibilidad primero. Cada tema = fondo MUY oscuro teñido
 * con un color de la bandera + el color más vivo de la bandera como acento
 * (contraste ≥ 4.5 con su texto). Banderas mayoritariamente blancas (Japón,
 * Canadá) → tema claro. Solo colores: nunca escudos ni emblemas.
 */
import { DAY, type Palette } from './theme';

export type CountryCode =
  | 'ES' | 'MX' | 'AR' | 'CO' | 'CL' | 'PE' | 'VE' | 'US' | 'CA' | 'GB'
  | 'IE' | 'FR' | 'DE' | 'IT' | 'PT' | 'NL' | 'BE' | 'BR' | 'JP' | 'MA';

export interface Country {
  code: CountryCode;
  name: Record<'es' | 'en' | 'nl' | 'fr', string>;
  /** Franjas para la mini-bandera (de arriba abajo o de izquierda a derecha). */
  stripes: string[];
  vertical?: boolean;
  palette: Palette;
}

function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`.toUpperCase();
}

/** Tema oscuro con los colores de la bandera RECONOCIBLES: el fondo es el
 *  color de la bandera oscurecido (`strength` = cuánto color conserva; 0.45
 *  por defecto: se reconoce el país y el texto blanco sigue ≥ 7:1) y el
 *  acento es otro color vivo de la bandera. */
function darkFlag(tint: string, accent: string, onAccent: 'dark' | 'light', strength = 0.45): Palette {
  const bg = mix('#000000', tint, strength);
  const card = mix(bg, '#FFFFFF', 0.08);
  const border = mix(bg, '#FFFFFF', 0.2);
  return {
    bg,
    section: bg,
    card,
    cardBorder: border,
    text: '#F4F5F7',
    secondary: mix(bg, '#FFFFFF', 0.62),
    dim: mix(bg, '#FFFFFF', 0.62),
    border,
    accent,
    accentDark: mix(accent, '#000000', 0.15),
    onAccent: onAccent === 'dark' ? bg : '#FFFFFF',
    link: '#F4F5F7',
    green: accent,
    red: '#FF4D4D',
    fieldBg: card,
    chipOff: card,
    chipOffText: '#F4F5F7',
    overlay: 'rgba(0, 0, 0, 0.55)',
    headerBg: bg,
    tabBarBg: bg,
    statusBar: 'light',
  };
}
/** Tema claro (banderas mayoritariamente blancas). */
function lightFlag(accent: string): Palette {
  return { ...DAY, accent, accentDark: mix(accent, '#000000', 0.15), onAccent: '#FFFFFF', green: accent };
}

export const COUNTRIES: Country[] = [
  { code: 'ES', name: { es: 'España', en: 'Spain', nl: 'Spanje', fr: 'Espagne' }, stripes: ['#AA151B', '#F1BF00', '#F1BF00', '#AA151B'], palette: darkFlag('#AA151B', '#F1BF00', 'dark', 0.62) },
  { code: 'MX', name: { es: 'México', en: 'Mexico', nl: 'Mexico', fr: 'Mexique' }, stripes: ['#006847', '#FFFFFF', '#CE1126'], vertical: true, palette: darkFlag('#006847', '#E8283C', 'light') },
  { code: 'AR', name: { es: 'Argentina', en: 'Argentina', nl: 'Argentinië', fr: 'Argentine' }, stripes: ['#74ACDF', '#FFFFFF', '#74ACDF'], palette: darkFlag('#1F4E7A', '#74ACDF', 'dark') },
  { code: 'CO', name: { es: 'Colombia', en: 'Colombia', nl: 'Colombia', fr: 'Colombie' }, stripes: ['#FCD116', '#FCD116', '#003893', '#CE1126'], palette: darkFlag('#003893', '#FCD116', 'dark') },
  { code: 'CL', name: { es: 'Chile', en: 'Chile', nl: 'Chili', fr: 'Chili' }, stripes: ['#FFFFFF', '#D52B1E'], palette: darkFlag('#0039A6', '#E8392C', 'light') },
  { code: 'PE', name: { es: 'Perú', en: 'Peru', nl: 'Peru', fr: 'Pérou' }, stripes: ['#D91023', '#FFFFFF', '#D91023'], vertical: true, palette: darkFlag('#D91023', '#FFFFFF', 'dark') },
  { code: 'VE', name: { es: 'Venezuela', en: 'Venezuela', nl: 'Venezuela', fr: 'Venezuela' }, stripes: ['#FCE300', '#00247D', '#CF142B'], palette: darkFlag('#CF142B', '#FCE300', 'dark') },
  { code: 'US', name: { es: 'Estados Unidos', en: 'United States', nl: 'Verenigde Staten', fr: 'États-Unis' }, stripes: ['#B22234', '#FFFFFF', '#B22234', '#FFFFFF', '#3C3B6E'], palette: darkFlag('#3C3B6E', '#E8384F', 'light') },
  { code: 'CA', name: { es: 'Canadá', en: 'Canada', nl: 'Canada', fr: 'Canada' }, stripes: ['#D80621', '#FFFFFF', '#D80621'], vertical: true, palette: lightFlag('#D80621') },
  { code: 'GB', name: { es: 'Reino Unido', en: 'United Kingdom', nl: 'Verenigd Koninkrijk', fr: 'Royaume-Uni' }, stripes: ['#012169', '#FFFFFF', '#C8102E', '#FFFFFF', '#012169'], palette: darkFlag('#012169', '#E0213F', 'light') },
  { code: 'IE', name: { es: 'Irlanda', en: 'Ireland', nl: 'Ierland', fr: 'Irlande' }, stripes: ['#169B62', '#FFFFFF', '#FF883E'], vertical: true, palette: darkFlag('#169B62', '#FF883E', 'dark') },
  { code: 'FR', name: { es: 'Francia', en: 'France', nl: 'Frankrijk', fr: 'France' }, stripes: ['#0055A4', '#FFFFFF', '#EF4135'], vertical: true, palette: darkFlag('#0055A4', '#EF4135', 'light') },
  { code: 'DE', name: { es: 'Alemania', en: 'Germany', nl: 'Duitsland', fr: 'Allemagne' }, stripes: ['#000000', '#DD0000', '#FFCE00'], palette: darkFlag('#000000', '#FFCE00', 'dark') },
  { code: 'IT', name: { es: 'Italia', en: 'Italy', nl: 'Italië', fr: 'Italie' }, stripes: ['#009246', '#FFFFFF', '#CE2B37'], vertical: true, palette: darkFlag('#009246', '#E03C48', 'light') },
  { code: 'PT', name: { es: 'Portugal', en: 'Portugal', nl: 'Portugal', fr: 'Portugal' }, stripes: ['#006600', '#FF0000', '#FF0000'], vertical: true, palette: darkFlag('#006600', '#FF2B2B', 'dark') },
  { code: 'NL', name: { es: 'Países Bajos', en: 'Netherlands', nl: 'Nederland', fr: 'Pays-Bas' }, stripes: ['#AE1C28', '#FFFFFF', '#21468B'], palette: darkFlag('#21468B', '#FF7F00', 'dark') },
  { code: 'BE', name: { es: 'Bélgica', en: 'Belgium', nl: 'België', fr: 'Belgique' }, stripes: ['#000000', '#FDDA24', '#EF3340'], vertical: true, palette: darkFlag('#5A0A10', '#FDDA24', 'dark') },
  { code: 'BR', name: { es: 'Brasil', en: 'Brazil', nl: 'Brazilië', fr: 'Brésil' }, stripes: ['#009C3B', '#FFDF00', '#002776', '#FFDF00', '#009C3B'], palette: darkFlag('#009C3B', '#FFDF00', 'dark') },
  { code: 'JP', name: { es: 'Japón', en: 'Japan', nl: 'Japan', fr: 'Japon' }, stripes: ['#FFFFFF', '#BC002D', '#FFFFFF'], palette: lightFlag('#BC002D') },
  { code: 'MA', name: { es: 'Marruecos', en: 'Morocco', nl: 'Marokko', fr: 'Maroc' }, stripes: ['#C1272D', '#006233', '#C1272D'], palette: darkFlag('#C1272D', '#22B062', 'dark') },
];

export const COUNTRY_BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));
export const countryName = (c: Country, lang: string) => c.name[(lang as 'es') in c.name ? (lang as 'es') : 'en'];
