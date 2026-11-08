import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '../data';
import { COLORS, GROUP_COLORS, RADII } from '../theme';

export default function DetailScreen({
  exercise,
  onBack,
}: {
  exercise: Exercise;
  onBack: () => void;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as string;
  const name = lang === 'nl' ? exercise.name_nl || exercise.name_en : exercise.name_en;

  return (
    <View style={styles.body}>
      <View style={styles.topbar}>
        <TouchableOpacity
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.back}>{'←'} {t('back')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image
          source={exercise.imageAsset}
          style={styles.hero}
          resizeMode="cover"
          accessibilityLabel={name}
        />
        <Text style={styles.name}>{name}</Text>
        {exercise.aliases && exercise.aliases.length > 0 ? (
          <Text style={styles.aliases}>
            {lang === 'nl' ? exercise.name_en : exercise.name_nl}
            {exercise.aliases.length ? ' · ' + exercise.aliases.join(', ') : ''}
          </Text>
        ) : null}

        <View style={styles.metaGrid}>
          <Meta label={t('ex_muscle')} value={t(`group_${exercise.muscle_group}`)} color={GROUP_COLORS[exercise.muscle_group]} />
          <Meta label={t('ex_secondary')} value={(exercise.secondary_muscles || []).join(', ') || '—'} />
          <Meta label={t('ex_equipment')} value={t(`equip_${exercise.equipment}`)} />
          <Meta label={t('ex_level')} value={t(`level_${exercise.level}`)} />
          <Meta label={t('ex_source')} value={t(`source_${exercise.source}`)} />
          {exercise.license ? (
            <Meta
              label={`${t('ex_license')} · ${t('ex_credit')}`}
              value={`${exercise.license}${exercise.credit ? ' · ' + exercise.credit : ''} (wger.de)`}
            />
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>{t('ex_instructions')}</Text>
        <View style={styles.instructions}>
          {exercise.instructions?.map((line, i) => (
            <View key={i} style={styles.instrRow}>
              <Text style={styles.instrNum}>{i + 1}</Text>
              <Text style={styles.instrText}>{line}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Meta({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.meta}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={[styles.metaValue, color ? { color } : null]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  topbar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  back: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.blue,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  hero: {
    width: '100%',
    aspectRatio: 4 / 3, // escala con el ancho en cualquier iPhone
    borderRadius: RADII.tile,
    backgroundColor: COLORS.section,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: COLORS.text,
    marginTop: 16,
  },
  aliases: {
    fontSize: 13,
    color: COLORS.dim,
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
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 12,
  },
  metaLabel: {
    fontSize: 11,
    color: COLORS.dim,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 3,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: COLORS.text,
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
    color: COLORS.blue,
    minWidth: 22,
  },
  instrText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },
});
