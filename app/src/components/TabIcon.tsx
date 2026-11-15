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

function ScaleIcon({ color }: { color: string }) {
  // "Perfil": balanza de baño (base + esfera + aguja).
  return (
    <View style={box}>
      <View
        style={{
          position: 'absolute',
          left: 5,
          top: 4,
          width: 14,
          height: 14,
          borderRadius: 7,
          borderWidth: 3,
          borderColor: color,
        }}
      />
      <View
        style={[
          bar,
          {
            width: 2,
            height: 5,
            backgroundColor: color,
            left: 11,
            top: 7,
            transform: [{ rotate: '40deg' }],
          },
        ]}
      />
      <View style={[bar, { width: 16, height: 3, borderRadius: 1.5, backgroundColor: color, left: 4, top: 19 }]} />
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

/* ------------------------------------------------------------------
 * Iconos de la barra inferior — familia propia estilo Instagram:
 * rejilla de 26 pt, trazo único de 2 px redondeado; contorno cuando está
 * inactivo y RELLENO cuando está activo (los huecos usan el color de fondo).
 * Dibujados con Views (sin fuentes ni SVG).
 * ------------------------------------------------------------------ */
type NavProps = { color: string; bg: string; active: boolean };
const S = 26;
const W = 2;

/** Inicio: casa (tejado + cuerpo; puerta recortada cuando está activa). */
function HomeIcon({ color, bg, active }: NavProps) {
  return (
    <View style={{ width: S, height: S }}>
      {active ? (
        <View style={{ position: 'absolute', left: 2, top: 2, width: 0, height: 0, borderLeftWidth: 11, borderRightWidth: 11, borderBottomWidth: 11, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color }} />
      ) : (
        <View style={{ position: 'absolute', left: 5.2, top: 5.2, width: 15.6, height: 15.6, borderTopWidth: W, borderLeftWidth: W, borderColor: color, borderTopLeftRadius: 2, transform: [{ rotate: '45deg' }] }} />
      )}
      <View style={{ position: 'absolute', left: 5, top: 12, width: 16, height: 12, borderWidth: W, borderTopWidth: active ? W : 0, borderColor: color, backgroundColor: active ? color : 'transparent', borderBottomLeftRadius: 3, borderBottomRightRadius: 3 }} />
      {active ? <View style={{ position: 'absolute', left: 11, top: 17, width: 4, height: 7, borderTopLeftRadius: 2, borderTopRightRadius: 2, backgroundColor: bg }} /> : null}
    </View>
  );
}

/** Ejercicios: mancuerna (discos + barra). */
function DumbbellIcon({ color, active }: NavProps) {
  const plate = (left: number, w: number, h: number) => (
    <View style={{ position: 'absolute', left, top: (S - h) / 2, width: w, height: h, borderRadius: 2, borderWidth: W, borderColor: color, backgroundColor: active ? color : 'transparent' }} />
  );
  return (
    <View style={{ width: S, height: S }}>
      <View style={{ position: 'absolute', left: 9, top: S / 2 - 1.25, width: 8, height: 2.5, borderRadius: 1, backgroundColor: color }} />
      {plate(0.5, 4, 10)}
      {plate(4, 5.5, 16)}
      {plate(16.5, 5.5, 16)}
      {plate(21.5, 4, 10)}
    </View>
  );
}

/** Sesión: cuadrado redondeado crear con +. */
function CreateIcon({ color, bg, active }: NavProps) {
  const ink = active ? bg : color;
  return (
    <View style={{ width: S, height: S, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 22, height: 22, borderRadius: 7, borderWidth: W, borderColor: color, backgroundColor: active ? color : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', width: 10, height: W, borderRadius: 1, backgroundColor: ink }} />
        <View style={{ position: 'absolute', width: W, height: 10, borderRadius: 1, backgroundColor: ink }} />
      </View>
    </View>
  );
}

/** Historial / InstaGym: cámara (objetivo + flash). */
function CameraIcon({ color, bg, active }: NavProps) {
  const ink = active ? bg : color;
  return (
    <View style={{ width: S, height: S, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 22, height: 22, borderRadius: 7, borderWidth: W, borderColor: color, backgroundColor: active ? color : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: W, borderColor: ink }} />
        <View style={{ position: 'absolute', right: 3, top: 3, width: 2.5, height: 2.5, borderRadius: 1.25, backgroundColor: ink }} />
      </View>
    </View>
  );
}

/** Perfil: persona (cabeza + hombros). */
function PersonIcon({ color, active }: NavProps) {
  return (
    <View style={{ width: S, height: S }}>
      <View style={{ position: 'absolute', left: 8, top: 2, width: 10, height: 10, borderRadius: 5, borderWidth: W, borderColor: color, backgroundColor: active ? color : 'transparent' }} />
      <View style={{ position: 'absolute', left: 3, top: 14, width: 20, height: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, borderWidth: W, borderColor: color, backgroundColor: active ? color : 'transparent' }} />
    </View>
  );
}

export function TabIcon({
  name,
  color,
  bg = 'transparent',
  active = false,
}: {
  name: 'dashboard' | 'library' | 'session' | 'history' | 'profile';
  color: string;
  /** Color de fondo de la barra (para los recortes del icono activo). */
  bg?: string;
  active?: boolean;
}) {
  const props = { color, bg, active };
  if (name === 'dashboard') return <HomeIcon {...props} />;
  if (name === 'library') return <DumbbellIcon {...props} />;
  if (name === 'session') return <CreateIcon {...props} />;
  if (name === 'profile') return <PersonIcon {...props} />;
  return <CameraIcon {...props} />;
}

export default TabIcon;
