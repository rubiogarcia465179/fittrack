/**
 * Mapa del cuerpo de la semana (Inicio) — ilustración vectorial
 * (react-native-svg): silueta continua de curvas Bézier, negra con contorno
 * blanco (colores del tema: p.bg / p.text), de frente y de espalda.
 *
 * Cada grupo muscular se colorea según cuántas sesiones de esta semana lo
 * trabajaron: 0 → solo la línea · 1 → verde · 2 → naranja · 3+ → rojo.
 *
 * La silueta sigue al Perfil (si está configurado):
 *   - sexo: hombre / mujer (sin dato u "otro" → figura intermedia).
 *   - IMC (peso y altura): cerca del IMC sano (~22) → forma en V atlética;
 *     por debajo → más estrecha; por encima → cintura y muslos más llenos.
 *     Cambios suaves y respetuosos: nunca una caricatura ni una etiqueta.
 *
 * Geometría: viewBox 200 × 440, simétrica respecto a x = 100. Cada forma se
 * define para el lado derecho con x(dx) = 100 + s·dx y se refleja con s = −1.
 */
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Ellipse, G, Path, Rect } from 'react-native-svg';
import { useTheme } from '../theme-context';

export type Sex = 'male' | 'female' | 'other' | undefined;
export const HEAT = { 1: '#00E676', 2: '#FF9F0A', 3: '#FF3B30' } as const;

export function heatColor(n: number): string | null {
  if (n <= 0) return null;
  return n === 1 ? HEAT[1] : n === 2 ? HEAT[2] : HEAT[3];
}

export interface Shape {
  sh: number; // borde exterior del hombro
  chestW: number; // axila
  waist: number; // cintura
  hip: number; // cadera
  innerT: number; // separación de muslos en la ingle
  innerK: number; // rodilla interior
  innerC: number; // gemelo interior
  arm: number; // grosor relativo de brazos
  belly: number; // volumen en la cintura (IMC alto)
  female: boolean;
}

/** Proporciones según sexo e IMC (sin dato → IMC sano). */
export function bodyShape(sex: Sex, bmi: number | null): Shape {
  const male = { sh: 50, chestW: 36, waist: 27, hip: 31, innerT: 1.5, innerK: 10, innerC: 7, arm: 1 };
  const female = { sh: 43, chestW: 31, waist: 22, hip: 35, innerT: 1.5, innerK: 9, innerC: 7, arm: 0.84 };
  const pick = sex === 'male' ? male : sex === 'female' ? female : null;
  const base = pick
    ? { ...pick }
    : (Object.fromEntries(Object.keys(male).map((k) => [k, (male[k as keyof typeof male] + female[k as keyof typeof female]) / 2])) as typeof male);
  const s: Shape = { ...base, belly: 0, female: sex === 'female' };
  const b = bmi && bmi > 10 && bmi < 60 ? bmi : 22;
  if (b < 18.5) {
    const k = Math.max(0.8, 1 - (18.5 - b) * 0.05);
    s.sh *= 0.55 + 0.45 * k;
    s.chestW *= k;
    s.waist *= Math.max(0.86, k);
    s.hip *= Math.max(0.88, k);
    s.innerT += 3 * (1 - k) * 5;
    s.innerK += 2;
    s.arm *= k;
  } else if (b > 25) {
    const e = Math.min(1, (b - 25) / 12);
    s.belly = 13 * e;
    s.waist += 4 * e;
    s.hip += 5 * e;
    s.chestW += 3 * e;
    s.innerT = Math.max(0.4, s.innerT - 1.2 * e);
    s.arm *= 1 + 0.22 * e;
  }
  return s;
}

type Fill = (group: string) => string | null;

