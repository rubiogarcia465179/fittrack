/**
 * Pantalla de entrenamiento activo (pestaña "Entrenar").
 *
 * Aquí se vive la sesión: cada ejercicio es una tarjeta con sus series
 * (reps + peso, tap-to-pick, sin teclado), estado de material
 * (disponible / ocupado / no disponible) y alternancias con ejercicios
 * equivalentes cuando una máquina está ocupada. Lo ocupado NO se borra:
 * se **aplaza** y la app lo vuelve a sugerir pasado un intervalo.
 *
 * El estado vive en App (persistido): al navegar o recargar la página el
 * entrenamiento sigue donde estaba, y la app pinta el tema "workout".
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '../data';
import type { Session, SetLog } from '../store';
import { searchExercises, normalizeSession, uid, todayISO, oneRm } from '../lib/gym';
import { store } from '../store';
import { GROUP_COLORS, RADII } from '../theme';
import { useTheme } from '../theme-context';
import { useScale, fs } from '../scale';
import { XGlyph } from '../components/TabIcon';
import { PickerSheet, fmtNum } from '../components/PickerSheet';
import { plural } from '../lib/plural';
import {
  suggestAlternatives,
  weightForExercise,
  recentRows,
  type EquipmentStatus,
  type RecentRow,
} from '../lib/workout';
import type { ActiveSession, ActiveDraftExercise, PostponedExercise } from '../lib/session';

/** '2026-11-08' -> 'Nov 8' (mes corto + día). Local, sin Intl. */
const M_SHORT_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const M_SHORT_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const M_SHORT_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
export function fmtDay(iso: string, lang: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const arr = lang === 'es' ? M_SHORT_ES : lang === 'fr' ? M_SHORT_FR : M_SHORT_EN;
  return `${arr[m - 1]} ${d}`;
}

/** Glifo decorativo por grupo muscular (sin fuentes: solo Views).
 *  Se usa en tarjetas de workout y en empty states. */
export function ExerciseGlyph({
  label,
  size = 24,
  color,
}: {
  label: string;
  size?: number;
  color?: string;
}) {
  const c = color || GROUP_COLORS[(label as string) in GROUP_COLORS ? (label as string) : 'legs'];
  return (
    <View style={{ width: size, height: size, position: 'relative', opacity: 0.9 }} accessibilityElementsHidden>
      {label === 'bench' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.1, right: size * 0.1, top: size * 0.42, height: 3, borderRadius: 2, backgroundColor: c }} />
          <View style={{ position: 'absolute', left: size * 0.06, top: size * 0.22, width: 4, height: size * 0.56, borderRadius: 2, backgroundColor: c }} />
          <View style={{ position: 'absolute', right: size * 0.06, top: size * 0.22, width: 4, height: size * 0.56, borderRadius: 2, backgroundColor: c }} />
          <View style={{ position: 'absolute', left: size * 0.16, top: size * 0.18, width: 5, height: size * 0.64, borderRadius: 2, backgroundColor: c, opacity: 0.7 }} />
          <View style={{ position: 'absolute', right: size * 0.16, top: size * 0.18, width: 5, height: size * 0.64, borderRadius: 2, backgroundColor: c, opacity: 0.7 }} />
        </>
      ) : label === 'chest' || label === 'shoulders' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.2, top: size * 0.3, width: size * 0.6, height: size * 0.34, borderRadius: 6, backgroundColor: c }} />
          <View style={{ position: 'absolute', left: size * 0.05, top: size * 0.26, width: 4, height: size * 0.42, borderRadius: 2, backgroundColor: c, opacity: 0.7 }} />
          <View style={{ position: 'absolute', right: size * 0.05, top: size * 0.26, width: 4, height: size * 0.42, borderRadius: 2, backgroundColor: c, opacity: 0.7 }} />
        </>
      ) : label === 'back' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.12, right: size * 0.12, top: size * 0.2, height: 3, borderRadius: 2, backgroundColor: c }} />
          <View style={{ position: 'absolute', left: size * 0.28, top: size * 0.2, width: 3, height: size * 0.4, backgroundColor: c }} />
          <View style={{ position: 'absolute', right: size * 0.28, top: size * 0.2, width: 3, height: size * 0.4, backgroundColor: c }} />
          <View style={{ position: 'absolute', left: size * 0.2, top: size * 0.5, width: size * 0.6, height: 4, borderRadius: 2, backgroundColor: c, opacity: 0.7 }} />
        </>
      ) : label === 'legs' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.3, top: size * 0.15, width: size * 0.4, height: size * 0.22, borderRadius: 5, backgroundColor: c }} />
          <View style={{ position: 'absolute', left: size * 0.32, top: size * 0.4, width: 5, height: size * 0.45, borderRadius: 2, backgroundColor: c }} />
          <View style={{ position: 'absolute', right: size * 0.32, top: size * 0.4, width: 5, height: size * 0.45, borderRadius: 2, backgroundColor: c }} />
        </>
      ) : label === 'cardio' ? (
        <>
          <View style={{ position: 'absolute', left: size * 0.12, top: size * 0.45, width: size * 0.5, height: 3, borderRadius: 2, backgroundColor: c }} />
          <View style={{ position: 'absolute', left: size * 0.62, top: size * 0.45, width: size * 0.2, height: 3, borderRadius: 2, backgroundColor: c, opacity: 0.5 }} />
          <View style={{ position: 'absolute', left: size * 0.4, top: size * 0.28, width: 6, height: 6, borderRadius: 3, backgroundColor: c }} />
          <View style={{ position: 'absolute', left: size * 0.62, top: size * 0.32, width: 4, height: 4, borderRadius: 2, backgroundColor: c, opacity: 0.7 }} />
        </>
      ) : (
        <View style={{ position: 'absolute', left: 0, right: 0, top: size * 0.35, height: 4, borderRadius: 2, backgroundColor: c }} />
      )}
    </View>
  );
}

