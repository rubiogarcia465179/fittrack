/** Contexto de tema: expone la paleta activa (DEFAULT o WORKOUT) para que
 *  cada pantalla recolore sola cuando la sesión cambia de estado. */
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { DEFAULT, WORKOUT, shadowFor, gradientStops, type Palette } from './theme';

export interface ThemeState {
  p: Palette;
  active: boolean; // sesión en curso
  SHADOW: { card: object; cta: object };
  GRADIENT_STOPS: string[];
}

const Ctx = createContext<ThemeState | null>(null);

export function ThemeProvider({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  const value = useMemo<ThemeState>(
    () => ({
      p: active ? WORKOUT : DEFAULT,
      active,
      SHADOW: shadowFor(active ? WORKOUT : DEFAULT),
      GRADIENT_STOPS: gradientStops(active ? WORKOUT : DEFAULT),
    }),
    [active],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme fuera de ThemeProvider');
  return v;
}
