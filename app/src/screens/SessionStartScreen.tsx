/**
 * Arranque de sesión (R-14): dos caminos claros, a un toque, sin scroll.
 *  - "Recomiéndame un entreno" -> wizard paso a paso.
 *  - "Añado mis datos yo" -> sesión en blanco (se registran ejercicios a mano).
 */
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme-context';
import { useScale, fs } from '../scale';
import { RADII } from '../theme';

export default function SessionStartScreen({
  onRecommend,
  onManual,
}: {
  onRecommend: () => void;
  onManual: () => void;
}) {
  const { t } = useTranslation();
  const { p, SHADOW } = useTheme();
  const scale = useScale();

  const Card = ({ title, desc, onPress, tint }: { title: string; desc: string; onPress: () => void; tint: 'accent' | 'plain' }) => (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: p.card,
          borderColor: tint === 'accent' ? p.accent : p.cardBorder,
          ...(tint === 'accent' ? SHADOW.card : {}),
          transform: [{ scale: pressed ? 0.98 : 1 }],
          transition: 'transform 90ms ease',
        },
      ]}
    >
      <View style={[styles.badge, { backgroundColor: tint === 'accent' ? p.accent : p.section }]}>
        {tint === 'accent' ? (
          // flecha "→" dibujada
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 16, height: 3, borderRadius: 2, backgroundColor: '#fff' }} />
            <View style={{ width: 0, height: 0, borderTopWidth: 5, borderBottomWidth: 5, borderLeftWidth: 7, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#fff', marginLeft: -2 }} />
          </View>
        ) : (
          // "+" dibujado (añadir manual)
          <View style={{ width: 20, height: 20 }}>
            <View style={{ position: 'absolute', left: 0, top: 8, width: 20, height: 3.4, borderRadius: 2, backgroundColor: p.text }} />
            <View style={{ position: 'absolute', left: 8, top: 0, width: 3.4, height: 20, borderRadius: 2, backgroundColor: p.text }} />
          </View>
        )}
      </View>
      <Text style={[styles.cardTitle, { fontSize: fs(scale, 21), color: p.text }]}>{title}</Text>
      <Text style={[styles.cardDesc, { fontSize: fs(scale, 15), color: p.secondary }]}>{desc}</Text>
    </Pressable>
  );

  return (
    <View style={[styles.root, { backgroundColor: p.bg }]}>
      <Text style={[styles.title, { fontSize: fs(scale, 30), color: p.text }]}>{t('start_pick')}</Text>
      <Card
        title={t('start_reco_t')}
        desc={t('start_reco_d')}
        tint="accent"
        onPress={onRecommend}
      />
      <Card
        title={t('start_manual_t')}
        desc={t('start_manual_d')}
        tint="plain"
        onPress={onManual}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 14,
    // Centrado vertical: la pantalla de arranque no se queda a media altura
    // con un vacío abajo (mejor uso del espacio, sin scroll).
    justifyContent: 'center',
  },
  title: { fontWeight: '700', letterSpacing: -0.5, marginTop: 4 },
  card: {
    borderRadius: RADII.card,
    borderWidth: 1.5,
    padding: 18,
    gap: 8,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  badgeGlyph: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cardTitle: { fontWeight: '700', letterSpacing: -0.3 },
  cardDesc: { lineHeight: 21 },
});
