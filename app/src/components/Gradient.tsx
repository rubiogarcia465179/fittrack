/** Degradado premium vertical — NATIVO (iOS/Android).
 *  El gradado se pinta `absolute` detrás del contenido; el contenido
 *  determina el tamaño de la caja y el gradado la llena.
 *  `style` → caja (borderRadius, etc.); `contentStyle` → padding del contenido. */
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

const ABS_FILL: ViewStyle = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };

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
  return (
    <View style={style as StyleProp<ViewStyle>}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={ABS_FILL}
        accessibilityElementsHidden
      />
      <View style={contentStyle as StyleProp<ViewStyle>}>{children}</View>
    </View>
  );
}
