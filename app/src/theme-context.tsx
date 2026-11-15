/** Contexto de tema: paleta del tema elegido en Perfil (Noche por defecto)
 *  + degradados y sombras derivados, para que cada pantalla se recoloree sola.
 *  Temas en `theme.ts` (THEMES): night, day, amber, neon, ruby. */
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { THEMES, shadowFor, gradientStops, type Palette, type GradientStops, type ThemeId } from './theme';
import { COUNTRY_BY_CODE, type CountryCode } from './theme-flags';

/** Paleta efectiva: un tema base o "flag:XX" (colores de la bandera). */
export function paletteFor(id: string): Palette {
  if (id.startsWith('flag:')) {
    const c = COUNTRY_BY_CODE.get(id.slice(5) as CountryCode);
    if (c) return c.palette;
  }
  return THEMES[id as ThemeId] || THEMES.night;
}

export interface ThemeState {
  p: Palette;
  /** Tema base o "flag:XX". */
  themeId: string;
  SHADOW: { card: object; cta: object };
  GRADIENT_STOPS: string[];
  GRADIENT: GradientStops;
}

const Ctx = createContext<ThemeState | null>(null);

export function ThemeProvider({ themeId, children }: { themeId: string; children: ReactNode }) {
  const value = useMemo<ThemeState>(() => {
    const p = paletteFor(themeId);
    return {
      p,
      themeId,
      SHADOW: shadowFor(p),
      GRADIENT_STOPS: gradientStops(p),
      // Fondo plano del tema; botón principal = acento con un leve degradado.
      GRADIENT: { bg: [p.bg, p.bg], cta: [p.accent, p.accentDark] },
    };
  }, [themeId]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme fuera de ThemeProvider');
  return v;
}
