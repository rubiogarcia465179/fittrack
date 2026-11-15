/**
 * Colores del cuerpo 3D según las sesiones de esta semana que trabajaron un
 * grupo: 1 verde · 2 naranja · 3+ violeta (el rojo se leía como alarma;
 * decisión del usuario 2026-11-15).
 */
export type Sex = 'male' | 'female' | 'other' | undefined;
export const HEAT = { 1: '#00E676', 2: '#FF9F0A', 3: '#BF5AF2' } as const;

export function heatColor(n: number): string | null {
  if (n <= 0) return null;
  return n === 1 ? HEAT[1] : n === 2 ? HEAT[2] : HEAT[3];
}
