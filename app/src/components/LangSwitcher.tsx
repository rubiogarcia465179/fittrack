import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LANGS, LANG_LABELS, type Lang } from '../i18n';
import { COLORS } from '../theme';

/** Botones NL/ES/EN/FR — conmutación instantánea (bundles embebidos, 0 red). */
export default function LangSwitcher({
  lng,
  onPick,
}: {
  lng: Lang;
  onPick: (l: Lang) => void;
}) {
  return (
    <View style={styles.row} accessibilityLabel="Idioma">
      {LANGS.map((l) => (
        <TouchableOpacity
          key={l}
          accessibilityRole="button"
          accessibilityLabel={LANG_LABELS[l]}
          accessibilityState={{ selected: lng === l }}
          style={[styles.chip, lng === l && styles.chipActive]}
          onPress={() => onPick(l)}
        >
          <Text style={[styles.chipText, lng === l && styles.chipTextActive]}>
            {l.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 980,
    backgroundColor: COLORS.section,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
    letterSpacing: 0.3,
  },
  chipTextActive: {
    color: '#ffffff',
  },
});
