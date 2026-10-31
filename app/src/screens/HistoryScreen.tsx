import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '../data';
import type { Session } from '../store';
import { sessionVolume, sessionSets, sortByDate } from '../lib/gym';
import { COLORS, RADII } from '../theme';

export default function HistoryScreen({
  sessions,
  exercises,
  onDeleted,
  onOpenExercise,
}: {
  sessions: Session[];
  exercises: Exercise[];
  onDeleted: (id: string) => void;
  onOpenExercise: (id: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const list = sortByDate(sessions);
  const lang = i18n.language as string;
  const byId = new Map(exercises.map((e) => [e.id, e]));
  const nameOf = (e?: { name_en: string; name_nl: string }) =>
    e ? (lang === 'nl' ? e.name_nl || e.name_en : e.name_en) : '';

  const confirmDelete = (s: Session) => {
    Alert.alert(t('hist_delete'), s.date, [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => onDeleted(s.id) },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.title}>{t('hist_title')}</Text>
      <Text style={styles.sub}>{t('hist_sub')}</Text>

      {list.length === 0 ? (
        <Text style={styles.empty}>{t('hist_empty')}</Text>
      ) : (
        list.map((s) => (
          <View key={s.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardDate}>{s.date}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t('hist_delete')}
                onPress={() => confirmDelete(s)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.delete}>{t('delete')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardMeta}>
              <Text style={styles.cardMetaText}>
                {s.exercises.length} {t('hist_exercises')} · {sessionSets(s)}{' '}
                {t('hist_sets_total')}
              </Text>
              <Text style={styles.cardVolume}>
                {Math.round(sessionVolume(s)).toLocaleString(lang)} kg {t('hist_volume')}
              </Text>
            </View>
            {s.exercises.map((ex) => {
              const e = byId.get(ex.exercise_id);
              return (
                <TouchableOpacity
                  key={ex.exercise_id}
                  style={styles.exRow}
                  accessibilityRole="button"
                  accessibilityLabel={nameOf(e)}
                  onPress={() => e && onOpenExercise(e.id)}
                  activeOpacity={0.7}
                >
                  {e ? (
                    <Image source={e.imageAsset} style={styles.exThumb} resizeMode="cover" />
                  ) : null}
                  <Text style={styles.exName} numberOfLines={1}>
                    {nameOf(e) || ex.exercise_id}
                  </Text>
                  <Text style={styles.exSets}>
                    {ex.sets.map((st) => `${st.reps}×${st.weight_kg}kg`).join(' · ')}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {s.notes ? <Text style={styles.notes}>{s.notes}</Text> : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: COLORS.bg,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: COLORS.text,
  },
  sub: {
    fontSize: 14,
    color: COLORS.secondary,
    marginTop: 4,
    marginBottom: 16,
  },
  empty: {
    fontSize: 14,
    color: COLORS.dim,
    backgroundColor: COLORS.section,
    borderRadius: RADII.tile,
    padding: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.tile,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  delete: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.red,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 10,
  },
  cardMetaText: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  cardVolume: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.blue,
  },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.cardBorder,
  },
  exThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.section,
  },
  exName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 10,
  },
  exSets: {
    fontSize: 12,
    color: COLORS.dim,
    maxWidth: 150,
  },
  notes: {
    fontSize: 13,
    color: COLORS.secondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
