/** Degradado vertical — NATIVO (iOS/Android), sin librerías nativas.
 *  `react-native-linear-gradient` no existe en Expo Go ("View config not found
 *  for component BVLinearGradient"), así que el degradado se aproxima con
 *  franjas apiladas que interpolan entre los dos colores. Con la paleta actual
 *  (negro → negro, blanco → gris claro) es indistinguible de uno real.
 *  `style` → caja (borderRadius, etc.); `contentStyle` → padding del contenido. */
import { View, type StyleProp, type ViewStyle } from 'react-native';

const ABS_FILL: ViewStyle = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' };
const STEPS = 8;

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  if (!ca || !cb) return t < 0.5 ? a : b;
  const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export function Gradient({
  colors,
  style,
  contentStyle,
  children,
}: {
  colors: string[];
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  const from = colors[0] ?? 'transparent';
  const to = colors[colors.length - 1] ?? from;
  const flat = from.toLowerCase() === to.toLowerCase();
  return (
    <View style={[style as StyleProp<ViewStyle>, { overflow: 'hidden' }]}>
      <View style={[ABS_FILL, { backgroundColor: from }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {flat
          ? null
          : Array.from({ length: STEPS }, (_, i) => (
              <View key={i} style={{ flex: 1, backgroundColor: mix(from, to, (i + 0.5) / STEPS) }} />
            ))}
      </View>
      <View style={contentStyle as StyleProp<ViewStyle>}>{children}</View>
    </View>
  );
}
