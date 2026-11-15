import { View, StyleSheet } from 'react-native';

/** Chevron dibujado (sin glifos de fuente: nada de "tofu" en ningún equipo). */
export function Chevron({ color, dir = 'right', size = 8 }: { color: string; dir?: 'right' | 'down' | 'up' | 'left'; size?: number }) {
  const rot = dir === 'right' ? '45deg' : dir === 'down' ? '135deg' : dir === 'left' ? '-135deg' : '-45deg';
  return (
    <View style={[styles.wrap, { width: size + 6, height: size + 6 }]} accessibilityElementsHidden importantForAccessibility="no">
      <View style={{ width: size, height: size, borderTopWidth: 2, borderRightWidth: 2, borderColor: color, transform: [{ rotate: rot }] }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
