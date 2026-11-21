/**
 * Durante el descanso (R-164 / R-167):
 * - Si la siguiente serie es del MISMO ejercicio: un consejo al azar
 *   (respirar, beber, qué comer antes y después).
 * - Si toca OTRO ejercicio: su vista previa (dibujo en movimiento, nombre,
 *   series, cómo cargar el peso y "¿Cómo se hace?") para ir preparándolo.
 * Lo usan la sesión de la web y la de la app.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme-context';
import { ExerciseThumb } from './ExerciseThumb';
import { LoadLine } from './LoadLine';

export function RestPreview({
  next,
  tip,
  onHowTo,
  compact = false,
}: {
  /** Otro ejercicio a continuación (null = sigue el mismo → consejo). */
  next: { id: string; group: string; name: string; line: string; equipment?: string; name_en?: string; kg: number } | null;
  /** Índice del consejo (1..TIP_COUNT). */
  tip: number;
  onHowTo: (id: string) => void;
  /** App: dentro de la barra inferior, en fila y más pequeño. */
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const { p } = useTheme();
  if (!next) {
    return (
      <View style={[styles.tip, compact && styles.tipCompact, { borderColor: p.border }]} accessibilityLiveRegion="polite">
        <Text style={[styles.tipLabel, { color: p.secondary }, compact && { marginBottom: 2 }]}>{t('tip_label')}</Text>
        <Text style={[styles.tipText, compact && { fontSize: 14, lineHeight: 20 }, { color: p.text }]}>{t(`tip_${tip}`)}</Text>
      </View>
    );
  }
  const art = compact ? 64 : 140;
  return (
    <View style={[styles.card, compact && styles.cardCompact, { borderColor: p.border }]}>
      <Text style={[styles.tipLabel, { color: p.secondary }, compact && { marginBottom: 6 }]}>{t('ws_up_next')}</Text>
      <View style={compact ? styles.rowCompact : styles.col}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${next.name}. ${t('howto_button')}`}
          onPress={() => onHowTo(next.id)}
          style={({ pressed }) => [styles.art, { width: art + 16, height: art + 16, borderColor: p.border, opacity: pressed ? 0.7 : 1 }]}
        >
          <ExerciseThumb id={next.id} group={next.group} size={art} color={p.text} animate />
        </Pressable>
        <View style={compact ? { flex: 1, gap: 2 } : { alignItems: 'center', gap: 4, marginTop: 12 }}>
          <Text style={[styles.name, compact && { fontSize: 16, textAlign: 'left' }, { color: p.text }]} numberOfLines={2}>{next.name}</Text>
          <Text style={[styles.line, { color: p.secondary }, compact && { textAlign: 'left' }]}>{next.line}</Text>
          {!compact ? <LoadLine equipment={next.equipment} kg={next.kg} name_en={next.name_en} /> : null}
          <Pressable
            accessibilityRole="button"
            onPress={() => onHowTo(next.id)}
            style={({ pressed }) => [styles.howto, compact && { alignSelf: 'flex-start', marginTop: 4 }, { borderColor: p.border, opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={[styles.howtoText, { color: p.text }]}>{t('howto_button')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tip: { alignSelf: 'stretch', borderWidth: 1, borderRadius: 20, padding: 18, marginTop: 28 },
  tipCompact: { marginTop: 8, padding: 0, borderWidth: 0 },
  tipLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 },
  tipText: { fontSize: 17, lineHeight: 24 },
  card: { alignSelf: 'stretch', borderWidth: 1, borderRadius: 20, padding: 18, marginTop: 28, alignItems: 'center' },
  cardCompact: { marginTop: 10, padding: 12, borderRadius: 14, alignItems: 'stretch' },
  col: { alignItems: 'center' },
  rowCompact: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  art: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, textAlign: 'center' },
  line: { fontSize: 15, textAlign: 'center', fontVariant: ['tabular-nums'] },
  howto: { marginTop: 8, minHeight: 44, paddingHorizontal: 18, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  howtoText: { fontSize: 15, fontWeight: '700' },
});