/** Silueta: relleno (cerrado al eje) + contorno abierto (sin línea central). */
function bodyHalf(S: Shape, s: 1 | -1) {
  const x = (dx: number) => (100 + s * dx).toFixed(1);
  const { sh, chestW, waist, hip, innerT, innerK, innerC, belly } = S;
  const w = waist + belly * 0.6;
  const d =
    `M${x(11)},54 C${x(12)},63 ${x(13)},68 ${x(18)},71 ` +
    `C${x(28)},75 ${x(sh - 14)},78 ${x(sh - 10)},81 ` +
    `C${x(sh - 14)},88 ${x(chestW + 1)},100 ${x(chestW)},112 ` +
    `C${x(chestW + 2 + belly * 0.2)},140 ${x(waist + 3 + belly)},172 ${x(w)},198 ` +
    `C${x(w - 1)},214 ${x(hip)},222 ${x(hip)},242 ` +
    `C${x(hip + 1)},278 ${x(hip - 3)},310 ${x(hip - 7)},334 ` +
    `C${x(hip - 5)},352 ${x(hip - 4)},372 ${x(hip - 10)},396 ` +
    `C${x(18)},414 ${x(17)},424 ${x(23)},431 ` +
    `C${x(24)},436 ${x(9)},437 ${x(6)},434 ` +
    `C${x(innerC)},412 ${x(innerC)},386 ${x(innerC)},366 ` +
    `C${x(innerC + 1)},350 ${x(innerK)},342 ${x(innerK)},331 ` +
    `C${x(innerK - 1)},302 ${x(innerT + 2)},276 ${x(innerT)},262`;
  return { outline: d, fill: `${d} L100,262 L100,54 Z` };
}

function armPath(S: Shape, s: 1 | -1) {
  const x = (dx: number) => (100 + s * dx).toFixed(1);
  const { sh } = S;
  const a = S.arm;
  return (
    `M${x(sh - 10)},80 ` +
    `C${x(sh + 2)},79 ${x(sh + 8 * a)},92 ${x(sh + 7 * a)},108 ` +
    `C${x(sh + 8 * a)},128 ${x(sh + 9 * a)},150 ${x(sh + 7 * a)},166 ` +
    `C${x(sh + 8 * a)},182 ${x(sh + 8 * a)},205 ${x(sh + 5 * a)},228 ` +
    `C${x(sh + 6 * a)},240 ${x(sh + 3)},256 ${x(sh - 2)},258 ` +
    `C${x(sh - 7)},258 ${x(sh - 8)},245 ${x(sh - 7 * a)},228 ` +
    `C${x(sh - 8 * a)},205 ${x(sh - 9 * a)},185 ${x(sh - 9 * a)},168 ` +
    `C${x(sh - 11 * a)},150 ${x(sh - 14 * a)},128 ${x(sh - 14 * a)},112 ` +
    `C${x(sh - 14)},96 ${x(sh - 14)},85 ${x(sh - 10)},80 Z`
  );
}

/** Músculos del brazo (deltoides, bíceps/tríceps, antebrazo). */
function armMuscles(S: Shape, s: 1 | -1) {
  const x = (dx: number) => (100 + s * dx).toFixed(1);
  const { sh } = S;
  const a = S.arm;
  return {
    delt: `M${x(sh - 12)},84 C${x(sh + 3)},80 ${x(sh + 8 * a)},96 ${x(sh + 6 * a)},113 C${x(sh)},119 ${x(sh - 9)},115 ${x(sh - 13)},104 Z`,
    upper: `M${x(sh - 11 * a)},119 C${x(sh - 2)},115 ${x(sh + 6 * a)},128 ${x(sh + 5 * a)},148 C${x(sh + 4 * a)},160 ${x(sh - 6)},164 ${x(sh - 9 * a)},154 C${x(sh - 12 * a)},140 ${x(sh - 13 * a)},124 ${x(sh - 11 * a)},119 Z`,
    fore: `M${x(sh - 8 * a)},173 C${x(sh + 2)},171 ${x(sh + 7 * a)},187 ${x(sh + 5 * a)},211 C${x(sh + 3 * a)},222 ${x(sh - 5)},224 ${x(sh - 7 * a)},212 C${x(sh - 9 * a)},196 ${x(sh - 9 * a)},183 ${x(sh - 8 * a)},173 Z`,
  };
}

