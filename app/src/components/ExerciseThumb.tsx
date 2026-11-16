/**
 * Miniatura de un ejercicio en las listas (R-137): su dibujo real de
 * Everkinetic (posición inicial, teñido con el color del texto) si lo tiene;
 * si no, el icono de línea de su grupo. Un solo componente para todas las
 * listas (Ejercicios, sesión, diario, web).
 */
import { Image } from 'react-native';
import { photosFor } from '../exercisePhotos';
import { GroupGlyph } from './GroupGlyph';

export function ExerciseThumb({
  id,
  group,
  size,
  color,
}: {
  id?: string;
  group: string;
  /** Lado del dibujo en pt; el icono de grupo usa ~55 % de este tamaño. */
  size: number;
  color: string;
}) {
  const ph = id ? photosFor(id) : null;
  if (ph && ph.kind === 'drawing') {
    return (
      <Image
        source={ph.images[0]}
        style={{ width: size, height: size, tintColor: color }}
        resizeMode="contain"
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    );
  }
  return <GroupGlyph group={group} size={Math.round(size * 0.55)} color={color} />;
}
