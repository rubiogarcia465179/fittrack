import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Chevron } from '../components/Chevron';
import { exName } from '../lib/names';
import { howtoFor } from '../howto';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '../data';
import { GROUP_COLORS, RADII } from '../theme';
import { useTheme } from '../theme-context';
import { useScale, fs } from '../scale';

export default function DetailScreen({
  exercise,
  onBack,
}: {
  exercise: Exercise;
  onBack: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { p, SHADOW } = useTheme();
  const scale = useScale();
  const lang = i18n.language as string;
  const name = exName(exercise, lang);

  return (
    <View style={[styles.body, { backgroundColor: p.bg }]}>
      <View style={[styles.topbar, { borderBottomColor: p.border }]}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1, transition: 'opacity 90ms ease' }]}
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Chevron color={p.text} dir="left" />
            <Text style={[styles.back, { color: p.text }]}>{t('back')}</Text>
          </View>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Sin imagen placeholder ("auténtico o nada"): las fotos reales
            llegarán con la Fase 13. */}
        <Text style={[styles.name, { fontSize: fs(scale, 28), color: p.text }]}>{name}</Text>
        {exercise.aliases && exercise.aliases.length > 0 ? (
          <Text style={[styles.aliases, { color: p.dim }]}>
            {lang === 'en' ? exercise.name_nl : exercise.name_en}
            {exercise.aliases.length ? ' · ' + exercise.aliases.join(', ') : ''}
          </Text>
        ) : null}

        <View style={styles.metaGrid}>
          <Meta label={t('ex_muscle')} value={t(`group_${exercise.muscle_group}`)} color={GROUP_COLORS[exercise.muscle_group]} />
          <Meta label={t('ex_secondary')} value={(exercise.secondary_muscles || []).join(', ') || '—'} />
          {exercise.equipment !== 'other' ? <Meta label={t('ex_equipment')} value={t(`equip_${exercise.equipment}`)} /> : null}
          <Meta label={t('ex_level')} value={t(`level_${exercise.level}`)} />
          <Meta label={t('ex_source')} value={t(`source_${exercise.source}`)} />
          {exercise.license ? (
            <Meta
              label={`${t('ex_license')} · ${t('ex_credit')}`}
              value={`${exercise.license}${exercise.credit ? ' · ' + exercise.credit : ''} (wger.de)`}
            />
          ) : null}
        </View>

        <Text style={[styles.sectionTitle, { color: p.text }]}>{t('ex_instructions')}</Text>
        <View style={styles.instructions}>
          {howtoFor(exercise.id, lang, exercise.instructions).map((line, i) => (
            <View key={i} style={styles.instrRow}>
              <Text style={[styles.instrNum, { color: p.accent }]}>{i + 1}</Text>
              <Text style={[styles.instrText, { color: p.text }]}>{line}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Meta({ label, value, color }: { label: string; value: string; color?: string }) {
  const { p, SHADOW } = useTheme();
  return (
    <View style={[styles.meta, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card }]}>
      <Text style={[styles.metaLabel, { color: p.dim }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: p.text }, color ? { color } : null]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  topbar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  back: {
    fontSize: 15,
    fontWeight: '600',
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  hero: {
    width: '100%',
    aspectRatio: 4 / 3, // escala con el ancho en cualquier iPhone
    borderRadius: RADII.tile,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginTop: 16,
  },
  aliases: {
    fontSize: 13,
    marginTop: 4,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  meta: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 3,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 10,
  },
  instructions: {
    gap: 10,
  },
  instrRow: {
    flexDirection: 'row',
    gap: 10,
  },
  instrNum: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 22,
  },
  instrText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
