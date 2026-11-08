import { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
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
import { GROUP_COLORS, RADII } from '../theme';
import { useTheme } from '../theme-context';
import { useScale, fs } from '../scale';
import BarChart, { type Bar } from '../components/BarChart';
import { EmptyMarkGlyph } from '../components/TabIcon';
import { MonthCalendar, type DayStat } from '../components/Calendar';
import { DataSection } from '../components/DataSection';
import { plural } from '../lib/plural';
import { ExerciseGlyph } from './SessionScreen';

export default function DashboardScreen({
  exercises,
  sessions,
  benchmarks,
  onOpenExercise,
  onOpenHistory,
  onStartSession,
  onStartWorkout,
  onExport,
  onClearAll,
  onDataChanged,
}: {
  exercises: ExerciseRow[];
  sessions: Session[]; // ordenadas de más reciente a más antigua
  benchmarks: { name_en: string; name_nl: string; estimated_1rm: number }[];
  onOpenExercise: (id: string) => void;
  onOpenHistory: () => void;
  onStartSession: () => void;
  onStartWorkout: () => void;
  onExport: () => Promise<string>;
  onClearAll: () => Promise<void>;
  onDataChanged: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { p, SHADOW } = useTheme();
  const scale = useScale();

  // Calendario de actividad: mes actual por defecto, navegable mes a mes.
  const todayD = new Date();
  const [calM, setCalM] = useState<number>(todayD.getMonth());
  const [calY, setCalY] = useState<number>(todayD.getFullYear());

  const goPrev = () => {
    if (calM === 0) {
      setCalM(11);
      setCalY((y) => y - 1);
    } else {
      setCalM((m) => m - 1);
    }
  };
  const goNext = () => {
    if (calM === 11) {
      setCalM(0);
      setCalY((y) => y + 1);
    } else {
      setCalM((m) => m + 1);
    }
  };
  const goToday = () => {
    setCalM(todayD.getMonth());
    setCalY(todayD.getFullYear());
  };

  // Días con actividad -> nº de series (verde = entrenaste, rojo = no).
  const dayMap = useMemo(() => {
    const m: Record<string, DayStat> = {};
    for (const s of sessions) {
      const sets = sessionSets(s);
      m[s.date] = { sets: (m[s.date]?.sets ?? 0) + sets };
    }
    return m;
  }, [sessions]);

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
      color: GROUP_COLORS[g] || p.dim,
    }),
  );
  const weekBars: Bar[] = weekVolume.map((w) => ({
    label: w.week_start.slice(5),
    value: w.volume,
  }));

  const lang = i18n.language as string;
  const nameOf = (e?: { name_en: string; name_nl: string }) =>
    e ? (lang === 'nl' ? e.name_nl || e.name_en : e.name_en) : '';
  const benchName = (b: { name_en: string; name_nl: string }) =>
    lang === 'nl' ? b.name_nl || b.name_en : b.name_en;

  return (
    <ScrollView contentContainerStyle={[styles.body, { backgroundColor: p.bg }]}>
      <Text style={[styles.title, { fontSize: fs(scale, 32), color: p.text }]} numberOfLines={1}>
        {t('dash_title')}
      </Text>
      <Text style={[styles.sub, { color: p.secondary }]}>{t('dash_sub')}</Text>

      {/* CTA principal: generar entrenamiento personalizado (nuevo). */}
      <Pressable
        style={({ pressed }) => [styles.heroCta, { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.99 : 1 }], transition: 'transform 90ms ease, opacity 90ms ease', backgroundColor: p.accent, ...SHADOW.cta }]}
        accessibilityRole="button"
        accessibilityLabel={t('gen_cta')}
        onPress={onStartWorkout}
      >
        <View style={styles.heroRow}>
          <Text style={[styles.heroText, { color: '#fff' }]}>{t('gen_cta')}</Text>
          <Text style={styles.heroArrow}>{'→'}</Text>
        </View>
      </Pressable>

      {sessions.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card }]}>
          <View style={[styles.emptyMark, { backgroundColor: p.section }]}>
            <EmptyMarkGlyph size={30} />
          </View>
          <Text style={[styles.emptyTitle, { color: p.text }]}>{t('dash_no_sessions')}</Text>
          <Text style={[styles.emptyHint, { color: p.dim }]}>{t('dash_empty_hint')}</Text>
          <Pressable
            style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.85 : 1, transition: 'opacity 90ms ease', backgroundColor: p.accent }]}
            accessibilityRole="button"
            onPress={onStartSession}
          >
            <Text style={styles.ctaText}>{t('hero_cta_session')}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.statGrid}>
            <Stat value={Math.round(volumeThisWeek).toLocaleString(lang)} label={t('stat_weekly_volume')} scale={scale} />
            <Stat value={String(sessionsThisWeek)} label={t('stat_weekly_sessions')} scale={scale} />
            <Stat value={String(streak)} label={t('stat_streak')} scale={scale} />
            <Stat value={String(prs)} label={t('stat_pr')} accent={prs > 0} scale={scale} />
          </View>

          <View style={[styles.weightRow, { backgroundColor: p.section }]}>
            <Text style={[styles.statLabel, { color: p.secondary }]}>{t('stat_weight')}</Text>
            <Text style={[styles.weightValue, { color: p.text }]}>
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

          <Text style={[styles.sectionTitle, { color: p.text }]}>{t('dash_recent')}</Text>
          {sessions.slice(0, 5).map((s) => (
            <Pressable
              key={s.id}
              style={({ pressed }) => [styles.recentRow, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card, transform: [{ scale: pressed ? 0.99 : 1 }], transition: 'transform 90ms ease' }]}
              accessibilityRole="button"
              accessibilityLabel={`${s.date}`}
              onPress={onOpenHistory}
            >
              <View style={styles.recentLeft}>
                <Text style={[styles.recentDate, { color: p.text }]}>{s.date}</Text>
                <Text style={[styles.recentMeta, { color: p.secondary }]} numberOfLines={1}>
                  {plural(s.exercises.length, t, 'hist_exercise', 'hist_exercises')} · {plural(sessionSets(s), t, 'hist_set', 'hist_sets_total')}
                </Text>
              </View>
              <View style={styles.recentRight} accessibilityElementsHidden>
                <Text style={[styles.recentVolume, { color: p.accent }]}>
                  {Math.round(sessionVolume(s)).toLocaleString(lang)} kg
                </Text>
                <Text style={[styles.recentNames, { color: p.dim }]} numberOfLines={1}>
                  {s.exercises
                    .map((ex) => nameOf(exercises.find((e) => e.id === ex.exercise_id)))
                    .filter(Boolean)
                    .join(', ')}
                </Text>
              </View>
            </Pressable>
          ))}
          <Pressable
            style={({ pressed }) => [styles.historyLink, { opacity: pressed ? 0.6 : 1, transition: 'opacity 90ms ease' }]}
            accessibilityRole="button"
            onPress={onOpenHistory}
          >
            <Text style={[styles.historyLinkText, { color: p.accent }]}>{t('hist_title')} →</Text>
          </Pressable>
        </>
      )}

      {/* Benchmarks: resultados de fuerza guardados (tarea 2). */}
      <View style={[styles.benchCard, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card, marginTop: 22 }]}>
        <View style={styles.calendarHead}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.calendarTitle, { color: p.text }]}>{t('bench_title')}</Text>
            <Text style={[styles.calendarSub, { color: p.secondary }]}>{t('bench_sub')}</Text>
          </View>
        </View>
        {benchmarks.length === 0 ? (
          <View style={styles.benchEmpty}>
            <ExerciseGlyph label="bench" size={34} color={p.accent} />
            <Text style={[styles.emptyHint, { color: p.dim }]}>{t('bench_empty')}</Text>
            <Pressable
              style={({ pressed }) => [styles.benchCta, { opacity: pressed ? 0.85 : 1, transition: 'opacity 90ms ease' }]}
              accessibilityRole="button"
              accessibilityLabel={t('bench_start')}
              onPress={onStartWorkout}
            >
              <Text style={[styles.benchCtaText, { color: p.accent }]}>{t('bench_start')}</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.benchRow}>
            {benchmarks.map((b) => (
              <View key={b.name_en} style={styles.benchChip}>
                <Text style={[styles.benchChipName, { color: p.text }]} numberOfLines={1}>{benchName(b)}</Text>
                <View style={[styles.benchChipValRow, { backgroundColor: p.section }]}>
                  <Text style={[styles.benchChipVal, { color: p.accent }]}>{b.estimated_1rm} kg</Text>
                  <Text style={[styles.benchChipUnit, { color: p.dim }]}>1RM</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {sessions.length > 0 ? (
        <View style={[styles.calendarCard, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card }]}>
          <View style={styles.calendarHead}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.calendarTitle, { color: p.text }]}>{t('dash_calendar')}</Text>
              <Text style={[styles.calendarSub, { color: p.secondary }]}>{t('cal_sub')}</Text>
            </View>
          </View>
          <MonthCalendar
            lang={lang}
            month={calM}
            year={calY}
            onPrev={goPrev}
            onNext={goNext}
            onToday={goToday}
            today={{ y: todayD.getFullYear(), m: todayD.getMonth(), d: todayD.getDate() }}
            days={dayMap}
            todayLabel={t('cal_today')}
          />
          <View style={styles.legend}>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#34c759' }]} />
              <Text style={[styles.legendText, { color: p.secondary }]}>{t('cal_exercised')}</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#fdeae8', borderWidth: 1, borderColor: '#f2b8b4' }]} />
              <Text style={[styles.legendText, { color: p.secondary }]}>{t('cal_rest')}</Text>
            </View>
          </View>
        </View>
      ) : null}

      <DataSection t={t} onExport={onExport} onClear={onClearAll} onDone={onDataChanged} />
    </ScrollView>
  );
}