function frontMuscles(S: Shape, s: 1 | -1) {
  const x = (dx: number) => (100 + s * dx).toFixed(1);
  const { sh, chestW, waist, hip, innerT, innerK, belly } = S;
  const w = waist + belly * 0.6;
  const aw = Math.max(11, waist - 11);
  const pecBottom = S.female
    ? `C${x(chestW - 4)},134 ${x(13)},138 ${x(1)},128`
    : `C${x(chestW - 14)},130 ${x(10)},129 ${x(1)},124`;
  return {
    chest: [`M${x(1)},88 C${x(14)},84 ${x(sh - 18)},84 ${x(sh - 15)},90 C${x(sh - 15)},104 ${x(chestW)},114 ${x(chestW - 7)},122 ${pecBottom} Z`],
    core: [
      `M${x(2)},192 C${x(aw + 2)},192 ${x(aw)},205 ${x(2)},215 Z`,
      `M${x(chestW - 5)},126 C${x(chestW - 1)},148 ${x(w - 1)},176 ${x(w - 3)},195 C${x(aw + 6)},190 ${x(aw + 4)},162 ${x(aw + 4)},134 Z`,
    ],
    legs: [
      `M${x(hip - 2)},246 C${x(hip + 1)},272 ${x(hip - 2)},302 ${x(hip - 9)},326 C${x(hip - 14)},334 ${x(innerK + 2)},334 ${x(innerK + 1)},322 C${x(innerT + 4)},298 ${x(innerT + 3)},272 ${x(innerT + 6)},252 C${x(12)},246 ${x(hip - 8)},242 ${x(hip - 2)},246 Z`,
    ],
    absRects: [0, 1, 2].map((r) => ({ x: s > 0 ? 102 : 98 - aw, y: 133 + r * 19, w: aw, h: 16 })),
  };
}

function backMuscles(S: Shape, s: 1 | -1) {
  const x = (dx: number) => (100 + s * dx).toFixed(1);
  const { sh, chestW, waist, hip, innerT, innerK, innerC, belly } = S;
  const w = waist + belly * 0.6;
  return {
    back: [
      `M${x(0)},60 C${x(9)},62 ${x(16)},70 ${x(sh - 12)},83 C${x(sh - 24)},94 ${x(10)},112 ${x(0)},132 Z`,
      `M${x(chestW - 2)},115 C${x(chestW + 2)},137 ${x(w + 2)},170 ${x(w - 3)},194 C${x(16)},196 ${x(7)},176 ${x(3)},150 C${x(10)},132 ${x(chestW - 12)},119 ${x(chestW - 2)},115 Z`,
      `M${x(2)},156 C${x(10)},166 ${x(14)},188 ${x(12)},208 C${x(8)},212 ${x(3)},210 ${x(2)},206 Z`,
    ],
    legs: [
      `M${x(1)},214 C${x(16)},208 ${x(hip)},222 ${x(hip)},246 C${x(hip - 1)},264 ${x(14)},270 ${x(1)},262 Z`,
      `M${x(hip - 2)},270 C${x(hip)},293 ${x(hip - 4)},314 ${x(hip - 9)},328 C${x(innerK + 4)},334 ${x(innerK + 1)},326 ${x(innerK)},316 C${x(innerT + 5)},296 ${x(innerT + 4)},281 ${x(innerT + 3)},271 C${x(10)},273 ${x(hip - 8)},268 ${x(hip - 2)},270 Z`,
      `M${x(hip - 8)},342 C${x(hip - 2)},356 ${x(hip - 4)},380 ${x(hip - 12)},396 C${x(innerC + 7)},400 ${x(innerC + 2)},388 ${x(innerC + 1)},370 C${x(innerC)},356 ${x(innerK)},346 ${x(hip - 8)},342 Z`,
    ],
  };
}

