/** Degradado premium vertical — WEB. react-native-linear-gradient no tiene
 *  build para web (requireNativeComponent rompe el bundle), así que aquí se
 *  usa `background: linear-gradient(180deg, …)`, igual que PickerSheet.
 *  `style` → caja (borderRadius, etc.); `contentStyle` → padding del contenido. */
import { View, type StyleProp, type ViewStyle } from 'react-native';

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
    <View
      style={[
        {
          overflow: 'hidden',
          // Todas las paradas, repartidas uniformemente (igual que LinearGradient nativo).
          background: `linear-gradient(180deg, ${colors.join(', ')})`,
        } as ViewStyle,
        style as StyleProp<ViewStyle>,
      ]}
    >
      <View style={contentStyle as StyleProp<ViewStyle>}>{children}</View>
    </View>
  );
}