function Stat({
  value,
  label,
  accent = false,
  scale,
}: {
  value: string;
  label: string;
  accent?: boolean;
  scale: number;
}) {
  const { p, SHADOW } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card }]}>
      <Text
        style={[
          styles.statValue,
          { fontSize: fs(scale, 26), color: p.text },
          accent && { color: p.green },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: p.secondary }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  sub: {
    fontSize: 15,
    marginTop: 4,
    marginBottom: 18,
  },
  heroCta: {
    borderRadius: RADII.tile,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 18,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  heroArrow: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: RADII.tile,
    borderWidth: 1,
    padding: 14,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: RADII.tile,
    padding: 14,
    marginBottom: 14,
  },
  weightValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: RADII.tile + 4,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
  },
  emptyMark: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  cta: {
    marginTop: 18,
    borderRadius: RADII.tile,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '600',
    marginTop: 22,
    marginBottom: 10,
  },
  calendarCard: {
    borderRadius: RADII.tile,
    borderWidth: 1,
    padding: 16,
    marginTop: 22,
  },
  calendarHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  calendarTitle: {
    fontSize: 19,
    fontWeight: '700',
  },
  calendarSub: {
    fontSize: 13,
    marginTop: 3,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 14,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '600',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  recentLeft: {
    flexShrink: 1,
    paddingRight: 8,
  },
  recentDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  recentMeta: {
    fontSize: 12,
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
    textAlign: 'right',
  },
  recentNames: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'right',
  },
  historyLink: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  historyLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  benchCard: {
    borderRadius: RADII.tile,
    borderWidth: 1,
    padding: 16,
  },
  benchEmpty: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  benchCta: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#D9541E',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  benchCtaText: {
    fontSize: 14,
    fontWeight: '700',
  },
  benchRow: {
    gap: 10,
    paddingVertical: 2,
  },
  benchChip: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6dfd2',
    padding: 12,
    maxWidth: 150,
  },
  benchChipName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  benchChipValRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  benchChipVal: {
    fontSize: 17,
    fontWeight: '700',
  },
  benchChipUnit: {
    fontSize: 11,
    fontWeight: '600',
  },
});
