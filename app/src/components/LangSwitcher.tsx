import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LANGS, LANG_LABELS, type Lang } from '../i18n';
import { useTheme } from '../theme-context';

/** Selector de idioma — conmutación instantánea (bundles embebidos, 0 red).
 *  Vive en Perfil (ajuste, no navegación). `full` muestra el nombre del
 *  idioma en su propia lengua ("Español"), como en Ajustes de iOS. */
export default function LangSwitcher({
  lng,
  onPick,
  full = false,
}: {
  lng: Lang;
  onPick: (l: Lang) => void;
  full?: boolean;
}) {
  const { p } = useTheme();
  return (
    <View style={[styles.row, full && styles.rowFull]} accessibilityRole="radiogroup">
      {LANGS.map((l) => {
        const active = lng === l;
        return (
          <Pressable
            key={l}
            accessibilityRole="radio"
            accessibilityLabel={LANG_LABELS[l]}
            accessibilityState={{ checked: active }}
            android_ripple={{ color: p.accent + '33' }}
            onPress={() => onPick(l)}
            style={({ pressed }) => [
              styles.chip,
              full && styles.chipFull,
              {
                backgroundColor: active ? p.accent : p.chipOff,
                borderColor: active ? p.accent : p.border,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <Text
              style={[styles.chipText, full && styles.chipTextFull, { color: active ? '#fff' : p.text }]}
              numberOfLines={1}
            >
              {full ? LANG_LABELS[l] : l.toUpperCase()}
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
  rowFull: {
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 980,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipFull: {
    minHeight: 44,
    paddingHorizontal: 16,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  chipTextFull: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
  },
});
