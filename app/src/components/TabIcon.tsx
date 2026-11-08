import { View, StyleSheet } from 'react-native';
import { DEFAULT } from '../theme';

/**
 * Iconos de la tabbar dibujados con Views (sin fuentes: los emojis no
 * siempre se renderizan en el dispositivo — p.ej. sin fuente de emoji,
 * Android, o en web — y quedaban como cuadros vacíos).
 * Cada icono es 24×24 de "tinta" dentro de un contenedor de 24×24.
 */

function BarIcon({ color }: { color: string }) {
  return (
    <View style={box}>
      <View style={[bar, { width: 7, height: 9, backgroundColor: color, bottom: 3 }]} />
      <View style={[bar, { width: 7, height: 13, backgroundColor: color, bottom: 3, left: 9 }]} />
      <View style={[bar, { width: 7, height: 17, backgroundColor: color, bottom: 3, left: 18 }]} />
    </View>
  );
}

function PlateIcon({ color }: { color: string }) {
  // "Ejercicios": haltera de lado (2 discos + barra).
  return (
    <View style={box}>
      <View style={[disc, { width: 5, height: 14, backgroundColor: color, left: 2, top: 5 }]} />
      <View style={[disc, { width: 5, height: 14, backgroundColor: color, left: 17, top: 5 }]} />
      <View style={[bar, { height: 3, width: 20, backgroundColor: color, top: 10, left: 2 }]} />
    </View>
  );
}

function PlusIcon({ color }: { color: string }) {
  return (
    <View style={box}>
      <View style={[bar, { width: 16, height: 3, backgroundColor: color, top: 10, left: 4 }]} />
      <View style={[bar, { width: 3, height: 16, backgroundColor: color, top: 4, left: 10 }]} />
    </View>
  );
}

function ClockIcon({ color }: { color: string }) {
  // "Historial": esfera con dos agujas.
  return (
    <View style={box}>
      <View
        style={{
          position: 'absolute',
          left: 2,
          top: 2,
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 3,
          borderColor: color,
        }}
      />
      <View style={[bar, { width: 2.5, height: 7, backgroundColor: color, left: 10.5, top: 5 }]} />
      <View style={[bar, { width: 5, height: 2.5, backgroundColor: color, left: 11, top: 10 }]} />
    </View>
  );
}

const box = {
  width: 24,
  height: 24,
  position: 'relative' as const,
};
const bar = { position: 'absolute' as const };
const disc = { position: 'absolute' as const, borderRadius: 2 };

/** Marca vacía (círculo + punto), para empty states. */
export function EmptyMarkGlyph({ size = 30 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, position: 'relative' as const }}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 3,
          borderColor: DEFAULT.dim,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.32,
          height: size * 0.32,
          borderRadius: size * 0.16,
          backgroundColor: DEFAULT.dim,
          top: '34%',
          left: '34%',
        }}
      />
    </View>
  );
}

/** X dibujado (el glifo ✕ U+2715 no está en la cobertura de fuentes de
 *  todos los dispositivos y aparecía como cuadro vacío). */
export function XGlyph({ size = 14, color = '#ff3b30' }: { size?: number; color?: string }) {
  const t = Math.max(2, Math.round(size * 0.16));
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: (size - t) / 2,
          width: size,
          height: t,
          borderRadius: t,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: (size - t) / 2,
          width: size,
          height: t,
          borderRadius: t,
          backgroundColor: color,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

/** Check dibujado (√). El emoji/tilde no está en la cobertura de fuentes
 *  de todos los dispositivos; se dibuja con dos barras rotadas. */
export function CheckGlyph({ size = 18, color = '#fff' }: { size?: number; color?: string }) {
  const t = Math.max(2, Math.round(size * 0.17));
  return (
    <View style={{ width: size, height: size }}>
      {/* pata corta: baja hasta el vértice */}
      <View
        style={{
          position: 'absolute',
          left: size * 0.09,
          top: size * 0.5,
          width: size * 0.42,
          height: t,
          borderRadius: t / 2,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
      {/* pata larga: sube hacia la derecha */}
      <View
        style={{
          position: 'absolute',
          left: size * 0.34,
          top: size * 0.42,
          width: size * 0.64,
          height: t,
          borderRadius: t / 2,
          backgroundColor: color,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

export function TabIcon({
  name,
  color,
}: {
  name: 'dashboard' | 'library' | 'session' | 'history';
  color: string;
}) {
  if (name === 'dashboard') return <BarIcon color={color} />;
  if (name === 'library') return <PlateIcon color={color} />;
  if (name === 'session') return <PlusIcon color={color} />;
  return <ClockIcon color={color} />;
}

export default TabIcon;