function Figure({ view, shape, fill }: { view: 'front' | 'back'; shape: Shape; fill: Fill }) {
  const { p } = useTheme();
  const line = p.text;
  // Músculo: con color si se entrenó; si no, solo una línea fina (lámina anatómica).
  const muscle = (d: string, group: string, key: string) => {
    const c = fill(group);
    return c ? (
      <Path key={key} d={d} fill={c} fillOpacity={0.92} stroke={p.bg} strokeWidth={1.1} strokeLinejoin="round" />
    ) : (
      <Path key={key} d={d} fill="none" stroke={line} strokeOpacity={0.38} strokeWidth={1} strokeLinejoin="round" />
    );
  };
  const rect = (r: { x: number; y: number; w: number; h: number }, group: string, key: string) => {
    const c = fill(group);
    return c ? (
      <Rect key={key} x={r.x} y={r.y} width={r.w} height={r.h} rx={5} fill={c} fillOpacity={0.92} stroke={p.bg} strokeWidth={1.1} />
    ) : (
      <Rect key={key} x={r.x} y={r.y} width={r.w} height={r.h} rx={5} fill="none" stroke={line} strokeOpacity={0.38} strokeWidth={1} />
    );
  };
  const sides: (1 | -1)[] = [1, -1];
  const S = shape;
  return (
    <Svg width={142} height={312} viewBox="0 0 200 440">
      {/* Cuerpo: relleno y contorno */}
      {sides.map((s) => (
        <Path key={'f' + s} d={bodyHalf(S, s).fill} fill={p.bg} stroke="none" />
      ))}
      {sides.map((s) => (
        <Path key={'o' + s} d={bodyHalf(S, s).outline} fill="none" stroke={line} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {/* Músculos del tronco y las piernas */}
      {sides.map((s) => {
        if (view === 'front') {
          const m = frontMuscles(S, s);
          return (
            <G key={'m' + s}>
              {m.chest.map((d, i) => muscle(d, 'chest', `c${i}`))}
              {m.core.map((d, i) => muscle(d, 'core', `k${i}`))}
              {m.absRects.map((r, i) => rect(r, 'core', `a${i}`))}
              {m.legs.map((d, i) => muscle(d, 'legs', `l${i}`))}
            </G>
          );
        }
        const m = backMuscles(S, s);
        return (
          <G key={'m' + s}>
            {m.back.map((d, i) => muscle(d, 'back', `b${i}`))}
            {m.legs.map((d, i) => muscle(d, 'legs', `l${i}`))}
          </G>
        );
      })}
      {/* Brazos (encima del tronco), ligeramente separados del cuerpo */}
      {sides.map((s) => {
        const am = armMuscles(S, s);
        return (
          <G key={'arm' + s} rotation={-s * 9} origin={`${100 + s * (S.sh - 10)}, 84`}>
            <Path d={armPath(S, s)} fill={p.bg} stroke={line} strokeWidth={1.6} strokeLinejoin="round" />
            {muscle(am.delt, 'shoulders', 'd')}
            {muscle(am.upper, 'arms', 'u')}
            {muscle(am.fore, 'arms', 'f')}
          </G>
        );
      })}
      {/* Cabeza */}
      <Ellipse cx={100} cy={30} rx={S.female ? 16.5 : 18} ry={S.female ? 21.5 : 23} fill={p.bg} stroke={line} strokeWidth={1.6} />
    </Svg>
  );
}

export function BodyMap({
  sex,
  bmi,
  counts,
  labels,
}: {
  sex: Sex;
  bmi: number | null;
  counts: Record<string, number>;
  labels: { front: string; back: string; legend: string };
}) {
  const { p } = useTheme();
  const shape = bodyShape(sex, bmi);
  const fill: Fill = (g) => heatColor(counts[g] ?? 0);
  return (
    <View style={[styles.wrap, { borderColor: p.border }]}>
      <View style={styles.figures} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={styles.col}>
          <Figure view="front" shape={shape} fill={fill} />
          <Text style={[styles.caption, { color: p.secondary }]}>{labels.front}</Text>
        </View>
        <View style={styles.col}>
          <Figure view="back" shape={shape} fill={fill} />
          <Text style={[styles.caption, { color: p.secondary }]}>{labels.back}</Text>
        </View>
      </View>
      <View style={styles.legend}>
        {[0, 1, 2, 3].map((n) => (
          <View key={n} style={styles.legendItem}>
            <View style={[styles.legendDot, { borderColor: p.text, backgroundColor: heatColor(n) ?? p.bg }]} />
            <Text style={[styles.legendText, { color: p.secondary }]}>{n === 3 ? '3+' : n}</Text>
          </View>
        ))}
        <Text style={[styles.legendText, { color: p.secondary, marginLeft: 4 }]}>{labels.legend}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 12, marginTop: 4 },
  figures: { flexDirection: 'row', justifyContent: 'space-evenly' },
  col: { alignItems: 'center', gap: 6 },
  caption: { fontSize: 13, fontWeight: '600' },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5 },
  legendText: { fontSize: 13 },
});
