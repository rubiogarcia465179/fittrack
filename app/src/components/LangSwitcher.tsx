import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LANGS, LANG_LABELS, type Lang } from '../i18n';
import { useTheme } from '../theme-context';

/** Botones NL/ES/EN/FR — conmutación instantánea (bundles embebidos, 0 red).
 *  Feedback táctil inmediato (escala al pulsar) y estado activo nítido. */
export default function LangSwitcher({
  lng,
  onPick,
}: {
  lng: Lang;
  onPick: (l: Lang) => void;
}) {
  const { p } = useTheme();
  return (
    <View style={styles.row} accessibilityLabel="Idioma">
      {LANGS.map((l) => {
        const active = lng === l;
        return (
          <Pressable
            key={l}
            accessibilityRole="button"
            accessibilityLabel={LANG_LABELS[l]}
            accessibilityState={{ selected: active }}
            android_ripple={{ color: p.accent + '33' }}
            onPress={() => onPick(l)}
            onPressIn={() => {}}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: active ? p.accent : p.chipOff,
                borderColor: active ? p.accent : p.border,
                transform: [{ scale: pressed ? 0.92 : 1 }],
                transition: 'transform 90ms ease, background-color 120ms ease',
              },
              active && styles.chipActive,
            ]}
          >
            <Text style={[styles.chipText, { color: active ? '#fff' : p.secondary }]} numberOfLines={1}>
              {l.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 980,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {},
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
