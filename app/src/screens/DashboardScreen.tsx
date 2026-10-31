import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ExerciseRow } from '../lib/gym';
import type { Session } from '../store';
import {
  weeklyVolume,
  streakDays,
  sessionVolume,
  sessionSets,
  latestWeight,
  groupTotals,
  newPrs,
  weekStart,
  todayISO,
} from '../lib/gym';
import { COLORS, GROUP_COLORS, RADII } from '../theme';
import BarChart, { type Bar } from '../components/BarChart';

export default function DashboardScreen({
  exercises,
  sessions,
  onOpenExercise,
  onOpenHistory,
}: {
  exercises: ExerciseRow[];
  sessions: Session[]; // ordenadas de más reciente a más antigua
  onOpenExercise: (id: string) => void;
  onOpenHistory: () => void;
}) {
  const { t, i18n } = useTranslation();

  const weekVolume = weeklyVolume(sessions, 4);
  const currentWeek = weekStart(todayISO());
  const sessionsThisWeek = sessions.filter((s) => weekStart(s.date) === currentWeek).length;
  const volumeThisWeek = weekVolume[weekVolume.length - 1]?.volume ?? 0;
  const streak = streakDays(sessions);
  const prs = sessions.length ? newPrs(sessions[0], sessions).length : 0;
  const weight = latestWeight(sessions);

  const groupBars: Bar[] = Object.entries(groupTotals(sessions, exercises, 7)).map(
    ([g, v]) => ({
      label: t(`group_${g}`),
      value: v,
      color: GROUP_COLORS[g] || COLORS.dim,
    }),
  );
  const weekBars: Bar[] = weekVolume.map((w) => ({
    label: w.week_start.slice(5),
    value: w.volume,
  }));

  const lang = i18n.language as string;
  const nameOf = (e?: { name_en: string; name_nl: string }) =>
    e ? (lang === 'nl' ? e.name_nl || e.name_en : e.name_en) : '';

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.title}>{t('dash_title')}</Text>
      <Text style={styles.sub}>{t('dash_sub')}</Text>

      {sessions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{t('dash_no_sessions')}</Text>
          <Text style={styles.emptyHint}>{t('dash_empty_hint')}</Text>
        </View>
      ) : (
        <>
          <View style={styles.statGrid}>
            <Stat value={Math.round(volumeThisWeek).toLocaleString(lang)} label={t('stat_weekly_volume')} />
            <Stat value={String(sessionsThisWeek)} label={t('stat_weekly_sessions')} />
            <Stat value={String(streak)} label={t('stat_streak')} />
            <Stat value={String(prs)} label={t('stat_pr')} accent={prs > 0} />
          </View>

          <View style={styles.weightRow}>
            <Text style={styles.statLabel}>{t('stat_weight')}</Text>
            <Text style={styles.weightValue}>
              {weight ? `${weight.toLocaleString(lang)} kg` : t('dash_no_weight')}
            </Text>
          </View>

          <BarChart title={t('dash_volume_7d')} data={weekBars} emptyText={t('dash_no_sessions')} />

          <BarChart
            title={t('dash_groups')}
            data={groupBars}
            emptyText={t('dash_no_sessions')}
            height={110}
          />

          <Text style={styles.sectionTitle}>{t('dash_recent')}</Text>
          {sessions.slice(0, 5).map((s) => (
            <View
              key={s.id}
              style={styles.recentRow}
              accessibilityRole="button"
              accessibilityLabel={`${s.date}`}
            >
              <TouchableOpacity
                style={styles.recentLeft}
                accessibilityRole="button"
                accessibilityLabel={`${s.date}`}
                onPress={onOpenHistory}
              >
                <Text style={styles.recentDate}>{s.date}</Text>
                <Text style={styles.recentMeta} numberOfLines={1}>
                  {s.exercises.length} {t('hist_exercises')} · {sessionSets(s)} {t('hist_sets_total')}
                </Text>
              </TouchableOpacity>
              <View style={styles.recentRight}>
                <Text style={styles.recentVolume}>
                  {Math.round(sessionVolume(s)).toLocaleString(lang)} kg
                </Text>
                <Text
                  style={styles.recentNames}
                  numberOfLines={1}
                  accessibilityElementsHidden
                >
                  {s.exercises
                    .map((ex) => nameOf(exercises.find((e) => e.id === ex.exercise_id)))
                    .filter(Boolean)
                    .join(', ')}
                </Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

function Stat({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, accent && { color: COLORS.green }]}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: 20,
    paddingBottom: 32,
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
    marginBottom: 20,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADII.tile,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.section,
    borderRadius: RADII.tile,
    padding: 14,
    marginBottom: 14,
  },
  weightValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.tile,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyHint: {
    fontSize: 13,
    color: COLORS.dim,
    marginTop: 6,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 22,
    marginBottom: 10,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 12,
    marginBottom: 8,
  },
  recentLeft: {
    flexShrink: 1,
  },
  recentDate: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  recentMeta: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
    maxWidth: 130,
  },
  recentRight: {
    marginLeft: 10,
    maxWidth: 150,
  },
  recentVolume: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.blue,
    textAlign: 'right',
  },
  recentNames: {
    fontSize: 11,
    color: COLORS.dim,
    marginTop: 2,
    textAlign: 'right',
  },
});
