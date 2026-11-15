/**
 * Mapa muscular de la semana (Inicio) — figura que se GIRA con el dedo.
 *
 * - Arte: las SVG de referencia del usuario (front.svg / back.svg), transcritas
 *   en ./body/paths.ts (mitad derecha + reflejo), con fibras musculares.
 * - Giro 3D: dos caras (frente y espalda) en una "peana" con perspectiva
 *   (`perspective` + `rotateY`, `backfaceVisibility: hidden`). Se arrastra en
 *   horizontal; al soltar se asienta en frente o espalda (con la inercia del
 *   gesto). "Delante" / "Detrás" hacen lo mismo con un toque (accesible).
 *   La sombra del suelo se estrecha al girar. No es un modelo volumétrico:
 *   para eso haría falta un modelo 3D (glTF) + three.js.
 * - Color por grupo según las sesiones de esta semana: 0 → sin color,
 *   1 → verde, 2 → naranja, 3+ → violeta (el rojo se leía como alarma).
 * - Perfil: el IMC ensancha o estrecha la figura con suavidad; mujer → algo
 *   más estrecha (el arte de referencia es un único cuerpo).
 * - Colores del tema (p.bg / p.card / p.text): funciona en Noche y Día.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Ellipse, G, Line, Path, RadialGradient, Stop } from 'react-native-svg';
import { useTheme } from '../theme-context';
import { BACK_HALF, FRONT_HALF, HEAD, MIDLINE, NECK, SKIN_HALF, VIEW_H, VIEW_W, type Group, type Piece } from './body/paths';

export type Sex = 'male' | 'female' | 'other' | undefined;
export const HEAT = { 1: '#00E676', 2: '#FF9F0A', 3: '#BF5AF2' } as const;

export function heatColor(n: number): string | null {
  if (n <= 0) return null;
  return n === 1 ? HEAT[1] : n === 2 ? HEAT[2] : HEAT[3];
}

/** Anchura relativa de la figura según sexo e IMC (cambios suaves). */
export function widthFactor(sex: Sex, bmi: number | null): number {
  const b = bmi && bmi > 10 && bmi < 60 ? bmi : 22;
  let k = b < 18.5 ? Math.max(0.86, 1 - (18.5 - b) * 0.03) : b > 25 ? Math.min(1.22, 1 + (b - 25) * 0.022) : 1;
  if (sex === 'female') k *= 0.9;
  return k;
}

const FIG_W = 186;
const FIG_H = Math.round((FIG_W * VIEW_H) / VIEW_W);
const DRAG = 0.9; // grados por píxel

function Face({ half, counts }: { half: Piece[]; counts: Record<string, number> }) {
  const { p } = useTheme();
  const skin = p.bg;
  const muscleOff = p.card;
  const line = p.text;
  const fillOf = (g?: Group) => (g ? heatColor(counts[g] ?? 0) : null) ?? muscleOff;
  const halfShapes = (prefix: string) => (
    <>
      <Path d={SKIN_HALF} fill={skin} stroke={line} strokeWidth={2} strokeLinejoin="round" />
      {half.map((pc, i) =>
        pc.kind === 'skin' ? (
          <Path key={prefix + i} d={pc.d} fill={skin} stroke={line} strokeWidth={2} strokeLinejoin="round" />
        ) : pc.kind === 'm' ? (
          <Path key={prefix + i} d={pc.d} fill={fillOf(pc.group)} stroke={line} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        ) : (
          <Path key={prefix + i} d={pc.d} fill="none" stroke={line} strokeWidth={0.75} strokeOpacity={0.5} strokeLinecap="round" />
        ),
      )}
    </>
  );
  return (
    <Svg width={FIG_W} height={FIG_H} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
      <Ellipse cx={HEAD.cx} cy={HEAD.cy} rx={HEAD.rx} ry={HEAD.ry} fill={skin} stroke={line} strokeWidth={2} />
      <Path d={NECK} fill={skin} stroke={line} strokeWidth={2} strokeLinejoin="round" />
      <G>{halfShapes('r')}</G>
      <G transform={`translate(${VIEW_W},0) scale(-1,1)`}>{halfShapes('l')}</G>
      <Line x1={MIDLINE.x} y1={MIDLINE.y1} x2={MIDLINE.x} y2={MIDLINE.y2} stroke={line} strokeWidth={1.2} strokeOpacity={0.6} />
    </Svg>
  );
}

