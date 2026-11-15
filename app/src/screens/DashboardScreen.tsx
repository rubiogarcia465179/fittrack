/**
 * Resumen (pestaña de inicio).
 *
 * Una pantalla, un trabajo: empezar (o continuar) el entreno y ver cómo va
 * la semana. Arriba solo lo esencial — la acción principal, "Esta semana"
 * (sesiones · volumen · racha), la gráfica semanal y las últimas sesiones —
 * y todo lo demás (grupos musculares, marcas 1RM, calendario, peso
 * corporal) detrás de "Más estadísticas" (divulgación progresiva, estilo
 * Salud/Fitness de iOS). Idioma y "Tus datos" viven en Perfil.
 */
import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
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
  sessionCardioMinutes,
} from '../lib/gym';
import { GROUP_COLORS, RADII } from '../theme';
import { useTheme } from '../theme-context';
import { useScale, fs } from '../scale';
import BarChart, { type Bar } from '../components/BarChart';
import { EmptyMarkGlyph } from '../components/TabIcon';
import { MonthCalendar, type DayStat } from '../components/Calendar';
import { ExerciseGlyph, fmtDay } from './SessionScreen';

export default function DashboardScreen({
  exercises,
  sessions,
  benchmarks,
  activeWorkout,
  onOpenHistory,
  onStartSession,
}: {
  exercises: ExerciseRow[];
  sessions: Session[]; // ordenadas de más reciente a más antigua
  benchmarks: { name_en: string; name_nl: string; estimated_1rm: number }[];
  /** Hay un entreno en curso: la acción principal pasa a "Continuar". */
  activeWorkout: boolean;
  onOpenHistory: () => void;
  onStartSession: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { p, SHADOW } = useTheme();
  const scale = useScale();
  const lang = i18n.language as string;

  const [moreOpen, setMoreOpen] = useState(false);

  // Calendario de actividad: mes actual por defecto, navegable mes a mes.
  const todayD = new Date();
  const [calM, setCalM] = useState<number>(todayD.getMonth());
  const [calY, setCalY] = useState<number>(todayD.getFullYear());
  const goPrev = () => {
    if (calM === 0) {
      setCalM(11);
      setCalY((y) => y - 1);
    } else setCalM((m) => m - 1);
  };
  const goNext = () => {
    if (calM === 11) {
      setCalM(0);
      setCalY((y) => y + 1);
    } else setCalM((m) => m + 1);
  };
  const goToday = () => {
    setCalM(todayD.getMonth());
    setCalY(todayD.getFullYear());
  };

  const dayMap = useMemo(() => {
    const m: Record<string, DayStat> = {};
    for (const s of sessions) m[s.date] = { sets: (m[s.date]?.sets ?? 0) + sessionSets(s) };
    return m;
  }, [sessions]);

  const weekVolume = weeklyVolume(sessions, 4);
  const currentWeek = weekStart(todayISO());
  const thisWeek = sessions.filter((s) => weekStart(s.date) === currentWeek);
  const sessionsThisWeek = thisWeek.length;
  const cardioThisWeek = thisWeek.reduce((a, s) => a + sessionCardioMinutes(s), 0);
  const volumeThisWeek = weekVolume[weekVolume.length - 1]?.volume ?? 0;
  const streak = streakDays(sessions);
  const prs = sessions.length ? newPrs(sessions[0], sessions).length : 0;
  const weight = latestWeight(sessions);

  const groupBars: Bar[] = Object.entries(groupTotals(sessions, exercises, 7)).map(([g, v]) => ({
    label: t(`group_${g}`),
    value: v,
    color: GROUP_COLORS[g] || p.dim,
  }));
  const weekBars: Bar[] = weekVolume.map((w) => ({ label: w.week_start.slice(5), value: w.volume }));

  const nameOf = (e?: { name_en: string; name_nl: string }) =>
    e ? (lang === 'nl' ? e.name_nl || e.name_en : e.name_en) : '';
  const byId = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);

  const card = { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card };
  const hasData = sessions.length > 0;

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text
        style={[styles.title, { fontSize: fs(scale, 34), color: p.text }]}
        numberOfLines={1}
        accessibilityRole="header"
      >
        {t('dash_title')}
      </Text>

      {!hasData ? (
        // ---- Primer uso: un único mensaje y una única acción ----
        <View style={[styles.emptyCard, card]}>
          <View style={[styles.emptyMark, { backgroundColor: p.section }]}>
            <EmptyMarkGlyph size={30} />
          </View>
          <Text style={[styles.emptyTitle, { color: p.text }]}>{t('dash_no_sessions')}</Text>
          <Text style={[styles.emptyHint, { color: p.secondary }]}>{t('dash_empty_hint')}</Text>
          <PrimaryButton
            label={activeWorkout ? t('dash_continue') : t('hero_cta_session')}
            onPress={onStartSession}
            style={{ marginTop: 20, alignSelf: 'stretch' }}
          />
        </View>
      ) : (
        <>
          {/* ---- Acción principal (siempre a la vista) ---- */}
          <PrimaryButton
            label={activeWorkout ? t('dash_continue') : t('hero_cta_session')}
            onPress={onStartSession}
            live={activeWorkout}
          />

          {/* ---- Esta semana: tres cifras, una fila ---- */}
          <SectionHeader title={t('dash_this_week')} />
          <View style={[styles.weekCard, card]}>
            <Metric value={String(sessionsThisWeek)} label={t('stat_sessions_short')} />
            <View style={[styles.vRule, { backgroundColor: p.cardBorder }]} />
            <Metric value={Math.round(volumeThisWeek).toLocaleString(lang)} label={t('stat_volume_short')} />
            <View style={[styles.vRule, { backgroundColor: p.cardBorder }]} />
            <Metric value={String(streak)} label={t('stat_streak_short')} />
          </View>
          {cardioThisWeek > 0 ? (
            <Text style={[styles.prLine, { color: p.text }]}>{t('dash_cardio_line', { n: Math.round(cardioThisWeek) })}</Text>
          ) : null}
          {prs > 0 ? (
            <Text style={[styles.prLine, { color: p.green }]}>{t('dash_prs_line', { n: prs })}</Text>
          ) : null}

          <View style={styles.chartGap} />
          <BarChart title={t('dash_volume_7d')} data={weekBars} height={100} emptyText={t('dash_no_sessions')} />

          {/* ---- Últimas sesiones: lista agrupada (estilo iOS) ---- */}
          <SectionHeader title={t('dash_recent')} action={t('dash_see_all')} onAction={onOpenHistory} />
          <View style={[styles.group, card]}>
            {sessions.slice(0, 3).map((s, i) => {
              const names = s.exercises
                .map((ex) => nameOf(byId.get(ex.exercise_id)))
                .filter(Boolean)
                .join(', ');
              return (
                <Pressable
                  key={s.id}
                  onPress={onOpenHistory}
                  accessibilityRole="button"
                  accessibilityLabel={`${fmtDay(s.date, lang)}, ${Math.round(sessionVolume(s))} kg. ${names}`}
                  style={({ pressed }) => [
                    styles.row,
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: p.cardBorder },
                    { backgroundColor: pressed ? p.section : 'transparent' },
                  ]}
                >
                  <View style={styles.rowMain}>
                    <Text style={[styles.rowTitle, { color: p.text }]}>{fmtDay(s.date, lang)}</Text>
                    <Text style={[styles.rowSub, { color: p.secondary }]} numberOfLines={1}>
                      {names}
                    </Text>
                  </View>
                  <Text style={[styles.rowValue, { color: p.text }]}>
                    {Math.round(sessionVolume(s)).toLocaleString(lang)} kg
                  </Text>
                  <Chevron color={p.dim} />
                </Pressable>
              );
            })}
          </View>

          {/* ---- Más estadísticas: plegado por defecto ---- */}
          <Pressable
            onPress={() => setMoreOpen((o) => !o)}
            accessibilityRole="button"
            accessibilityState={{ expanded: moreOpen }}
            style={({ pressed }) => [styles.group, styles.row, styles.moreRow, card, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={[styles.moreText, { color: p.accent }]}>
              {moreOpen ? t('dash_less') : t('dash_more')}
            </Text>
            <Chevron color={p.accent} dir={moreOpen ? 'up' : 'down'} />
          </Pressable>

          {moreOpen ? (
            <View style={styles.moreBody}>
              <BarChart title={t('dash_groups')} data={groupBars} emptyText={t('dash_no_sessions')} height={84} />

              <View style={[styles.panel, card]}>
                <Text style={[styles.panelTitle, { color: p.text }]}>{t('bench_title')}</Text>
                {benchmarks.length === 0 ? (
                  <View style={styles.benchEmpty}>
                    <ExerciseGlyph label="bench" size={30} color={p.accent} />
                    <Text style={[styles.emptyHint, { color: p.secondary, marginTop: 0 }]}>{t('bench_empty')}</Text>
                  </View>
                ) : (
                  benchmarks.map((b, i) => (
                    <View
                      key={b.name_en}
                      style={[
                        styles.benchRow,
                        i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: p.cardBorder },
                      ]}
                    >
                      <Text style={[styles.benchName, { color: p.text }]} numberOfLines={1}>
                        {nameOf(b)}
                      </Text>
                      <Text style={[styles.benchVal, { color: p.text }]}>
                        {b.estimated_1rm} kg <Text style={{ color: p.secondary, fontWeight: '600' }}>1RM</Text>
                      </Text>
                    </View>
                  ))
                )}
              </View>

              <View style={[styles.panel, card]}>
                <Text style={[styles.panelTitle, { color: p.text }]}>{t('dash_calendar')}</Text>
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

              <View style={[styles.group, styles.row, card]}>
                <Text style={[styles.rowTitle, { color: p.text, flex: 1 }]}>{t('stat_weight')}</Text>
                <Text style={[styles.rowValue, { color: weight ? p.text : p.secondary }]}>
                  {weight ? `${weight.toLocaleString(lang)} kg` : '—'}
                </Text>
              </View>
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

/** Botón principal: acento sólido, ancho completo, 52 pt de alto. */
function PrimaryButton({
  label,
  onPress,
  live = false,
  style,
}: {
  label: string;
  onPress: () => void;
  /** Entreno en curso: punto verde "en vivo" delante del texto. */
  live?: boolean;
  style?: object;
}) {
  const { p } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.primary,
        { backgroundColor: p.accent, opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] },
        style,
      ]}
    >
      {live ? <View style={styles.liveDot} /> : null}
      <Text style={styles.primaryText} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { p } = useTheme();
  return (
    <View style={styles.sectionHead}>
      <Text style={[styles.sectionTitle, { color: p.text }]} accessibilityRole="header">
        {title}
      </Text>
      {action && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <Text style={[styles.sectionAction, { color: p.accent }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  const { p } = useTheme();
  const scale = useScale();
  return (
    <View style={styles.metric} accessible accessibilityLabel={`${value} ${label}`}>
      <Text style={[styles.metricValue, { fontSize: fs(scale, 26), color: p.text }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={[styles.metricLabel, { color: p.secondary }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** Chevron dibujado (sin glifos de fuente: no hay "tofu" en ningún equipo). */
export function Chevron({ color, dir = 'right' }: { color: string; dir?: 'right' | 'down' | 'up' }) {
  const rot = dir === 'right' ? '45deg' : dir === 'down' ? '135deg' : '-45deg';
  return (
    <View style={styles.chevWrap} accessibilityElementsHidden importantForAccessibility="no">
      <View style={[styles.chev, { borderColor: color, transform: [{ rotate: rot }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  title: {
    fontWeight: '700',
    letterSpacing: -0.8,
    marginBottom: 16,
  },
  primary: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  primaryText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  liveDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#30D158',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  sectionAction: {
    fontSize: 15,
    fontWeight: '600',
  },
  weekCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADII.tile,
    borderWidth: 1,
    paddingVertical: 16,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  metricValue: {
    fontWeight: '700',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  vRule: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: 4,
  },
  prLine: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  chartGap: {
    height: 12,
  },
  group: {
    borderRadius: RADII.tile,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowSub: {
    fontSize: 13,
    marginTop: 2,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  moreRow: {
    marginTop: 16,
    justifyContent: 'center',
  },
  moreText: {
    fontSize: 16,
    fontWeight: '600',
  },
  moreBody: {
    gap: 12,
    marginTop: 12,
  },
  panel: {
    borderRadius: RADII.tile,
    borderWidth: 1,
    padding: 16,
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  benchEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 12,
  },
  benchName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  benchVal: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: RADII.card,
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
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    flexShrink: 1,
  },
  chevWrap: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chev: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
});
