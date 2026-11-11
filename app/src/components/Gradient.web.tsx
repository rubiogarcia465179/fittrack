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
          background: `linear-gradient(180deg, ${colors[0]} 0%, ${colors[colors.length - 1]} 100%)`,
        } as ViewStyle,
        style as StyleProp<ViewStyle>,
      ]}
    >
      <View style={contentStyle as StyleProp<ViewStyle>}>{children}</View>
    </View>
  );
}
