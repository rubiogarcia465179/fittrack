/**
 * Inicio — la primera pantalla (estilo X, monocromo). De arriba abajo:
 *  1. Foto de cabecera (la eliges en Perfil → "Foto de Inicio"; si no, la
 *     de la app). Sin botones encima.
 *  2. "Empezar sesión" (blanco) → hoja "Tu entreno de hoy"; con un entreno
 *     en curso, "Continuar entreno". Un solo camino para empezar.
 *  3. Marcas personales (3 tarjetas blancas + "Ver todo").
 *  4. Calendario del mes (días entrenados en blanco; tocar un día abre el
 *     Historial).
 *  5. Filas: Historial y Ejercicios (pantallas con "atrás").
 *  6. Actividad: a qué hora entrenas (un solo gráfico).
 * Sin fecha, sin "sesiones esta semana" ni racha (se ven en el calendario) y
 * sin volumen (decisiones del usuario 2026-11-15).
 */
import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { exName, type Named } from '../lib/names';
import { useTranslation } from 'react-i18next';
import type { ExerciseRow } from '../lib/gym';
import type { Session } from '../store';
import { sessionSets, todayISO, oneRm } from '../lib/gym';
import { RADII } from '../theme';
import { useTheme } from '../theme-context';
import { MonthCalendar, type DayStat } from '../components/Calendar';
import { Gradient } from '../components/Gradient';
import { Chevron } from '../components/Chevron';
import { loadHomePhoto } from '../lib/homePhoto';
import { nextSplit, splitLabel } from '../lib/nextSplit';

/** Franjas horarias del histograma (hora local de guardado de la sesión). */
const HOUR_BINS = [
  { label: '6', from: 5, to: 9 },
  { label: '9', from: 9, to: 12 },
  { label: '12', from: 12, to: 15 },
  { label: '15', from: 15, to: 18 },
  { label: '18', from: 18, to: 21 },
  { label: '21', from: 21, to: 24 },
  { label: '0', from: 0, to: 5 },
];