/** Casilla de valor grande (reps, peso, duración…): se toca y elige desde
 *  una hoja con valores — sin teclado, a un toque. */
function ValueBox({
  value,
  unit,
  onPress,
  accent,
}: {
  value: string;
  unit: string;
  onPress: () => void;
  accent?: boolean;
}) {
  const { p } = useTheme();
  const scale = useScale();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${value} ${unit}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.valueBox,
        {
          backgroundColor: accent ? p.accent : p.fieldBg,
          borderColor: accent ? p.accent : p.border,
          transform: [{ scale: pressed ? 0.96 : 1 }],
          transition: 'transform 80ms ease, background-color 120ms ease',
        },
      ]}
    >
      <Text style={[styles.valueBoxNum, { fontSize: fs(scale, 19), color: accent ? '#fff' : p.text }]}>
        {value}
      </Text>
      <Text style={[styles.valueBoxUnit, { fontSize: fs(scale, 12), color: accent ? 'rgba(255,255,255,0.85)' : p.secondary }]}>
        {unit}
      </Text>
    </Pressable>
  );
}

/** Tick ligero para el cronómetro (1 s; no gasta recursos). */
function useNow(ms: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

export default function SessionScreen({
  exercises,
  sessions,
  session,
  onSessionChange,
  onSaved,
  onDiscard,
}: {
  exercises: Exercise[];
  sessions: Session[]; // recientes primero: para prellenar con los últimos valores
  session: ActiveSession;
  onSessionChange: (next: ActiveSession) => void;
  onSaved: (s: Session) => void;
  onDiscard: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { p, SHADOW } = useTheme();
  const scale = useScale();

  const [date, setDate] = useState<string>(session.date || todayISO());
  const [dateOpen, setDateOpen] = useState(false);
  const [weightStr, setWeightStr] = useState<string>(
    session.body_weight_kg ? String(session.body_weight_kg) : '',
  );
  const [duration, setDuration] = useState<number>(session.duration_min ?? 0);
  const [notes, setNotes] = useState<string>(session.notes || '');
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState<ActiveDraftExercise[]>(session.draft || []);
  const [postponed, setPostponed] = useState<PostponedExercise[]>(session.postponed || []);
  const [benchManual, setBenchManual] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [confirmReturn, setConfirmReturn] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const scrollRef = useRef<any>(null);
  const cardOffsets = useRef<Record<string, number>>({});

  // Cronómetro: tick cada segundo mientras no está pausado (al pausar,
  // congela y solo refresca cada 30 s para no desperdiciar energía).
  const now = useNow(session.paused ? 30000 : 1000);

  // Hojas de elección (peso / reps / duración / peso corporal / 1RM).
  type PickTarget =
    | { kind: 'reps'; ex: string; idx: number }
    | { kind: 'weight'; ex: string; idx: number }
    | { kind: 'duration' }
    | { kind: 'body' }
    | { kind: 'bench'; ex: string };
  const [pick, setPick] = useState<PickTarget | null>(null);

  // Re-evaluación de material aplazado: intervalo de 10 minutos.
  const RECHECK_MS = 10 * 60 * 1000;

  const byId = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const recent = useMemo(() => recentRows(sessions), [sessions]);
  const results = useMemo(
    () => searchExercises(exercises, q, 'all', 'all').slice(0, 12),
    [exercises, q],
  );

  // Últimos 7 días (hoy primero) para el selector rápido de fecha.
  const recentDays = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < 7; i++) out.push(todayISO(-i));
    return out;
  }, []);

  const lang = i18n.language as string;
  const nameOf = (e?: { name_en: string; name_nl: string }) =>
    e ? (lang === 'nl' ? e.name_nl || e.name_en : e.name_en) : '';

  // ---- persistencia del estado en App (sobrevive a navegación/refresh) ----
  useEffect(() => {
    onSessionChange({
      ...session,
      date,
      duration_min: duration > 0 ? duration : undefined,
      body_weight_kg: Number(weightStr.replace(',', '.')) || undefined,
      notes,
      draft,
      postponed,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, duration, weightStr, notes, draft, postponed]);

  // ---- progreso: series registradas (con peso y reps) / series totales ----
  const totalSets = draft.reduce((a, d) => a + d.sets.length, 0);
  const doneSets = draft.reduce(
    (a, d) => a + d.sets.filter((s) => s.reps > 0 && s.weight_kg > 0).length,
    0,
  );
  const progress = totalSets > 0 ? doneSets / totalSets : 0;

  // ---- tiempo transcurrido (con pausa acumulada) ----
  const elapsedMs = useMemo(() => {
    const base = now - session.started_at;
    const pausedNow = session.paused ? now - (session.paused_since || now) : 0;
    return Math.max(0, base - (session.paused_total_ms || 0) - pausedNow);
  }, [now, session]);
  const elapsedSec = Math.floor(elapsedMs / 1000);
  const elapsedLabel =
    elapsedSec < 60 ? `${elapsedSec}s` : `${Math.floor(elapsedSec / 60)}m ${elapsedSec % 60}s`;

  const isBenchmark = session.type === 'benchmark';

  // ---- feedback: toast breve (sin notificaciones durante el scroll) ----
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flash = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  };

  // ---- añadir ejercicio (libre, desde la búsqueda) ----
  const addExercise = (id: string) => {
    if (draft.some((d) => d.exercise_id === id)) {
      setQ('');
      const off = cardOffsets.current[id] ?? 0;
      setTimeout(() => scrollRef.current?.scrollTo({ y: Math.max(0, off - 24), animated: true }), 60);
      return;
    }
    const ex = byId.get(id);
    const rec = ex
      ? weightForExercise(ex, {
          benchmarks: session.benchmarks,
          mode: session.equipment_mode,
          intensity: 'moderate',
          reps: 10,
          recent,
        })
      : null;
    const lastSets = sessions
      .find((s) => s.exercises.some((e) => e.exercise_id === id))
      ?.exercises.find((e) => e.exercise_id === id)?.sets;
    const bases: SetLog[] = lastSets && lastSets.length > 0 ? lastSets : [{ reps: 10, weight_kg: 0 }];
    const fresh: SetLog[] = [];
    for (let i = 0; i < 3; i++) {
      const b = bases[Math.min(i, bases.length - 1)];
      fresh.push({
        reps: b.reps || 10,
        weight_kg: rec && rec.weight_kg > 0 ? rec.weight_kg : b.weight_kg ?? 0,
      });
    }
    setDraft((d) => [...d, { exercise_id: id, sets: fresh }]);
    setQ('');
    setSaved(false);
    flash(t('sess_added'));
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  };

  const removeExercise = (id: string) =>
    setDraft((d) => d.filter((x) => x.exercise_id !== id));

  const addSet = (id: string) =>
    setDraft((d) =>
      d.map((x) =>
        x.exercise_id === id
          ? {
              ...x,
              sets: [
                ...x.sets,
                {
                  reps: x.sets[x.sets.length - 1]?.reps ?? 10,
                  weight_kg: x.sets[x.sets.length - 1]?.weight_kg ?? 0,
                },
              ],
            }
          : x,
      ),
    );

  const removeSet = (id: string, idx: number) =>
    setDraft((d) =>
      d.map((x) =>
        x.exercise_id === id ? { ...x, sets: x.sets.filter((_, i) => i !== idx) } : x,
      ),
    );

  const setSet = (id: string, idx: number, field: 'reps' | 'weight_kg', v: number) => {
    setDraft((d) =>
      d.map((x) =>
        x.exercise_id === id
          ? {
              ...x,
              sets: x.sets.map((s, i) =>
                i === idx
                  ? {
                      ...s,
                      [field]:
                        field === 'weight_kg'
                          ? Math.max(0, Math.round(v * 100) / 100)
                          : Math.max(0, Math.round(v)),
                    }
                  : s,
              ),
            }
          : x,
      ),
    );
  };

  const setBenchValue = (id: string, v: number) =>
    setBenchManual((m) => ({ ...m, [id]: Math.round(v) }));

  // ---- estado de material ----
  const setStatus = (id: string, status: EquipmentStatus) => {
    setDraft((d) => d.map((x) => (x.exercise_id === id ? { ...x, equipment_status: status } : x)));
  };

  // ---- aceptar alternativa: el original se APLAZA, entra el sustituto ----
  const acceptAlt = (origId: string, altId: string) => {
    const alt = byId.get(altId);
    if (!alt) return;
    const rec = weightForExercise(alt, {
      benchmarks: session.benchmarks,
      mode: session.equipment_mode,
      intensity: 'moderate',
      reps: 10,
      recent,
    });
    setPostponed((pp) => [
      ...pp.filter((x) => x.exercise_id !== origId),
      { exercise_id: origId, since_ts: Date.now(), last_check_ts: Date.now(), reason: 'busy' },
    ]);
    setDraft((d) => [
      ...d.filter((x) => x.exercise_id !== origId),
      {
        exercise_id: altId,
        // El sustituto usa SU propio peso (movimiento/máquina distintos):
        // no se copia el del original.
        sets: [
          { reps: 10, weight_kg: rec?.weight_kg ?? 0 },
          { reps: 10, weight_kg: rec?.weight_kg ?? 0 },
          { reps: 10, weight_kg: rec?.weight_kg ?? 0 },
        ],
      },
    ]);
    flash(`${t('alt_use')}: ${nameOf(alt)}`);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  };

  // ---- volver a un ejercicio aplazado / descartarlo ----
  const returnPostponed = (id: string) => {
    setPostponed((pp) => pp.filter((x) => x.exercise_id !== id));
    setDraft((d) => {
      if (d.some((x) => x.exercise_id === id)) return d;
      const lastSets = sessions
        .find((s) => s.exercises.some((e) => e.exercise_id === id))
        ?.exercises.find((e) => e.exercise_id === id)?.sets;
      const sets: SetLog[] =
        lastSets && lastSets.length > 0
          ? lastSets.slice(0, 3).map((s) => ({ reps: s.reps || 10, weight_kg: s.weight_kg ?? 0 }))
          : [
              { reps: 10, weight_kg: 0 },
              { reps: 10, weight_kg: 0 },
              { reps: 10, weight_kg: 0 },
            ];
      return [...d, { exercise_id: id, sets }];
    });
    flash(t('postponed_returned'));
    setConfirmReturn(null);
  };

  const skipPostponed = (id: string) => {
    setPostponed((pp) => pp.filter((x) => x.exercise_id !== id));
    flash(t('postponed_skipped'));
  };

  // ---- confirmación de la hoja de valores ----
  const confirmPick = (v: number) => {
    if (!pick) return;
    if (pick.kind === 'reps') setSet(pick.ex, pick.idx, 'reps', v);
    else if (pick.kind === 'weight') setSet(pick.ex, pick.idx, 'weight_kg', v);
    else if (pick.kind === 'duration') setDuration(Math.round(v));
    else if (pick.kind === 'body') setWeightStr(String(v));
    else if (pick.kind === 'bench') setBenchValue(pick.ex, v);
    setPick(null);
  };

  // ---- guardar ----
  const save = async () => {
    if (saving) return;
    setError('');
    setSaving(true);
    try {
      const bodyWeight = Number(weightStr.replace(',', '.'));
      const normalized = normalizeSession({
        id: session.id,
        date,
        type: isBenchmark ? 'benchmark' : 'training',
        exercises: draft,
        notes,
        duration_min: duration > 0 ? duration : null,
        body_weight_kg: bodyWeight > 0 ? bodyWeight : null,
      }) as Session;
      await store.addSession(normalized);
      // Benchmark: 1RM de cada ejercicio (el mejor set + ajuste manual).
      if (isBenchmark) {
        const entries: { exercise_id: string; estimated_1rm: number }[] = [];
        for (const d of draft) {
          const ex = byId.get(d.exercise_id);
          if (!ex) continue;
          const best = d.sets.reduce<{ s: SetLog; r: number } | null>((a, s) => {
            const r = oneRm(s.weight_kg, s.reps);
            return r > (a?.r || 0) ? { s, r } : a;
          }, null);
          const est1rm = best ? Math.round(best.r) : 0;
          const manual = benchManual[d.exercise_id];
          const final1rm = manual && manual > 0 ? manual : est1rm > 0 ? est1rm : undefined;
          if (final1rm && final1rm > 0) entries.push({ exercise_id: ex.id, estimated_1rm: final1rm });
        }
        if (entries.length > 0) await store.setBenchmarks(entries);
      }
      setDraft([]);
      setPostponed([]);
      setNotes('');
      setWeightStr('');
      setDuration(0);
      setBenchManual({});
      setSaved(true);
      // onSaved() termina la sesión activa (vuelve al modo normal); NO llamar
      // a onSessionChange aquí: App la ha dejado a null y redefinirla con
      // draft:[] mantendría el estado activo "vacío" y el tema navy.
      onSaved(normalized);
    } catch (e) {
      setError(String((e as Error)?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const minsLeft = (pp: PostponedExercise) =>
    Math.max(0, Math.ceil((RECHECK_MS - (now - pp.since_ts)) / 60000));

  const statusChip = (id: string, s: EquipmentStatus, label: string) => {
    const active = draft.find((d) => d.exercise_id === id)?.equipment_status === s;
    return (
      <Pressable
        key={s}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        onPress={() => setStatus(id, s)}
        style={({ pressed }) => [
          styles.statusChip,
          {
            backgroundColor: active ? p.accent : 'transparent',
            borderColor: active ? p.accent : p.border,
            transform: [{ scale: pressed ? 0.95 : 1 }],
            transition: 'transform 80ms ease, background-color 120ms ease',
          },
        ]}
      >
        <Text style={[styles.statusChipText, { color: active ? '#fff' : p.secondary }]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    // Con el teclado abierto, el contenedor se encoge (iOS: height; Android:
    // padding) para que el campo en foco y la barra de guardado queden
    // siempre alcanzables, sin solapar el teclado.
    <KeyboardAvoidingView style={styles.root} behavior="padding">
      {/* ---- banner de entrenamiento activo (siempre visible) ---- */}
      <View style={styles.activeBanner}>
        <View style={styles.activeRow}>
          <View style={styles.activeDotWrap}>
            <View style={[styles.activeDot, { backgroundColor: session.paused ? '#FFD60A' : '#30D158' }]} />
            <Text style={styles.activeLabel}>
              {session.paused ? t('workout_paused') : t('workout_active')}
            </Text>
          </View>
          <Text style={styles.activeTime}>{elapsedLabel}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={session.paused ? t('workout_resume') : t('workout_pause')}
            onPress={() => {
              if (session.paused) {
                onSessionChange({
                  ...session,
                  paused: false,
                  paused_total_ms: (session.paused_total_ms || 0) + (Date.now() - (session.paused_since || Date.now())),
                  paused_since: undefined,
                });
              } else {
                onSessionChange({ ...session, paused: true, paused_since: Date.now() });
              }
            }}
            style={({ pressed }) => [styles.pauseBtn, { opacity: pressed ? 0.7 : 1, transition: 'opacity 90ms ease' }]}
          >
            <Text style={styles.pauseBtnText}>{session.paused ? '▶' : '❚❚'}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('sess_discard')}
            onPress={() => setConfirmDiscard(true)}
            style={({ pressed }) => [styles.pauseBtn, { opacity: pressed ? 0.7 : 1, transition: 'opacity 90ms ease' }]}
          >
            <Text style={styles.pauseBtnText}>✕</Text>
          </Pressable>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: '#30D158' }]} />
        </View>
        <Text style={styles.progressText}>
          {doneSets}/{totalSets} {t('workout_sets_done')}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={[styles.title, { fontSize: fs(scale, 32), color: p.text }]} numberOfLines={1}>
          {t('sess_title')}
        </Text>
        <Text style={[styles.sub, { color: p.secondary }]}>{t('sess_sub')}</Text>

        <View style={styles.fieldsRow}>
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: p.secondary }]}>{t('sess_date')}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.dateBox,
                {
                  backgroundColor: p.fieldBg,
                  borderColor: dateOpen ? p.accent : p.border,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  transition: 'transform 80ms ease',
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={date}
              onPress={() => setDateOpen((o) => !o)}
            >
              <Text style={[styles.dateText, { color: p.text }]}>{fmtDay(date, lang)}</Text>
            </Pressable>
          </View>
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: p.secondary }]}>{t('picker_duration')}</Text>
            <ValueBox
              value={duration > 0 ? String(duration) : '—'}
              unit={t('picker_minutes')}
              onPress={() => setPick({ kind: 'duration' })}
              accent={duration > 0}
            />
          </View>
        </View>
        <View style={styles.fieldsRow}>
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: p.secondary }]}>{t('sess_bodyweight')}</Text>
            <ValueBox
              value={weightStr ? fmtNum(Number(weightStr)) : '—'}
              unit="kg"
              onPress={() => setPick({ kind: 'body' })}
              accent={weightStr !== ''}
            />
          </View>
        </View>
        {dateOpen ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
            {recentDays.map((d) => (
              <Pressable
                key={d}
                style={({ pressed }) => [
                  styles.dateChip,
                  {
                    backgroundColor: d === date ? p.accent : p.card,
                    borderColor: d === date ? p.accent : p.border,
                    transform: [{ scale: pressed ? 0.94 : 1 }],
                    transition: 'transform 80ms ease',
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={d}
                onPress={() => {
                  setDate(d);
                  setDateOpen(false);
                }}
              >
                <Text style={[styles.dateChipText, { color: d === date ? '#fff' : p.text }]}>
                  {d === todayISO() ? t('cal_today') : fmtDay(d, lang)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <Text style={[styles.fieldLabel, { color: p.secondary }]}>{t('sess_pick')}</Text>
        <TextInput
          style={[styles.search, { backgroundColor: p.fieldBg, borderColor: p.border, color: p.text }]}
          placeholder={t('sess_search_ph')}
          placeholderTextColor={p.dim}
          value={q}
          onChangeText={setQ}
          autoCorrect={false}
          accessibilityLabel={t('sess_pick')}
        />
        <View style={styles.results}>
          {results.map((e) => (
            <Pressable
              key={e.id}
              style={({ pressed }) => [
                styles.resultRow,
                {
                  backgroundColor: p.card,
                  borderColor: p.cardBorder,
                  ...SHADOW.card,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  transition: 'transform 90ms ease',
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={nameOf(e)}
              onPress={() => addExercise(e.id)}
            >
              <Image source={e.imageAsset} style={styles.resultThumb} resizeMode="cover" />
              <Text style={[styles.resultName, { color: p.text }]} numberOfLines={1}>
                {nameOf(e)}
              </Text>
              <Text style={[styles.resultAdd, { color: p.accent }]}>+ {t('sess_add_exercise')}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.saveTitle, { color: p.text }]}>{t('hist_exercises')}</Text>
        {draft.length === 0 ? (
          <Text style={[styles.empty, { color: p.dim }]}>{t('sess_no_exercises')}</Text>
        ) : (
          draft.map((d) => {
            const ex = byId.get(d.exercise_id);
            const est1rm = Math.round(Math.max(...d.sets.map((s) => oneRm(s.weight_kg, s.reps)), 0));
            return (
              <View
                key={d.exercise_id}
                style={[styles.draftCard, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card }]}
                onLayout={(e) => {
                  cardOffsets.current[d.exercise_id] = e.nativeEvent.layout.y;
                }}
              >
                <View style={styles.draftHeader}>
                  <View style={styles.draftTitleWrap}>
                    <ExerciseGlyph label={ex?.muscle_group || 'legs'} size={22} />
                    <Text style={[styles.draftName, { color: p.text }]} numberOfLines={1}>
                      {ex ? nameOf(ex) : d.exercise_id}
                    </Text>
                  </View>
                  <Pressable
                    style={({ pressed }) => [styles.draftRemoveBtn, { opacity: pressed ? 0.6 : 1, transition: 'opacity 90ms ease' }]}
                    accessibilityRole="button"
                    accessibilityLabel={t('delete')}
                    onPress={() => removeExercise(d.exercise_id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={[styles.draftRemove, { color: p.red }]}>{t('delete')}</Text>
                  </Pressable>
                </View>
                {ex ? (
                  <Text style={[styles.draftMeta, { color: p.dim }]}>
                    {t(`group_${ex.muscle_group}`)} · {t(`equip_${ex.equipment}`)}
                  </Text>
                ) : null}

                {/* estado del material */}
                <View style={styles.statusRow}>
                  {statusChip(d.exercise_id, 'available', t('status_available'))}
                  {statusChip(d.exercise_id, 'busy', t('status_busy'))}
                  {statusChip(d.exercise_id, 'unavailable', t('status_unavailable'))}
                </View>

                {/* ocupado/no disponible: buscar alternativa */}
                {ex && (d.equipment_status === 'busy' || d.equipment_status === 'unavailable') ? (
                  <AltList
                    orig={ex}
                    exercises={exercises}
                    mode={session.equipment_mode}
                    benchmarks={session.benchmarks}
                    recent={recent}
                    draft={draft}
                    postponed={postponed}
                    onPickAlt={(altId) => acceptAlt(d.exercise_id, altId)}
                  />
                ) : null}

                {/* benchmark: 1RM */}
                {isBenchmark ? (
                  <View style={styles.benchRow}>
                    <View style={styles.benchCol}>
                      <Text style={[styles.setCaption, { color: p.secondary }]}>{t('bench_1rm_auto')}</Text>
                      <View style={[styles.benchBox, { backgroundColor: p.fieldBg, borderColor: p.border }]}>
                        <Text style={[styles.benchBoxNum, { color: p.accent }]}>{est1rm > 0 ? `${est1rm} kg` : '—'}</Text>
                      </View>
                    </View>
                    <View style={styles.benchCol}>
                      <Text style={[styles.setCaption, { color: p.secondary }]}>{t('bench_1rm')}</Text>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setPick({ kind: 'bench', ex: d.exercise_id })}
                        style={({ pressed }) => [
                          styles.benchBox,
                          {
                            backgroundColor: p.fieldBg,
                            borderColor: p.border,
                            transform: [{ scale: pressed ? 0.97 : 1 }],
                            transition: 'transform 80ms ease',
                          },
                        ]}
                      >
                        <Text style={[styles.benchBoxNum, { color: benchManual[d.exercise_id] ? p.accent : p.dim }]}>
                          {benchManual[d.exercise_id] ? `${benchManual[d.exercise_id]} kg` : t('bench_manual')}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : null}

                <View style={styles.setsHeader}>
                  <Text style={[styles.setsLabel, { color: p.secondary }]}>{t('sess_sets')}</Text>
                  {!isBenchmark && est1rm > 0 ? (
                    <Text style={[styles.oneRm, { color: p.accent }]}>1RM ≈ {Math.round(est1rm * 10) / 10} kg</Text>
                  ) : null}
                </View>
                {d.sets.map((s, i) => (
                  <View key={i} style={styles.setRow}>
                    <View style={styles.setFieldWrap}>
                      <Text style={[styles.setCaption, { color: p.secondary }]}>{t('sess_set')} {i + 1}</Text>
                      <ValueBox
                        value={String(s.reps)}
                        unit="reps"
                        onPress={() => setPick({ kind: 'reps', ex: d.exercise_id, idx: i })}
                        accent={s.reps > 0}
                      />
                    </View>
                    <View style={styles.setFieldWrap}>
                      <Text style={[styles.setCaption, { color: p.secondary }]}>{t('sess_weight')}</Text>
                      <ValueBox
                        value={fmtNum(s.weight_kg)}
                        unit="kg"
                        onPress={() => setPick({ kind: 'weight', ex: d.exercise_id, idx: i })}
                        accent={s.weight_kg > 0}
                      />
                    </View>
                    <View style={styles.setDelWrap}>
                      <Text style={[styles.setCaption, { color: p.secondary }]}>{t('delete')}</Text>
                      <Pressable
                        style={({ pressed }) => [styles.setRemoveBtn, { opacity: pressed ? 0.6 : 1, transition: 'opacity 90ms ease' }]}
                        accessibilityRole="button"
                        accessibilityLabel={t('delete')}
                        onPress={() => removeSet(d.exercise_id, i)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <XGlyph size={18} color={p.red} />
                      </Pressable>
                    </View>
                  </View>
                ))}
                <Pressable
                  style={({ pressed }) => [styles.addSet, { opacity: pressed ? 0.7 : 1, transition: 'opacity 90ms ease' }]}
                  accessibilityRole="button"
                  onPress={() => addSet(d.exercise_id)}
                >
                  <Text style={[styles.addSetText, { color: p.accent }]}>+ {t('sess_add_set')}</Text>
                </Pressable>
              </View>
            );
          })
        )}

        {/* ---- ejercicios aplazados (re-evaluación continua) ---- */}
        {postponed.length > 0 ? (
          <View style={[styles.postponedCard, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card }]}>
            <Text style={[styles.postponedTitle, { color: p.text }]}>{t('postponed_title')}</Text>
            <Text style={[styles.postponedSub, { color: p.secondary }]}>{t('postponed_sub')}</Text>
            {postponed.map((pp) => {
              const ex = byId.get(pp.exercise_id);
              const left = minsLeft(pp);
              return (
                <View key={pp.exercise_id} style={[styles.postponedRow, { borderTopColor: p.cardBorder }]}>
                  <View style={styles.postponedInfo}>
                    <ExerciseGlyph label={ex?.muscle_group || 'legs'} size={18} />
                    <Text style={[styles.postponedName, { color: p.text }]} numberOfLines={1}>
                      {ex ? nameOf(ex) : pp.exercise_id}
                    </Text>
                    <Text style={[styles.postponedWait, { color: p.dim }]}>
                      {left > 0 ? `${t('postponed_wait')} ${left}m` : t('postponed_ready')}
                    </Text>
                  </View>
                  <View style={styles.postponedBtns}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t('postponed_check')}
                      disabled={left > 0}
                      onPress={() => setConfirmReturn(pp.exercise_id)}
                      style={({ pressed }) => [
                        styles.postponedBtn,
                        {
                          backgroundColor: left > 0 ? p.section : p.accent,
                          borderWidth: 0,
                          opacity: pressed ? 0.8 : 1,
                          transition: 'opacity 90ms ease',
                        },
                      ]}
                    >
                      <Text style={[styles.postponedBtnText, { color: left > 0 ? p.dim : '#fff' }]} numberOfLines={1}>
                        {t('postponed_check')}
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t('postponed_skip')}
                      onPress={() => skipPostponed(pp.exercise_id)}
                      style={({ pressed }) => [
                        styles.postponedBtn,
                        { backgroundColor: 'transparent', borderColor: p.border, opacity: pressed ? 0.7 : 1, transition: 'opacity 90ms ease' },
                      ]}
                    >
                      <Text style={[styles.postponedBtnText, { color: p.secondary }]} numberOfLines={1}>
                        {t('postponed_skip')}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        <Text style={[styles.fieldLabel, { color: p.secondary }]}>{t('sess_notes')}</Text>
        <TextInput
          style={[styles.notes, { backgroundColor: p.fieldBg, borderColor: p.border, color: p.text }]}
          placeholder={t('sess_notes_ph')}
          placeholderTextColor={p.dim}
          value={notes}
          onChangeText={setNotes}
          multiline
          accessibilityLabel={t('sess_notes')}
        />

        {error ? <Text style={[styles.error, { color: p.red }]}>{error}</Text> : null}
      </ScrollView>

      {/* ---- toast de confirmación ---- */}
      {toast ? (
        <View style={styles.toast} pointerEvents="none">
          <View style={[styles.toastDot, { backgroundColor: '#30D158' }]} />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      {/* Hoja de valores (peso / reps / duración / peso corporal / 1RM). */}
      {pick ? (
        <PickerSheet
          open
          title={
            pick.kind === 'reps'
              ? t('picker_reps')
              : pick.kind === 'weight'
                ? t('picker_weight')
                : pick.kind === 'duration'
                  ? t('picker_duration')
                  : pick.kind === 'bench'
                    ? t('bench_1rm')
                    : t('sess_bodyweight')
          }
          unit={pick.kind === 'reps' ? 'reps' : 'kg'}
          values={
            pick.kind === 'reps'
              ? [5, 8, 10, 12, 15, 20, 25, 30]
              : pick.kind === 'weight'
                ? [0, 2.5, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 90, 100]
                : pick.kind === 'duration'
                  ? [15, 20, 30, 40, 45, 50, 60, 75, 90]
                  : pick.kind === 'bench'
                    ? [20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 220, 250]
                    : [45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 100]
          }
          value={
            pick.kind === 'reps'
              ? draft.find((x) => x.exercise_id === pick!.ex)?.sets[pick!.idx]?.reps ?? 0
              : pick.kind === 'weight'
                ? draft.find((x) => x.exercise_id === pick!.ex)?.sets[pick!.idx]?.weight_kg ?? 0
                : pick.kind === 'duration'
                  ? duration
                  : pick.kind === 'bench'
                    ? benchManual[pick.ex] ?? 0
                    : Number(weightStr) || 0
          }
          custom={
            pick.kind === 'reps'
              ? { min: 1, max: 200, step: 1 }
              : pick.kind === 'weight'
                ? { min: 0, max: 500, step: 2.5 }
                : pick.kind === 'duration'
                  ? { min: 1, max: 600, step: 5 }
                  : pick.kind === 'bench'
                    ? { min: 5, max: 500, step: 2.5 }
                    : { min: 10, max: 400, step: 1 }
          }
          labelCustom={t('other_value')}
          labelUse={t('use_value')}
          onSelect={() => undefined}
          onConfirm={confirmPick}
        />
      ) : null}

      {/* Confirmación de disponibilidad de un ejercicio aplazado */}
      {confirmReturn ? (
        <View style={styles.modalBack} pointerEvents="box-none">
          <View style={[styles.modalCard, { backgroundColor: p.card, borderColor: p.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: p.text }]}>{t('postponed_available_q')}</Text>
            <Text style={[styles.modalMsg, { color: p.secondary }]}>{nameOf(byId.get(confirmReturn))}</Text>
            <View style={styles.modalRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => returnPostponed(confirmReturn)}
                style={({ pressed }) => [styles.modalBtn, { backgroundColor: p.accent, opacity: pressed ? 0.85 : 1, transition: 'opacity 90ms ease' }]}
              >
                <Text style={styles.modalBtnTextYes}>{t('postponed_return')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setConfirmReturn(null)}
                style={({ pressed }) => [styles.modalBtn, { backgroundColor: p.section, opacity: pressed ? 0.8 : 1, transition: 'opacity 90ms ease' }]}
              >
                <Text style={[styles.modalBtnText, { color: p.secondary }]}>{t('cancel')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      {/* Confirmación de descartar el entrenamiento activo */}
      {confirmDiscard ? (
        <View style={styles.modalBack} pointerEvents="box-none">
          <View style={[styles.modalCard, { backgroundColor: p.card, borderColor: p.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: p.text }]}>{t('sess_discard_q')}</Text>
            <Text style={[styles.modalMsg, { color: p.secondary }]}>{t('sess_discard_msg')}</Text>
            <View style={styles.modalRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setConfirmDiscard(false);
                  onDiscard();
                }}
                style={({ pressed }) => [styles.modalBtn, { backgroundColor: p.red, opacity: pressed ? 0.85 : 1, transition: 'opacity 90ms ease' }]}
              >
                <Text style={styles.modalBtnTextYes}>{t('sess_discard')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setConfirmDiscard(false)}
                style={({ pressed }) => [styles.modalBtn, { backgroundColor: p.section, opacity: pressed ? 0.8 : 1, transition: 'opacity 90ms ease' }]}
              >
                <Text style={[styles.modalBtnText, { color: p.secondary }]}>{t('cancel')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      {/* Barra fija de guardado: siempre visible, sin hacer scroll. */}
      <View style={[styles.footer, { backgroundColor: p.headerBg, borderTopColor: p.border }]}>
        {saved ? (
          <Text style={[styles.savedText, { color: p.green }]} numberOfLines={2}>
            {t('sess_saved')} — {t('sess_saved_hint')}
          </Text>
        ) : (
          <Text style={[styles.footerCount, { color: p.secondary }]} numberOfLines={1}>
            {plural(draft.length, t, 'hist_exercise', 'hist_exercises')} · {plural(totalSets, t, 'hist_set', 'hist_sets_total')}
          </Text>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            { backgroundColor: p.accent, opacity: draft.length === 0 || saving ? 0.4 : pressed ? 0.85 : 1, transition: 'opacity 90ms ease' },
          ]}
          accessibilityRole="button"
          disabled={draft.length === 0 || saving}
          onPress={save}
        >
          <Text style={styles.saveBtnText}>{saving ? t('saving') : isBenchmark ? t('bench_save') : t('sess_save')}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

/** Lista de alternativas sugeridas para un ejercicio ocupado. */
function AltList({
  orig,
  exercises,
  mode,
  benchmarks,
  recent,
  draft,
  postponed,
  onPickAlt,
}: {
  orig: Exercise;
  exercises: Exercise[];
  mode: Parameters<typeof suggestAlternatives>[2]['mode'];
  benchmarks: { exercise_id: string; estimated_1rm: number }[];
  recent: RecentRow[];
  draft: ActiveDraftExercise[];
  postponed: PostponedExercise[];
  onPickAlt: (altId: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const { p } = useTheme();
  const [open, setOpen] = useState(false);
  const lang = i18n.language as string;

  const alts = useMemo(
    () =>
      suggestAlternatives(orig, exercises, {
        mode,
        benchmarks,
        intensity: 'moderate',
        exclude: [...draft.map((d) => d.exercise_id), ...postponed.map((pp) => pp.exercise_id)],
        recent,
      }).slice(0, 3),
    [orig, exercises, mode, benchmarks, recent, draft, postponed],
  );

  if (!open) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.altFindBtn, { opacity: pressed ? 0.8 : 1, transition: 'opacity 90ms ease' }]}
      >
        <Text style={[styles.altFindBtnText, { color: p.accent }]}>{t('find_alt')}</Text>
      </Pressable>
    );
  }
  return (
    <View style={[styles.altBlock, { backgroundColor: p.section, borderColor: p.border }]}>
      {alts.length === 0 ? (
        <Text style={[styles.altNone, { color: p.dim }]}>{t('alt_none')}</Text>
      ) : (
        alts.map((a) => (
          <View key={a.id} style={[styles.altRow, { borderColor: p.border }]}>
            <ExerciseGlyph label={a.muscle_group} size={18} />
            <View style={styles.altInfo}>
              <Text style={[styles.altName, { color: p.text }]} numberOfLines={1}>
                {lang === 'nl' ? a.name_nl || a.name_en : a.name_en}
              </Text>
              <Text style={[styles.altMeta, { color: p.dim }]} numberOfLines={1}>
                {t(`equip_${a.equipment}`)}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${t('alt_use')} ${a.name_en}`}
              onPress={() => {
                setOpen(false);
                onPickAlt(a.id);
              }}
              style={({ pressed }) => [styles.altUseBtn, { opacity: pressed ? 0.8 : 1, transition: 'opacity 90ms ease' }]}
            >
              <Text style={[styles.altUseBtnText, { color: p.accent }]}>{t('alt_use')}</Text>
            </Pressable>
          </View>
        ))
      )}
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(false)}
        style={({ pressed }) => [styles.altClose, { opacity: pressed ? 0.7 : 1, transition: 'opacity 90ms ease' }]}
      >
        <Text style={[styles.altCloseText, { color: p.secondary }]}>{t('alt_another')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E1526',
  },
  activeBanner: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activeDotWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  activeTime: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'right',
  },
  pauseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBtnText: {
    fontSize: 13,
    color: '#fff',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    textAlign: 'right',
  },
  scroll: {
    flex: 1,
  },
  body: {
    padding: 20,
    paddingBottom: 24,
    backgroundColor: '#0E1526',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  sub: {
    fontSize: 15,
    marginTop: 4,
    marginBottom: 16,
  },
  fieldsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  fieldWrap: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  dateBox: {
    borderRadius: RADII.field,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
  },
  dateRow: {
    gap: 8,
    marginBottom: 14,
    paddingRight: 8,
  },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  dateChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  search: {
    borderRadius: RADII.field,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  results: {
    gap: 8,
    marginTop: 8,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  resultThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  resultName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
  resultAdd: {
    fontSize: 13,
    fontWeight: '700',
  },
  saveTitle: {
    fontSize: 19,
    fontWeight: '600',
    marginTop: 22,
    marginBottom: 10,
  },
  empty: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  draftCard: {
    borderRadius: RADII.tile,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  draftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  draftTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  draftName: {
    fontSize: 17,
    fontWeight: '700',
    flexShrink: 1,
  },
  draftRemoveBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  draftRemove: {
    fontSize: 12,
    fontWeight: '600',
  },
  draftMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  statusChip: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  altFindBtn: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D9541E',
  },
  altFindBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  altBlock: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  altNone: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  altRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  altInfo: {
    flex: 1,
  },
  altName: {
    fontSize: 14,
    fontWeight: '600',
  },
  altMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  altUseBtn: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#D9541E',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  altUseBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  altClose: {
    marginTop: 8,
    alignSelf: 'center',
    paddingVertical: 6,
  },
  altCloseText: {
    fontSize: 12,
    fontWeight: '600',
  },
  benchRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  benchCol: {
    flex: 1,
  },
  benchBox: {
    borderRadius: RADII.field,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  benchBoxNum: {
    fontSize: 15,
    fontWeight: '700',
  },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  setsLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  oneRm: {
    fontSize: 13,
    fontWeight: '700',
  },
  setRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    alignItems: 'flex-end',
  },
  setFieldWrap: {
    flex: 1,
  },
  setCaption: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  valueBox: {
    borderRadius: RADII.field,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  valueBoxNum: {
    fontSize: 19,
    fontWeight: '700',
  },
  valueBoxUnit: {
    fontSize: 12,
    marginTop: 2,
  },
  setDelWrap: {
    width: 44,
    alignItems: 'center',
  },
  setRemoveBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240, 78, 78, 0.12)',
  },
  addSet: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  addSetText: {
    fontSize: 14,
    fontWeight: '700',
  },
  postponedCard: {
    borderRadius: RADII.tile,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  postponedTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  postponedSub: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
  },
  postponedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  postponedInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postponedName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  postponedWait: {
    fontSize: 11,
    fontWeight: '600',
  },
  postponedBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  postponedBtn: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
  },
  postponedBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  notes: {
    borderRadius: RADII.field,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 72,
    marginTop: 4,
  },
  error: {
    fontSize: 13,
    marginTop: 12,
  },
  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(20,24,32,0.92)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  toastDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  modalBack: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  modalCard: {
    width: '82%',
    maxWidth: 340,
    borderRadius: RADII.tile,
    borderWidth: 1,
    padding: 18,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalMsg: {
    fontSize: 14,
    marginTop: 6,
  },
  modalRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    borderRadius: RADII.pill,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalBtnTextYes: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footerCount: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  savedText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    borderRadius: RADII.tile,
    paddingVertical: 14,
    paddingHorizontal: 26,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
