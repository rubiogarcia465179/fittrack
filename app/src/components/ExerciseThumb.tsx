/**
 * Miniatura de un ejercicio en las listas (R-137): su dibujo real (posición
 * inicial, teñido con el color del texto) si lo tiene; si no, el icono de
 * línea de su grupo. Un solo componente para todas las listas.
 *
 * `animate` (R-155 / R-161): alterna dibujo 1 (inicio) y 2 (final) — 1, 2, 1,
 * 2… — para ver el movimiento. El 3.º no entra: en muchos ejercicios está mal.
 * Quieto si el sistema pide menos movimiento.
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Image } from 'react-native';
import { photosFor } from '../exercisePhotos';
import { GroupGlyph } from './GroupGlyph';

/** Dibujos que se usan (inicio y final). */
export const USED_FRAMES = 2;
const FRAME_MS = 1200;

export function ExerciseThumb({
  id,
  group,
  size,
  color,
  animate = false,
}: {
  id?: string;
  group: string;
  /** Lado del dibujo en pt; el icono de grupo usa ~55 % de este tamaño. */
  size: number;
  color: string;
  animate?: boolean;
}) {
  const ph = id ? photosFor(id) : null;
  const n = ph && ph.kind === 'drawing' ? Math.min(USED_FRAMES, ph.images.length) : 0;
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!animate || n < 2) return;
    let timer: ReturnType<typeof setInterval> | null = null;
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((still) => {
        if (!alive || still) return;
        timer = setInterval(() => setFrame((f) => f + 1), FRAME_MS);
      });
    return () => {
      alive = false;
      if (timer) clearInterval(timer);
      setFrame(0);
    };
  }, [animate, n, id]);
  if (ph && n > 0) {
    return (
      <Image
        source={ph.images[frame % n]}
        style={{ width: size, height: size, tintColor: color }}
        resizeMode="contain"
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    );
  }
  return <GroupGlyph group={group} size={Math.round(size * 0.55)} color={color} />;
}
