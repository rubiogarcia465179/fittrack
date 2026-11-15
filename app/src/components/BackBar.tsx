/**
 * Barra "atrás" para las pantallas que cuelgan de Inicio (Historial,
 * Ejercicios): chevron + nombre de la pantalla de origen, objetivo ≥ 44 pt.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme-context';
import { Chevron } from './Chevron';

export function BackBar({ label, onBack }: { label: string; onBack: () => void }) {
  const { p } = useTheme();
  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onBack}
        hitSlop={8}
        style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.6 : 1 }]}
      >
        <Chevron dir="left" color={p.text} />
        <Text style={[styles.label, { color: p.text }]}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { paddingHorizontal: 12, paddingTop: 4 },
  btn: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingRight: 12 },
  label: { fontSize: 17, fontWeight: '600' },
});