export function BodyMap({
  sex,
  bmi,
  counts,
  labels,
  summary,
}: {
  sex: Sex;
  bmi: number | null;
  counts: Record<string, number>;
  labels: { front: string; back: string; legend: string; hint: string };
  /** Resumen para lectores de pantalla ("Pecho 1, Brazos 2…"). */
  summary: string;
}) {
  const { p } = useTheme();
  const angle = useRef(new Animated.Value(0)).current;
  const cur = useRef(0);
  const start = useRef(0);
  const [side, setSide] = useState<'front' | 'back'>('front');

  useEffect(() => {
    const id = angle.addListener(({ value }) => {
      cur.current = value;
    });
    return () => angle.removeListener(id);
  }, [angle]);

  const snap = (target: number) => {
    const turns = Math.round(target / 180);
    setSide(((turns % 2) + 2) % 2 === 0 ? 'front' : 'back');
    Animated.spring(angle, { toValue: turns * 180, useNativeDriver: Platform.OS !== 'web', friction: 8, tension: 38 }).start();
  };
  const turnTo = (s: 'front' | 'back') => {
    const v = cur.current;
    const base = Math.round(v / 360) * 360;
    const cands = s === 'front' ? [base - 360, base, base + 360] : [base - 180, base + 180];
    snap(cands.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a)));
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
        onPanResponderGrant: () => {
          angle.stopAnimation((v) => {
            start.current = v;
          });
        },
        onPanResponderMove: (_, g) => angle.setValue(start.current + g.dx * DRAG),
        onPanResponderRelease: (_, g) => snap(start.current + g.dx * DRAG + g.vx * 140),
        onPanResponderTerminate: (_, g) => snap(start.current + g.dx * DRAG),
        onPanResponderTerminationRequest: () => false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const toDeg = { inputRange: [-360, 360], outputRange: ['-360deg', '360deg'], extrapolate: 'extend' as const };
  const frontRot = angle.interpolate(toDeg);
  const backRot = Animated.add(angle, 180).interpolate(toDeg);
  // Sombra: más estrecha de perfil (90°), plena de frente/espalda.
  const phase = Animated.modulo(Animated.add(angle, 3600), 180);
  const shadowScale = phase.interpolate({ inputRange: [0, 90, 180], outputRange: [1, 0.45, 1] });
  // Qué cara se ve: no depende de backfaceVisibility (en web no es fiable).
  // q = (ángulo + 90) mod 360 → frente visible en [0, 180).
  const q = Animated.modulo(Animated.add(angle, 3690), 360);
  const frontOpacity = q.interpolate({ inputRange: [0, 179.9, 180, 360], outputRange: [1, 1, 0, 0] });
  const backOpacity = q.interpolate({ inputRange: [0, 179.9, 180, 360], outputRange: [0, 0, 1, 1] });
  const k = widthFactor(sex, bmi);

  return (
    <View style={[styles.wrap, { borderColor: p.border }]}>
      <View
        style={styles.stage}
        {...pan.panHandlers}
        accessible
        accessibilityRole="image"
        accessibilityLabel={`${side === 'front' ? labels.front : labels.back}. ${summary}`}
      >
        <View style={{ width: FIG_W, height: FIG_H, transform: [{ scaleX: k }] }}>
          <Animated.View style={[styles.face, { opacity: frontOpacity, transform: [{ perspective: 900 }, { rotateY: frontRot }] }]}>
            <Face half={FRONT_HALF} counts={counts} />
          </Animated.View>
          <Animated.View style={[styles.face, { opacity: backOpacity, transform: [{ perspective: 900 }, { rotateY: backRot }] }]}>
            <Face half={BACK_HALF} counts={counts} />
          </Animated.View>
        </View>
        <Animated.View style={[styles.shadow, { transform: [{ scaleX: shadowScale }] }]}>
          <Svg width={150} height={18}>
            <Defs>
              <RadialGradient id="floor" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0" stopColor={p.text} stopOpacity={0.28} />
                <Stop offset="1" stopColor={p.text} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Ellipse cx={75} cy={9} rx={75} ry={9} fill="url(#floor)" />
          </Svg>
        </Animated.View>
        <Text style={[styles.hint, { color: p.secondary }]}>{labels.hint}</Text>
      </View>

      {/* Delante / Detrás: el mismo giro con un toque */}
      <View style={[styles.seg, { borderColor: p.border }]} accessibilityRole="tablist">
        {(['front', 'back'] as const).map((s) => {
          const on = side === s;
          return (
            <Pressable
              key={s}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => turnTo(s)}
              style={({ pressed }) => [styles.segBtn, { backgroundColor: on ? p.accent : 'transparent', opacity: pressed ? 0.75 : 1 }]}
            >
              <Text style={[styles.segText, { color: on ? p.onAccent : p.text }]}>{s === 'front' ? labels.front : labels.back}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legend}>
        {[0, 1, 2, 3].map((n) => (
          <View key={n} style={styles.legendItem}>
            <View style={[styles.legendDot, { borderColor: p.text, backgroundColor: heatColor(n) ?? p.card }]} />
            <Text style={[styles.legendText, { color: p.secondary }]}>{n === 3 ? '3+' : n}</Text>
          </View>
        ))}
        <Text style={[styles.legendText, { color: p.secondary, marginLeft: 4 }]}>{labels.legend}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, paddingTop: 18, paddingBottom: 16, paddingHorizontal: 12, marginTop: 4 },
  stage: { alignItems: 'center' },
  face: { position: 'absolute', left: 0, top: 0, width: FIG_W, height: FIG_H, backfaceVisibility: 'hidden' },
  shadow: { width: 150, height: 18, marginTop: -10 },
  hint: { fontSize: 13, marginTop: 10 },
  seg: { flexDirection: 'row', alignSelf: 'center', borderWidth: 1, borderRadius: 22, padding: 3, marginTop: 12 },
  segBtn: { minHeight: 38, minWidth: 104, borderRadius: 19, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  segText: { fontSize: 15, fontWeight: '600' },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5 },
  legendText: { fontSize: 13 },
});
