/**
 * Icono de línea por grupo muscular (biblioteca, historial, sesión).
 * Mismo lenguaje que la barra inferior (TabIcon): trazo redondeado de ~2 pt,
 * monocromo, solo Views (sin fuentes ni SVG). Cada grupo tiene una silueta
 * propia y ninguna repite un icono de pestaña (mancuerna, persona…):
 *   pecho = dos pectorales · espalda = V de dorsales · piernas = pierna en
 *   sentadilla · hombros = press por encima de la cabeza · brazos = bíceps ·
 *   core = abdominales · cardio = pulso · cuerpo entero/otro = círculo.
 */
import { View } from 'react-native';

type Pt = [number, number];

/** Segmento con extremos redondeados entre dos puntos (coordenadas 0..1). */
function Seg({ a, b, size, w, c }: { a: Pt; b: Pt; size: number; w: number; c: string }) {
  const x1 = a[0] * size, y1 = a[1] * size, x2 = b[0] * size, y2 = b[1] * size;
  const len = Math.hypot(x2 - x1, y2 - y1) + w; // +w: casquetes redondos solapan en las uniones
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <View
      style={{
        position: 'absolute',
        left: (x1 + x2) / 2 - len / 2,
        top: (y1 + y2) / 2 - w / 2,
        width: len,
        height: w,
        borderRadius: w / 2,
        backgroundColor: c,
        transform: [{ rotate: `${ang}deg` }],
      }}
    />
  );
}

function Path({ pts, size, w, c }: { pts: Pt[]; size: number; w: number; c: string }) {
  return (
    <>
      {pts.slice(1).map((p, i) => (
        <Seg key={i} a={pts[i]} b={p} size={size} w={w} c={c} />
      ))}
    </>
  );
}

export function GroupGlyph({ group, size = 24, color }: { group: string; size?: number; color: string }) {
  const s = size;
  const w = Math.max(1.5, Math.round(s * 0.085 * 2) / 2);
  const c = color;
  const box = (l: number, t: number, wd: number, ht: number, extra: object = {}) => ({
    position: 'absolute' as const,
    left: l * s,
    top: t * s,
    width: wd * s,
    height: ht * s,
    ...extra,
  });

  let body: React.ReactNode;
  switch (group) {
    case 'chest':
      body = (
        <>
          <View style={box(0.1, 0.26, 0.38, 0.4, { borderWidth: w, borderColor: c, borderRadius: s * 0.08, borderBottomLeftRadius: s * 0.22 })} />
          <View style={box(0.52, 0.26, 0.38, 0.4, { borderWidth: w, borderColor: c, borderRadius: s * 0.08, borderBottomRightRadius: s * 0.22 })} />
        </>
      );
      break;
    case 'back':
      // Torso en V (dorsales): hombros anchos, cintura estrecha, columna.
      body = (
        <>
          <Path pts={[[0.1, 0.18], [0.9, 0.18], [0.66, 0.86], [0.34, 0.86], [0.1, 0.18]]} size={s} w={w} c={c} />
          <Seg a={[0.5, 0.32]} b={[0.5, 0.72]} size={s} w={w} c={c} />
        </>
      );
      break;
    case 'legs':
      // Dos piernas con pies.
      body = (
        <>
          <Path pts={[[0.16, 0.86], [0.32, 0.86], [0.5, 0.14], [0.68, 0.86], [0.84, 0.86]]} size={s} w={w} c={c} />
        </>
      );
      break;
    case 'shoulders':
      body = (
        <>
          <Seg a={[0.12, 0.16]} b={[0.88, 0.16]} size={s} w={w} c={c} />
          <Seg a={[0.5, 0.86]} b={[0.5, 0.36]} size={s} w={w} c={c} />
          <Path pts={[[0.32, 0.54], [0.5, 0.36], [0.68, 0.54]]} size={s} w={w} c={c} />
        </>
      );
      break;
    case 'arms':
      // Brazo flexionado: brazo + antebrazo en ángulo, bíceps marcado, puño.
      body = (
        <>
          <Path pts={[[0.08, 0.78], [0.58, 0.78], [0.7, 0.3]]} size={s} w={w} c={c} />
          <View style={box(0.16, 0.5, 0.36, 0.28, { borderWidth: w, borderBottomWidth: 0, borderColor: c, borderTopLeftRadius: s * 0.18, borderTopRightRadius: s * 0.18 })} />
          <View style={box(0.6, 0.1, 0.24, 0.24, { backgroundColor: c, borderRadius: s * 0.12 })} />
        </>
      );
      break;
    case 'core':
      body = (
        <>
          {/* Abdominales: contorno del torso + línea alba + 2 líneas transversales */}
          <View style={box(0.2, 0.1, 0.6, 0.8, { borderWidth: w, borderColor: c, borderRadius: s * 0.2 })} />
          <Seg a={[0.5, 0.22]} b={[0.5, 0.78]} size={s} w={w} c={c} />
          <Seg a={[0.32, 0.4]} b={[0.68, 0.4]} size={s} w={w} c={c} />
          <Seg a={[0.32, 0.6]} b={[0.68, 0.6]} size={s} w={w} c={c} />
        </>
      );
      break;
    case 'cardio':
      body = <Path pts={[[0.06, 0.56], [0.3, 0.56], [0.42, 0.26], [0.58, 0.82], [0.7, 0.56], [0.94, 0.56]]} size={s} w={w} c={c} />;
      break;
    default:
      body = <View style={box(0.18, 0.18, 0.64, 0.64, { borderWidth: w, borderColor: c, borderRadius: s * 0.32 })} />;
  }
  return (
    <View style={{ width: s, height: s }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {body}
    </View>
  );
}
