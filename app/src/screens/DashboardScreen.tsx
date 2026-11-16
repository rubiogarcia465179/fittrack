/**
 * Inicio — la primera pantalla (estilo X, monocromo). De arriba abajo:
 *  1. Tu foto, solo si la eliges en Perfil (sin foto de stock).
 *  2. "Hoy toca: <grupos>" + Cambiar, y "Empezar sesión" → hoja "Tu entreno
 *     de hoy"; con un entreno en curso, "Continuar entreno".
 *  3. Marcas personales (3 tarjetas blancas + "Ver todo").
 *  4. Calendario del mes (días entrenados en blanco, récords en verde; tocar
 *     un día abre el Historial de ese día).
 *  5. Filas: Historial y Ejercicios (pantallas con "atrás").
 * El cuerpo 3D vive en la rama `cuerpo-3d` (prueba Jobs: no, 2026-11-15).
 * Sin fecha, sin "sesiones esta semana" ni racha (se ven en el calendario) y
 * sin volumen (decisiones del usuario 2026-11-15).
 */
import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { exName } from '../lib/names';
import { useTranslation } from 'react-i18next';
import type { ExerciseRow } from '../lib/gym';
import type { Session, BenchmarkRef } from '../store';
import { effectiveRecords, recordDays } from '../lib/records';
import { sessionSets, todayISO } from '../lib/gym';
import { RADII } from '../theme';
import { useTheme } from '../theme-context';
import { MonthCalendar, type DayStat } from '../components/Calendar';
import { Gradient } from '../components/Gradient';
import { Chevron } from '../components/Chevron';
import { loadHomePhoto } from '../lib/homePhoto';
import { splitLabel } from '../lib/nextSplit';


export default function DashboardScreen({
  exercises,
  sessions,
  benchmarks,
  activeWorkout,
  onStartSession,
  todayGroups,
  todayMeta,
  mondayNote,
  onChangeSplit,
  onOpenHistory,
  onOpenLibrary,
  onStartBenchmark,
}: {
  exercises: ExerciseRow[];
  sessions: Session[]; // ordenadas de más reciente a más antigua
  /** Marcas del test (profile.benchmarks); se combinan con las sesiones. */
  benchmarks: BenchmarkRef[];
  activeWorkout: boolean;
  onStartSession: () => void;
  /** Bloque de hoy (lo decide App con nextSplit; la hoja usa el mismo). */
  todayGroups: string[];
  /** "Crear músculo · 45 min": objetivo y duración que usará la hoja. */
  todayMeta: string;
  /** Lunes: se apartó el pecho (bancos llenos) → una línea que lo explica. */
  mondayNote: boolean;
  /** "Cambiar": pasa al siguiente bloque con un toque. */
  onChangeSplit: () => void;
  /** Sin fecha: todo el historial; con fecha: solo ese día. */
  onOpenHistory: (date?: string) => void;
  onOpenLibrary: () => void;
  /** "Establecer marcas": test con los 5 clásicos (primer arranque). */
  onStartBenchmark: () => void;
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
  // Marcas personales (test de marcas + mejores series; gana el mayor) y días
  // en que se batió una marca (círculo verde en el calendario).
  const byId = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const isCardioId = (id: string) => byId.get(id)?.muscle_group === 'cardio';
  const prs = useMemo(
    () =>
      [...effectiveRecords(sessions, benchmarks, isCardioId).values()]
        .filter((r) => r.kg > 0 && byId.has(r.exercise_id))
        .sort((a, b) => b.kg - a.kg)
        .map((r) => ({ key: r.exercise_id, name: exName(byId.get(r.exercise_id)!, lang), kg: Math.round(r.kg) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessions, benchmarks, byId, lang],
  );
  const prDays = useMemo(
    () => recordDays(sessions, benchmarks, isCardioId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessions, benchmarks, byId],
  );
  // Ya entrenaste hoy → lo propuesto es "Próxima", no "Hoy toca" (no se afirma lo que no es).
  const trainedToday = sessions.some((x) => x.date === todayISO());
  const dayMap = useMemo(() => {
    const m: Record<string, DayStat> = {};
    for (const s of sessions) m[s.date] = { sets: (m[s.date]?.sets ?? 0) + sessionSets(s), pr: prDays.has(s.date) };
    return m;
  }, [sessions, prDays]);

  const monthPrefix = todayISO().slice(0, 7);
  const sessionsThisMonth = sessions.filter((s) => s.date.startsWith(monthPrefix)).length;

  // Qué toca hoy (mismo cálculo que la hoja rápida).
  const todayLabel = splitLabel(todayGroups, t);

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      {/* ---- 1. Tu foto (solo si la pusiste en Perfil: auténtico o nada) ---- */}
      {photo ? (
        <View style={[styles.hero, { borderColor: p.border }]}>
          <Image source={{ uri: photo }} style={styles.heroImg} resizeMode="cover" />
        </View>
      ) : null}

      {/* ---- 2. Qué toca hoy ---- */}
      <View style={[styles.today, photo ? { marginTop: 20 } : null]}>
        <View style={styles.todayHead}>
          <Text style={[styles.todayLabel, { color: p.secondary }]}>
            {activeWorkout ? t('home_in_progress') : trainedToday ? t('home_next') : t('home_today')}
          </Text>
          {activeWorkout ? null : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home_change_split')}
              onPress={onChangeSplit}
              hitSlop={10}
              style={({ pressed }) => [styles.changeBtn, { borderColor: p.border, opacity: pressed ? 0.6 : 1 }]}
            >
              <Text style={[styles.changeText, { color: p.text }]}>{t('home_change_split')}</Text>
            </Pressable>
          )}
        </View>
        {activeWorkout ? null : (
          <>
            <Text
              style={[styles.todayTitle, { color: p.text }]}
              accessibilityRole="header"
              accessibilityLabel={`${trainedToday ? t('home_next') : t('home_today')}: ${todayLabel}`}
            >
              {todayLabel}
            </Text>
            <Text style={[styles.todayMeta, { color: p.secondary }]}>{todayMeta}</Text>
            {mondayNote ? <Text style={[styles.todayMeta, { color: p.secondary }]}>{t('home_monday_note')}</Text> : null}
          </>
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
              <Text style={[styles.prName, { color: p.onAccent + "A6" }]} numberOfLines={3}>
                {pr.name}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={[styles.emptyBox, { borderColor: p.border }]}>
          <Text style={[styles.emptyTitle, { color: p.text }]}>{t('home_first_title')}</Text>
          <Text style={[styles.emptyText, { color: p.secondary }]}>{t('home_first_sub')}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onStartBenchmark}
            style={({ pressed }) => [styles.emptyBtn, { borderColor: p.text, opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={[styles.emptyBtnText, { color: p.text }]}>{t('records_test_btn')}</Text>
          </Pressable>
        </View>
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
  todayHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 36 },
  todayLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' },
  changeBtn: { minHeight: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, justifyContent: 'center' },
  changeText: { fontSize: 14, fontWeight: '600' },
  todayMeta: { fontSize: 15, marginTop: 6, lineHeight: 20 },
  todayTitle: { fontSize: 30, fontWeight: '800', letterSpacing: -0.6, lineHeight: 36, marginTop: 6 },
  emptyBox: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: 18, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700' },
  emptyText: { fontSize: 15, lineHeight: 21 },
  emptyBtn: { alignSelf: 'flex-start', marginTop: 6, minHeight: 44, paddingHorizontal: 18, borderRadius: 22, borderWidth: 1, justifyContent: 'center' },
  emptyBtnText: { fontSize: 15, fontWeight: '600' },
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
