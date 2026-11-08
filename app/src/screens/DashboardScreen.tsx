import { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
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
import { COLORS, GROUP_COLORS, RADII, SHADOW, GRADIENT_STOPS } from '../theme';
import { useScale, fs } from '../scale';
import BarChart, { type Bar } from '../components/BarChart';
import { EmptyMarkGlyph } from '../components/TabIcon';
import { MonthCalendar, type DayStat } from '../components/Calendar';
import { DataSection } from '../components/DataSection';
import { plural } from '../lib/plural';

export default function DashboardScreen({
  exercises,
  sessions,
  onOpenExercise,
  onOpenHistory,
  onStartSession,
  onExport,
  onClearAll,
  onDataChanged,
}: {
  exercises: ExerciseRow[];
  sessions: Session[]; // ordenadas de más reciente a más antigua
  onOpenExercise: (id: string) => void;
  onOpenHistory: () => void;
  onStartSession: () => void;
  onExport: () => Promise<string>;
  onClearAll: () => Promise<void>;
  onDataChanged: () => void;
}) {
  const { t, i18n } = useTranslation();
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
      <Text style={styles.title} numberOfLines={1}>
        {t('dash_title')}
      </Text>
      <Text style={styles.sub}>{t('dash_sub')}</Text>

      {sessions.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyMark}>
            <EmptyMarkGlyph size={30} />
          </View>
          <Text style={styles.emptyTitle}>{t('dash_no_sessions')}</Text>
          <Text style={styles.emptyHint}>{t('dash_empty_hint')}</Text>
          <TouchableOpacity
            style={styles.cta}
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={onStartSession}
          >
            <View style={styles.ctaInner}>
              <Text style={styles.ctaText}>{t('hero_cta_session')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.statGrid}>
            <Stat value={Math.round(volumeThisWeek).toLocaleString(lang)} label={t('stat_weekly_volume')} scale={scale} />
            <Stat value={String(sessionsThisWeek)} label={t('stat_weekly_sessions')} scale={scale} />
            <Stat value={String(streak)} label={t('stat_streak')} scale={scale} />
            <Stat value={String(prs)} label={t('stat_pr')} accent={prs > 0} scale={scale} />
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
            <TouchableOpacity
              key={s.id}
              style={styles.recentRow}
              accessibilityRole="button"
              accessibilityLabel={`${s.date}`}
              onPress={onOpenHistory}
              activeOpacity={0.7}
            >
              <View style={styles.recentLeft}>
                <Text style={styles.recentDate}>{s.date}</Text>
                <Text style={styles.recentMeta} numberOfLines={1}>
                  {plural(s.exercises.length, t, 'hist_exercise', 'hist_exercises')} · {plural(sessionSets(s), t, 'hist_set', 'hist_sets_total')}
                </Text>
              </View>
              <View style={styles.recentRight} accessibilityElementsHidden>
                <Text style={styles.recentVolume}>
                  {Math.round(sessionVolume(s)).toLocaleString(lang)} kg
                </Text>
                <Text style={styles.recentNames} numberOfLines={1}>
                  {s.exercises
                    .map((ex) => nameOf(exercises.find((e) => e.id === ex.exercise_id)))
                    .filter(Boolean)
                    .join(', ')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.historyLink}
            accessibilityRole="button"
            activeOpacity={0.6}
            onPress={onOpenHistory}
          >
            <Text style={styles.historyLinkText}>{t('hist_title')} →</Text>
          </TouchableOpacity>
        </>
      )}
      {sessions.length > 0 ? (
        <View style={styles.calendarCard}>
          <View style={styles.calendarHead}>
            <View style={{ flex: 1 }}>
              <Text style={styles.calendarTitle}>{t('dash_calendar')}</Text>
              <Text style={styles.calendarSub}>{t('cal_sub')}</Text>
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
              <Text style={styles.legendText}>{t('cal_exercised')}</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: '#fdeae8', borderWidth: 1, borderColor: '#f2b8b4' }]} />
              <Text style={styles.legendText}>{t('cal_rest')}</Text>
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
  return (
    <View style={styles.stat}>
      <Text
        style={[
          styles.statValue,
          { fontSize: fs(scale, 26) },
          accent && { color: COLORS.green },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text style={styles.statLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

/** Gradiente CSS vertical de 2 paradas (RN-web lo respeta; en nativo se
 *  pinta de plano con la primera parada si no hubiera soporte). */
export function ctaGradient(): object {
  return {
    backgroundColor: GRADIENT_STOPS[0],
    background: `linear-gradient(180deg, ${GRADIENT_STOPS[0]} 0%, ${GRADIENT_STOPS[1]} 100%)`,
  };
}

const styles = StyleSheet.create({
  body: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: COLORS.bg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: COLORS.text,
  },
  sub: {
    fontSize: 15,
    color: COLORS.secondary,
    marginTop: 4,
    marginBottom: 20,
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
    backgroundColor: COLORS.card,
    borderRadius: RADII.tile,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    ...SHADOW.card,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
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
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.tile + 4,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 28,
    alignItems: 'center',
    ...SHADOW.card,
  },
  emptyMark: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.section,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyHint: {
    fontSize: 13,
    color: COLORS.dim,
    marginTop: 6,
    textAlign: 'center',
  },
  cta: {
    marginTop: 18,
    borderRadius: RADII.tile,
    ...SHADOW.cta,
    width: '100%',
  },
  ctaInner: {
    ...ctaGradient(),
    borderRadius: RADII.tile,
    paddingVertical: 14,
    alignItems: 'center',
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
    color: COLORS.text,
    marginTop: 22,
    marginBottom: 10,
  },
  calendarCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADII.tile,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginTop: 22,
    ...SHADOW.card,
  },
  calendarHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  calendarTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.text,
  },
  calendarSub: {
    fontSize: 13,
    color: COLORS.secondary,
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
    color: COLORS.secondary,
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
    ...SHADOW.card,
  },
  recentLeft: {
    flexShrink: 1,
    paddingRight: 8,
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
  historyLink: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  historyLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.blue,
  },
});