export default function DashboardScreen({
  exercises,
  sessions,
  benchmarks,
  activeWorkout,
  onStartSession,
  onOpenHistory,
  onOpenLibrary,
}: {
  exercises: ExerciseRow[];
  sessions: Session[]; // ordenadas de más reciente a más antigua
  benchmarks: { name_en: string; name_nl: string; name_es?: string; name_fr?: string; estimated_1rm: number }[];
  activeWorkout: boolean;
  onStartSession: () => void;
  /** Sin fecha: todo el historial; con fecha: solo ese día. */
  onOpenHistory: (date?: string) => void;
  onOpenLibrary: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { p, GRADIENT } = useTheme();
  const lang = i18n.language as string;
  const [recordsOpen, setRecordsOpen] = useState(false);

  // Foto de cabecera: la elegida en Perfil o la de la app.
  const [photo, setPhoto] = useState<string | null>(null);
  useEffect(() => {
    void loadHomePhoto().then(setPhoto);
  }, []);

  // Calendario: mes actual por defecto, navegable.
  const todayD = new Date();
  const [calM, setCalM] = useState<number>(todayD.getMonth());
  const [calY, setCalY] = useState<number>(todayD.getFullYear());
  const goPrev = () => (calM === 0 ? (setCalM(11), setCalY((y) => y - 1)) : setCalM((m) => m - 1));
  const goNext = () => (calM === 11 ? (setCalM(0), setCalY((y) => y + 1)) : setCalM((m) => m + 1));
  const goToday = () => {
    setCalM(todayD.getMonth());
    setCalY(todayD.getFullYear());
  };
  const dayMap = useMemo(() => {
    const m: Record<string, DayStat> = {};
    for (const s of sessions) m[s.date] = { sets: (m[s.date]?.sets ?? 0) + sessionSets(s) };
    return m;
  }, [sessions]);

  const monthPrefix = todayISO().slice(0, 7);
  const sessionsThisMonth = sessions.filter((s) => s.date.startsWith(monthPrefix)).length;
  const nameOf = (e: Named) => exName(e, lang);

  // Marcas personales: 1RM estimado (Epley) de la mejor serie de cada
  // ejercicio + benchmarks (gana el mayor). Sin cardio.
  const byId = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const prs = useMemo(() => {
    const best = new Map<string, { key: string; name: string; kg: number }>();
    for (const s of sessions) {
      for (const ex of s.exercises) {
        const e = byId.get(ex.exercise_id);
        if (!e || e.muscle_group === 'cardio') continue;
        for (const st of ex.sets) {
          const r = oneRm(st.weight_kg, st.reps);
          const cur = best.get(e.name_en);
          if (r > 0 && (!cur || r > cur.kg)) best.set(e.name_en, { key: e.name_en, name: nameOf(e), kg: r });
        }
      }
    }
    for (const b of benchmarks) {
      const cur = best.get(b.name_en);
      if (!cur || b.estimated_1rm > cur.kg) best.set(b.name_en, { key: b.name_en, name: nameOf(b), kg: b.estimated_1rm });
    }
    return [...best.values()].sort((a, b) => b.kg - a.kg).map((x) => ({ ...x, kg: Math.round(x.kg) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, benchmarks, byId, lang]);

  // Actividad: sesiones por franja horaria (a qué hora entrenas).
  const activity = useMemo(() => {
    const hours = HOUR_BINS.map(() => 0);
    for (const s of sessions) {
      if (s.created_at) {
        const h = new Date(s.created_at).getHours();
        const i = HOUR_BINS.findIndex((b) => h >= b.from && h < b.to);
        if (i >= 0) hours[i] += 1;
      }
    }
    return { hours };
  }, [sessions]);

  // Qué toca hoy (mismo cálculo que la hoja rápida).
  const todayLabel = useMemo(
    () => splitLabel(nextSplit(sessions, new Map(exercises.map((e) => [e.id, e.muscle_group]))), t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessions, exercises, lang],
  );

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      {/* ---- 1. Tu foto (solo si la pusiste en Perfil: auténtico o nada) ---- */}
      {photo ? (
        <View style={[styles.hero, { borderColor: p.border }]}>
          <Image source={{ uri: photo }} style={styles.heroImg} resizeMode="cover" />
        </View>
      ) : null}

      {/* ---- 2. Qué toca hoy ---- */}
      <View style={[styles.today, photo ? { marginTop: 20 } : null]} accessible accessibilityRole="header">
        <Text style={[styles.todayLabel, { color: p.secondary }]}>
          {activeWorkout ? t('home_in_progress') : t('home_today')}
        </Text>
        {activeWorkout ? null : (
          <Text style={[styles.todayTitle, { color: p.text }]}>{todayLabel}</Text>
        )}
      </View>

      {/* ---- 2. Una acción ---- */}
      <Pressable
        accessibilityRole="button"
        onPress={onStartSession}
        style={({ pressed }) => [styles.ctaWrap, { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }]}
      >
        <Gradient colors={GRADIENT.cta} style={styles.cta} contentStyle={styles.ctaInner}>
          {activeWorkout ? <View style={[styles.liveDot, { backgroundColor: p.onAccent }]} /> : null}
          <Text style={[styles.ctaText, { color: p.onAccent }]} numberOfLines={1}>
            {activeWorkout ? t('dash_continue') : t('home_start')}
          </Text>
        </Gradient>
      </Pressable>

      {/* ---- 3. Marcas personales ---- */}
      <SectionHead
        title={t('home_prs')}
        action={prs.length > 3 ? (recordsOpen ? t('home_less') : t('dash_see_all')) : undefined}
        onAction={() => setRecordsOpen((o) => !o)}
        expanded={recordsOpen}
      />
      {prs.length ? (
        <View style={styles.prRow}>
          {prs.slice(0, 3).map((pr) => (
            <View
              key={pr.key}
              style={[styles.prTile, { backgroundColor: p.accent }]}
              accessible
              accessibilityLabel={`${pr.name}: ${pr.kg} kg 1RM`}
            >
              <Text style={[styles.prKg, { color: p.onAccent }]} numberOfLines={1}>
                {pr.kg}
                <Text style={[styles.prUnit, { color: p.onAccent + "8C" }]}> kg</Text>
              </Text>
              <Text style={[styles.prName, { color: p.onAccent + "A6" }]} numberOfLines={2}>
                {pr.name}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.empty, { color: p.secondary }]}>{t('bench_empty')}</Text>
      )}
      {recordsOpen ? (
        <View style={styles.records}>
          {prs.slice(3).map((pr) => (
            <View key={pr.key} style={[styles.recordRow, { borderBottomColor: p.border }]}>
              <Text style={[styles.recordName, { color: p.text }]} numberOfLines={1}>
                {pr.name}
              </Text>
              <Text style={[styles.recordVal, { color: p.text }]}>
                {pr.kg} kg <Text style={{ color: p.secondary }}>1RM</Text>
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* ---- 4. Calendario ---- */}
      <View style={[styles.calendar, { borderColor: p.border }]}>
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
          onPickDay={(iso) => onOpenHistory(iso)}
        />
      </View>

      {/* ---- 5. Filas ---- */}
      <View style={[styles.rows, { borderTopColor: p.border }]}>
        <Row title={t('hist_title')} sub={t('home_history_sub', { n: sessionsThisMonth })} onPress={() => onOpenHistory()} />
        <Row title={t('nav_exercises')} sub={t('home_exercises_sub', { n: exercises.length })} onPress={onOpenLibrary} />
      </View>

      {/* ---- 6. Actividad ---- */}
      <SectionHead title={t('home_activity')} />
      <Histogram
        title={t('home_by_hour')}
        bars={HOUR_BINS.map((b, i) => ({ label: `${b.label}h`, value: activity.hours[i] }))}
        empty={t('dash_no_sessions')}
      />
    </ScrollView>
  );
}

function SectionHead({
  title,
  action,
  onAction,
  expanded,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  expanded?: boolean;
}) {
  const { p } = useTheme();
  return (
    <View style={styles.sectionHead}>
      <Text style={[styles.sectionLabel, { color: p.secondary }]} accessibilityRole="header">
        {title}
      </Text>
      {action && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={expanded === undefined ? undefined : { expanded }}
          onPress={onAction}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <Text style={[styles.sectionAction, { color: p.text }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Fila plana estilo X: título · subtítulo gris · chevron, separador fino. */
function Row({ title, sub, onPress }: { title: string; sub: string; onPress: () => void }) {
  const { p } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${sub}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { borderBottomColor: p.border, backgroundColor: pressed ? p.card : 'transparent' }]}
    >
      <View style={styles.rowMain}>
        <Text style={[styles.rowTitle, { color: p.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.rowSub, { color: p.secondary }]} numberOfLines={1}>
          {sub}
        </Text>
      </View>
      <Chevron color={p.dim} />
    </Pressable>
  );
}

/** Histograma monocromo: barras blancas, recuento encima, etiqueta debajo. */
function Histogram({ title, bars, empty }: { title: string; bars: { label: string; value: number }[]; empty: string }) {
  const { p } = useTheme();
  const max = Math.max(0, ...bars.map((b) => b.value));
  const H = 84;
  return (
    <View
      style={[styles.histo, { borderColor: p.border }]}
      accessible
      accessibilityLabel={`${title}: ${bars.map((b) => `${b.label} ${b.value}`).join(', ')}`}
    >
      <Text style={[styles.histoTitle, { color: p.text }]}>{title}</Text>
      {max === 0 ? (
        <Text style={[styles.empty, { color: p.secondary, paddingHorizontal: 0 }]}>{empty}</Text>
      ) : (
        <View style={styles.histoBars}>
          {bars.map((b, i) => (
            <View key={b.label + i} style={styles.histoCol}>
              <Text style={[styles.histoVal, { color: b.value ? p.text : 'transparent' }]}>{b.value}</Text>
              <View style={[styles.histoTrack, { height: H }]}>
                <View
                  style={[
                    styles.histoBar,
                    { height: b.value ? Math.max(6, Math.round((b.value / max) * H)) : 2, backgroundColor: b.value ? p.accent : p.border },
                  ]}
                />
              </View>
              <Text style={[styles.histoLabel, { color: p.secondary }]}>{b.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  // Foto como la imagen de un post: insertada, esquinas redondeadas.
  hero: {
    height: 230,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  today: { paddingTop: 8, paddingHorizontal: 2 },
  todayLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' },
  todayTitle: { fontSize: 30, fontWeight: '800', letterSpacing: -0.6, lineHeight: 36, marginTop: 6 },
  ctaWrap: {
    marginTop: 18,
  },
  cta: {
    borderRadius: 30,
  },
  ctaInner: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
  },
  ctaText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  liveDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#000000',
  },
  secondary: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '600',
  },
  prRow: {
    flexDirection: 'row',
    gap: 10,
  },
  prTile: {
    flex: 1,
    minWidth: 0,
    borderRadius: RADII.tile,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 4,
  },
  prKg: {
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: -0.6,
    fontVariant: ['tabular-nums'],
  },
  prUnit: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0,
  },
  prName: {
    fontSize: 12,
    lineHeight: 16,
  },
  empty: {
    fontSize: 14,
    paddingHorizontal: 4,
  },
  records: {
    marginTop: 6,
    paddingHorizontal: 4,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  recordName: {
    flex: 1,
    fontSize: 15,
  },
  recordVal: {
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  calendar: {
    marginTop: 22,
    borderRadius: RADII.tile,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  rows: {
    marginTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  rowSub: {
    fontSize: 14,
    marginTop: 2,
  },
  histo: {
    borderRadius: RADII.tile,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 12,
  },
  histoTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  histoBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  histoCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  histoVal: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  histoTrack: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  histoBar: {
    width: '70%',
    maxWidth: 28,
    borderRadius: 6,
  },
  histoLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
