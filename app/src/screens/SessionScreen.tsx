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
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '../data';
import type { Session, SetLog } from '../store';
import { searchExercises, normalizeSession, uid, todayISO, oneRm } from '../lib/gym';
import { store } from '../store';
import { GROUP_COLORS, RADII } from '../theme';
import { useTheme } from '../theme-context';
import { useScale, fs } from '../scale';
import { XGlyph, CheckGlyph } from '../components/TabIcon';
import { PickerSheet, fmtNum } from '../components/PickerSheet';
import { Gradient } from '../components/Gradient';
import { plural } from '../lib/plural';
import {
  suggestAlternatives,
  suggestNextExercise,
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
  done,
}: {
  value: string;
  unit: string;
  onPress: () => void;
  /** Resaltado "activo" (por ejemplo, un campo ya rellenado). */
  accent?: boolean;
  /** Serie COMPLETADA: se marca en verde (estado de éxito). */
  done?: boolean;
}) {
  const { p } = useTheme();
  const scale = useScale();
  const doneColor = p.green;
  const activeColor = done ? doneColor : accent ? p.accent : null;
  const active = activeColor !== null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${value} ${unit}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.valueBox,
        {
          backgroundColor: active ? activeColor : p.fieldBg,
          borderColor: active ? activeColor : p.border,
          transform: [{ scale: pressed ? 0.96 : 1 }],
          transition: 'transform 80ms ease, background-color 140ms ease, border-color 140ms ease',
        },
      ]}
    >
      <Text style={[styles.valueBoxNum, { fontSize: fs(scale, 19), color: active ? '#fff' : p.text }]}>
        {value}
      </Text>
      <Text style={[styles.valueBoxUnit, { fontSize: fs(scale, 12), color: active ? 'rgba(255,255,255,0.85)' : p.secondary }]}>
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
  const { p, SHADOW, GRADIENT } = useTheme();
  const scale = useScale();

  const [date, setDate] = useState<string>(session.date || todayISO());
  const [dateOpen, setDateOpen] = useState(false);
  const [weightStr, setWeightStr] = useState<string>(
    session.body_weight_kg ? String(session.body_weight_kg) : '',
  );
  const [heightStr, setHeightStr] = useState<string>(session.height_cm ? String(session.height_cm) : '');
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
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const scrollRef = useRef<any>(null);
  const cardOffsets = useRef<Record<string, number>>({});

  // Cronómetro: tick cada segundo mientras no está pausado (al pausar,
  // congela y solo refresca cada 30 s para no desperdiciar energía).
  const now = useNow(session.paused ? 30000 : 1000);

  // Hojas de elección (peso / reps / duración / peso corporal / altura / 1RM).
  type PickTarget =
    | { kind: 'reps'; ex: string; idx: number }
    | { kind: 'weight'; ex: string; idx: number }
    | { kind: 'duration' }
    | { kind: 'body' }
    | { kind: 'height' }
    | { kind: 'bench'; ex: string };
  const [pick, setPick] = useState<PickTarget | null>(null);
  // R-15: sugerencia de ejercicio (el que sigue). R-16: búsqueda bajo demanda.
  const [suggestedId, setSuggestedId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  // Campos secundarios (fecha, duración, peso, altura, notas) PLEGADOS por
  // defecto: la sesión muestra solo lo importante para entrenar. El
  // usuario expande "Detalles" cuando quiera ajustarlos.
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Foco en el EJERCICIO ACTUAL: el usuario entrena de arriba a abajo.
  // `currentIndex` señala cuál es "el de ahora"; "Acabar ejercicio"
  // lo avanza al siguiente y la app indica cuál es ese siguiente.
  const [currentIndex, setCurrentIndex] = useState(0);

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
      height_cm: Number(heightStr.replace(',', '.')) || undefined,
      notes,
      draft,
      postponed,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, duration, weightStr, heightStr, notes, draft, postponed]);

  // ---- progreso: series COMPLETADAS (marcadas por el usuario) / totales ----
  // Los valores prellenados (sugeridos) NO cuentan: solo marca la serie
  // cuando se completa. Así la barra refleja trabajo real, no el plan.
  const totalSets = draft.reduce((a, d) => a + d.sets.length, 0);
  const doneSets = draft.reduce((a, d) => a + d.sets.filter((s) => s.done).length, 0);
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
      jumpToExercise(id); // sin duplicar: enfoca el que ya está
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
    setCurrentIndex(draft.length); // el foco salta al ejercicio recién añadido
    flash(t('sess_added'));
    setTimeout(() => focusScroll(id), 60);
  };

  const removeExercise = (id: string) =>
    setDraft((d) => d.filter((x) => x.exercise_id !== id));

  // ---- R-15: sugerencia de ejercicio (el que sigue) ----
  const suggestList = useMemo(() => {
    // Lista de candidatos (sin repetirse), para poder pedir "otra".
    const cand = (limit = 8) => {
      let out: string[] = [];
      const excluded = new Set<string>();
      for (let i = 0; i < limit; i++) {
        const e = suggestNextExercise(exercises, {
          mode: session.equipment_mode,
          benchmarks: session.benchmarks,
          recent,
          exclude: [...excluded, ...draft.map((x) => x.exercise_id)],
        });
        if (!e) break;
        out.push(e.id);
        excluded.add(e.id);
      }
      return out;
    };
    return cand();
  }, [exercises, session.equipment_mode, session.benchmarks, recent, draft]);

  const suggested = useMemo(() => {
    if (!suggestedId) return null;
    return byId.get(suggestedId) || null;
  }, [suggestedId, byId]);

  const requestSuggestion = () => {
    if (suggestList.length === 0) return;
    if (suggestedId === null) {
      setSuggestedId(suggestList[0]);
      return;
    }
    const i = suggestList.indexOf(suggestedId);
    const next = suggestList[(i + 1) % suggestList.length];
    setSuggestedId(next === suggestedId ? null : next);
  };

  // ---- foco en el ejercicio actual ----
  // El índice siempre apunta dentro del draft (se ajusta al añadir/borrar).
  useEffect(() => {
    if (draft.length === 0) {
      if (currentIndex !== 0) setCurrentIndex(0);
      return;
    }
    if (currentIndex >= draft.length) setCurrentIndex(draft.length - 1);
  }, [draft.length, currentIndex]);

  const currentId = draft[currentIndex]?.exercise_id ?? null;

  // El ejercicio que SIGUE según el plan (lo indica la app al "acabar").
  const nextInPlan = draft[currentIndex + 1] ? byId.get(draft[currentIndex + 1].exercise_id) ?? null : null;
  const isLastExercise = currentIndex >= draft.length - 1;

  // Scroll de foco: centra la tarjeta ACTUAL en la parte superior de la zona
  // visible (franja "AHORA" + nombre del ejercicio siempre a la vista). La
  // acción "Acabar ejercicio" vive en la barra fija, así no hay que scrollear
  // para llegar al final de la tarjeta.
  const focusScroll = useCallback((id: string) => {
    const off = cardOffsets.current[id];
    if (off == null) return;
    scrollRef.current?.scrollTo({ y: Math.max(0, off - 12), animated: true });
  }, []);

  // Al montar la sesión (draft ya preparado), centra el ejercicio actual.
  const focusedOnce = useRef(false);
  useEffect(() => {
    if (draft.length === 0) return;
    if (focusedOnce.current) return;
    focusedOnce.current = true;
    const id = draft[currentIndex]?.exercise_id;
    if (!id) return;
    const t1 = setTimeout(() => focusScroll(id), 150);
    const t2 = setTimeout(() => focusScroll(id), 450); // 2ª pasada: layout final
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishExercise = () => {
    const idx = currentIndex;
    if (idx + 1 < draft.length) {
      setCurrentIndex(idx + 1);
      const nid = draft[idx + 1].exercise_id;
      setTimeout(() => focusScroll(nid), 60);
      flash(t('sess_next', { name: nameOf(nextInPlan ?? undefined) }));
      return;
    }
    flash(t('sess_done_all'));
  };

  const jumpToExercise = (id: string) => {
    const i = draft.findIndex((x) => x.exercise_id === id);
    if (i < 0) return;
    setCurrentIndex(i);
    setTimeout(() => focusScroll(id), 60);
  };

  // Sugerir del MISMO grupo muscular que el ejercicio actual.
  const sameGroupSuggest = () => {
    const cur = currentId ? byId.get(currentId) : null;
    if (!cur) return;
    const cand = suggestNextExercise(exercises, {
      mode: session.equipment_mode,
      groups: [cur.muscle_group],
      benchmarks: session.benchmarks,
      recent,
      exclude: draft.map((x) => x.exercise_id),
    });
    if (cand) {
      setSuggestedId(cand.id);
      flash(`${t('sess_group_hint', { group: t(`group_${cand.muscle_group}`) })}`);
    } else {
      requestSuggestion();
    }
  };

  // ---- R-16: búsqueda bajo demanda (hoja inferior) ----
  const openSearch = () => {
    setQ('');
    setSearchOpen(true);
  };

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

  /** Marcar/desmarcar una serie como COMPLETADA (progreso real). */
  const toggleSetDone = (id: string, idx: number) => {
    setDraft((d) =>
      d.map((x) =>
        x.exercise_id === id
          ? { ...x, sets: x.sets.map((s, i) => (i === idx ? { ...s, done: !s.done } : s)) }
          : x,
      ),
    );
  };

  const setBenchValue = (id: string, v: number) =>
    setBenchManual((m) => ({ ...m, [id]: Math.round(v) }));

  // ---- estado de material ----
  // Disponible: simple. Ocupado / Fuera de servicio: el ejercicio se
  // APLAZA (se saca de la lista conservando sus series) y las
  // sugerencias se deciden desde la tarjeta de aplazados. El usuario
  // marca el ritmo: pide "otra sugerencia" cuando quiera, y cuando el
  // ciclo llega de vuelta al original puede elegir hacerlo ahora.
  const setStatus = (id: string, status: EquipmentStatus) => {
    if (status === 'available') {
      setDraft((d) => d.map((x) => (x.exercise_id === id ? { ...x, equipment_status: status } : x)));
      return;
    }
    const d0 = draft.find((x) => x.exercise_id === id);
    if (!d0) return;
    setPostponed((pp) => [
      ...pp.filter((x) => x.exercise_id !== id),
      {
        exercise_id: id,
        reason: status === 'busy' ? 'busy' : 'unavailable',
        attempts: 0,
        sets: d0.sets.map((s) => ({ ...s })),
      },
    ]);
    setDraft((d) => d.filter((x) => x.exercise_id !== id));
    flash(t('postponed_moved'));
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  };

  // ---- sugerencias del ejercicio aplazado ----
  // Cuántas veces ha pedido el usuario "otra sugerencia". Sin
  // temporizador. Tras POSTPONE_RETURN_AT intentos, el ejercicio
  // original vuelve a aparecer como opción ("hacerlo ahora").
  const POSTPONE_RETURN_AT = 5;

  const usePostponedAlt = (origId: string, altId: string) => {
    const alt = byId.get(altId);
    if (!alt) return;
    // El sustituto usa SU propio peso (movimiento/máquina distintos):
    // no se copia el del ejercicio original.
    const rec = weightForExercise(alt, {
      benchmarks: session.benchmarks,
      mode: session.equipment_mode,
      intensity: 'moderate',
      reps: 10,
      recent,
    });
    setDraft((d) =>
      d.some((x) => x.exercise_id === altId)
        ? d
        : [
            ...d,
            {
              exercise_id: altId,
              equipment_status: 'available',
              sets: [
                { reps: 10, weight_kg: rec?.weight_kg ?? 0 },
                { reps: 10, weight_kg: rec?.weight_kg ?? 0 },
                { reps: 10, weight_kg: rec?.weight_kg ?? 0 },
              ],
            },
          ],
    );
    flash(`${t('alt_use')}: ${nameOf(alt)}`);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  };

  const nextSuggestion = (id: string) =>
    setPostponed((pp) => pp.map((x) => (x.exercise_id === id ? { ...x, attempts: x.attempts + 1 } : x)));

  const doPostponedNow = (id: string) => {
    const p0 = postponed.find((x) => x.exercise_id === id);
    const sets: SetLog[] =
      p0?.sets && p0.sets.length > 0
        ? p0.sets.map((s) => ({ ...s }))
        : [
            { reps: 10, weight_kg: 0 },
            { reps: 10, weight_kg: 0 },
            { reps: 10, weight_kg: 0 },
          ];
    setDraft((d) =>
      d.some((x) => x.exercise_id === id) ? d : [...d, { exercise_id: id, equipment_status: 'available', sets }],
    );
    setPostponed((pp) => pp.filter((x) => x.exercise_id !== id));
    flash(t('postponed_returned'));
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
    else if (pick.kind === 'height') setHeightStr(String(v));
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
      const heightVal = Number(heightStr.replace(',', '.'));
      const normalized = normalizeSession({
        id: session.id,
        date,
        type: isBenchmark ? 'benchmark' : 'training',
        exercises: draft,
        notes,
        duration_min: duration > 0 ? duration : null,
        body_weight_kg: bodyWeight > 0 ? bodyWeight : null,
        height_cm: heightVal > 0 ? heightVal : null,
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
      setHeightStr('');
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

  // Resumen compacto de los campos secundarios, visible aunque estén plegados.
  const detailsSummary = [
    fmtDay(date, lang),
    duration > 0 ? `${duration} ${t('picker_minutes')}` : null,
    weightStr ? `${fmtNum(Number(weightStr))} kg` : null,
    heightStr ? `${fmtNum(Number(heightStr))} cm` : null,
  ]
    .filter(Boolean)
    .join(' · ');

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

        {/* "Detalles": los campos secundarios (fecha, duración, peso, altura,
            notas) van plegados por defecto — la pantalla solo muestra lo
            importante para entrenar. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('sess_details')}
          accessibilityState={{ expanded: detailsOpen }}
          onPress={() => setDetailsOpen((o) => !o)}
          style={({ pressed }) => [
            styles.detailsToggle,
            {
              backgroundColor: p.card,
              borderColor: detailsOpen ? p.accent : p.cardBorder,
              opacity: pressed ? 0.85 : 1,
              transition: 'opacity 90ms ease',
            },
          ]}
        >
          <Text style={[styles.detailsSummary, { color: p.secondary }]} numberOfLines={1}>
            {detailsSummary}
          </Text>
          <View style={styles.detailsLabelWrap}>
            <Text style={[styles.detailsLabel, { color: detailsOpen ? p.accent : p.dim }]}>
              {t('sess_details')}
            </Text>
            {/* Chevron dibujado (el glifo ▾/▴ no está en la cobertura de
                fuentes de todos los dispositivos). */}
            <View style={styles.detailsArrowWrap}>
              <View
                style={[
                  styles.detailsArrowBar,
                  {
                    backgroundColor: detailsOpen ? p.accent : p.dim,
                    transform: [{ rotate: detailsOpen ? '-42deg' : '42deg' }],
                  },
                ]}
              />
              <View
                style={[
                  styles.detailsArrowBar,
                  {
                    backgroundColor: detailsOpen ? p.accent : p.dim,
                    transform: [{ rotate: detailsOpen ? '42deg' : '-42deg' }],
                  },
                ]}
              />
            </View>
          </View>
        </Pressable>

        {detailsOpen ? (
          <View style={styles.detailsBody}>
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
                  <Text style={[styles.dateUnit, { color: p.secondary }]}>fecha</Text>
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
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: p.secondary }]}>{t('sess_height')}</Text>
                <ValueBox
                  value={heightStr ? fmtNum(Number(heightStr)) : '—'}
                  unit="cm"
                  onPress={() => setPick({ kind: 'height' })}
                  accent={heightStr !== ''}
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
            <Text style={[styles.fieldLabel, { color: p.secondary }]}>{t('sess_notes')}</Text>
            <TextInput
              testID="active-notes"
              style={[styles.notes, { backgroundColor: p.fieldBg, borderColor: p.border, color: p.text }]}
              placeholder={t('sess_notes_ph')}
              placeholderTextColor={p.dim}
              value={notes}
              onChangeText={setNotes}
              multiline
              accessibilityLabel={t('sess_notes')}
            />
          </View>
        ) : null}

        {/* ejercicio: sugerencia o búsqueda (sin scroll: todo a un toque) */}
        <View style={[styles.actionRow, { gap: 10 }]}>
          <Pressable
            accessibilityRole="button"
            onPress={openSearch}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                flex: 1,
                backgroundColor: p.card,
                borderColor: p.cardBorder,
                borderWidth: 1,
                opacity: pressed ? 0.8 : 1,
                transition: 'opacity 90ms ease',
              },
            ]}
          >
            <Text style={[styles.actionBtnText, { color: p.secondary, fontWeight: '600' }]}>{t('sess_add')}</Text>
          </Pressable>
        </View>

        {/* sugerencia (R-15): el ejercicio que sigue, con 1 toque */}
        {suggested ? (
          <View style={[styles.suggestCard, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card }]}>
            <View style={styles.suggestHead}>
              <ExerciseGlyph label={suggested.muscle_group} size={22} />
              <View style={styles.suggestTitleWrap}>
                <Text style={[styles.suggestName, { color: p.text }]} numberOfLines={1}>
                  {nameOf(suggested)}
                </Text>
                <Text style={[styles.suggestMeta, { color: p.dim }]}>
                  {t(`group_${suggested.muscle_group}`)} · {t(`equip_${suggested.equipment}`)}
                </Text>
              </View>
            </View>
            <Text style={[styles.suggestHint, { color: p.secondary }]}>{t('suggest_hint')}</Text>
            <View style={styles.suggestBtns}>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  addExercise(suggested.id);
                  setSuggestedId(null);
                }}
                style={({ pressed }) => [
                  styles.suggestUse,
                  { backgroundColor: p.accent, opacity: pressed ? 0.85 : 1, transition: 'opacity 90ms ease' },
                ]}
              >
                <Text style={[styles.suggestUseText, { color: '#fff', fontWeight: '700' }]}>{t('suggest_use')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={requestSuggestion}
                style={({ pressed }) => [
                  styles.suggestSkip,
                  { backgroundColor: p.fieldBg, opacity: pressed ? 0.7 : 1, transition: 'opacity 90ms ease' },
                ]}
              >
                <Text style={[styles.suggestSkipText, { color: p.secondary, fontWeight: '600' }]}>{t('suggest_another')}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => (currentId ? sameGroupSuggest() : requestSuggestion())}
            style={({ pressed }) => [
              styles.suggestGhost,
              {
                backgroundColor: 'transparent',
                borderColor: p.border,
                opacity: pressed ? 0.7 : 1,
                transition: 'opacity 90ms ease',
              },
            ]}
          >
            <Text style={[styles.suggestGhostText, { color: p.accent, fontWeight: '700' }]}>
              {t('sess_suggest')}
            </Text>
          </Pressable>
        )}

        <Text style={[styles.saveTitle, { color: p.text }]}>{t('hist_exercises')}</Text>
        {draft.length === 0 ? (
          <Text style={[styles.empty, { color: p.dim }]}>{t('sess_no_exercises')}</Text>
        ) : (
          draft.map((d, di) => {
            const ex = byId.get(d.exercise_id);
            const est1rm = Math.round(Math.max(...d.sets.map((s) => oneRm(s.weight_kg, s.reps)), 0));
            const isCurrent = di === currentIndex;
            const isLast = di === draft.length - 1;
            return (
              <View
                key={d.exercise_id}
                style={[
                  styles.draftCard,
                  {
                    backgroundColor: p.card,
                    borderColor: isCurrent ? p.accent : p.cardBorder,
                    borderWidth: isCurrent ? 2 : 1,
                    opacity: isCurrent ? 1 : 0.58,
                    ...SHADOW.card,
                  },
                ]}
                onLayout={(e) => {
                  cardOffsets.current[d.exercise_id] = e.nativeEvent.layout.y;
                }}
              >
                {/* Foco: solo el ejercicio ACTUAL marca con la franja superior. */}
                {isCurrent ? (
                  <View
                    style={[
                      styles.focusStrip,
                      { borderColor: p.accent, borderLeftColor: p.accent },
                    ]}
                  >
                    <View style={styles.nowWrap}>
                      <View style={[styles.nowDot, { backgroundColor: p.accent }]} />
                      <Text style={[styles.nowText, { color: p.accent }]}>{t('sess_now')}</Text>
                      <Text style={[styles.posText, { color: p.secondary }]}>
                        {t('sess_pos', { n: di + 1, m: draft.length })}
                      </Text>
                    </View>
                  </View>
                ) : null}
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

                {/* estado del material: solo en el ejercicio ACTUAL (donde
                    de verdad se entrena) — en el resto es ruido. */}
                {isCurrent ? (
                  <View style={styles.statusRow}>
                    {statusChip(d.exercise_id, 'available', t('status_available'))}
                    {statusChip(d.exercise_id, 'busy', t('status_busy'))}
                    {statusChip(d.exercise_id, 'unavailable', t('status_unavailable'))}
                  </View>
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
                        done={!!s.done}
                      />
                    </View>
                    <View style={styles.setFieldWrap}>
                      <Text style={[styles.setCaption, { color: p.secondary }]}>{t('sess_weight')}</Text>
                      <ValueBox
                        value={fmtNum(s.weight_kg)}
                        unit="kg"
                        onPress={() => setPick({ kind: 'weight', ex: d.exercise_id, idx: i })}
                        done={!!s.done}
                      />
                    </View>
                    <View style={styles.setDoneWrap}>
                      <Text style={[styles.setCaption, { color: p.secondary }]}>{t('sess_set_done')}</Text>
                      <Pressable
                        style={({ pressed }) => [
                          styles.doneCircle,
                          {
                            borderColor: s.done ? p.green : p.border,
                            backgroundColor: s.done ? p.green : 'transparent',
                            transform: [{ scale: pressed ? 0.9 : 1 }],
                            transition: 'transform 80ms ease, background-color 120ms ease, border-color 120ms ease',
                          },
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={
                          s.done ? `${t('sess_set_done')}: ${i + 1} (${t('set_done')})` : `${t('sess_set_done')}: ${i + 1} (${t('set_pending')})`
                        }
                        accessibilityState={{ selected: !!s.done }}
                        onPress={() => toggleSetDone(d.exercise_id, i)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        {s.done ? <CheckGlyph size={18} color="#fff" /> : null}
                      </Pressable>
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
                {/* El "Acabar ejercicio" vive en la barra fija inferior (siempre
                    visible, sin scroll). Aquí solo "Ir allí" en los demás. */}
                {isCurrent ? null : (
                  <Pressable
                    style={({ pressed }) => [styles.goBtn, { opacity: pressed ? 0.7 : 1, borderColor: p.border }]}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('sess_go_to')}: ${ex ? nameOf(ex) : d.exercise_id}`}
                    onPress={() => jumpToExercise(d.exercise_id)}
                  >
                    <Text style={[styles.goBtnText, { color: p.secondary }]}>{t('sess_go_to')}</Text>
                  </Pressable>
                )}
              </View>
            );
          })
        )}

        {/* ---- ejercicios aplazados (el usuario decide el ritmo) ---- */}
        {postponed.length > 0 ? (
          <View style={[styles.postponedCard, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card }]}>
            <Text style={[styles.postponedTitle, { color: p.text }]}>{t('postponed_title')}</Text>
            <Text style={[styles.postponedSub, { color: p.secondary }]}>{t('postponed_sub')}</Text>
            {postponed.map((pp) => {
              const ex = byId.get(pp.exercise_id);
              // Sugerencias (la misma lista estaciona el ciclo: el botón
              // "Otra sugerencia" avanza dentro de ella, sin temporizador).
              const alts = ex
                ? suggestAlternatives(ex, exercises, {
                    mode: session.equipment_mode,
                    benchmarks: session.benchmarks,
                    intensity: 'moderate',
                    exclude: [
                      ...draft.map((d) => d.exercise_id),
                      ...postponed.filter((x) => x.exercise_id !== pp.exercise_id).map((x) => x.exercise_id),
                    ],
                    recent,
                  }).slice(0, 3)
                : [];
              const currentAlt = alts.length > 0 ? alts[pp.attempts % alts.length] : null;
              const showOriginal = pp.attempts >= POSTPONE_RETURN_AT;
              return (
                <View key={pp.exercise_id} style={[styles.postponedRow, { borderTopColor: p.cardBorder }]}>
                  <View style={styles.postponedInfo}>
                    <ExerciseGlyph label={ex?.muscle_group || 'legs'} size={18} />
                    <View style={styles.postponedNames}>
                      <Text style={[styles.postponedName, { color: p.text }]} numberOfLines={1}>
                        {ex ? nameOf(ex) : pp.exercise_id}
                      </Text>
                      <Text style={[styles.postponedWait, { color: p.dim }]} numberOfLines={1}>
                        {pp.attempts > 0 ? t('postponed_attempt', { n: pp.attempts }) : t('postponed_new')}
                      </Text>
                    </View>
                  </View>

                  {/* sugerencia actual (o el original cuando el ciclo vuelve) */}
                  {showOriginal ? (
                    <View style={[styles.postponedSug, { borderColor: p.accent, backgroundColor: p.section }]}>
                      <ExerciseGlyph label={ex?.muscle_group || 'legs'} size={18} />
                      <View style={styles.postponedNames}>
                        <Text style={[styles.postponedName, { color: p.accent }]} numberOfLines={1}>
                          {ex ? nameOf(ex) : pp.exercise_id}
                        </Text>
                        <Text style={[styles.postponedWait, { color: p.secondary }]}>{t('postponed_original')}</Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t('postponed_do_now')}
                        onPress={() => doPostponedNow(pp.exercise_id)}
                        style={({ pressed }) => [
                          styles.postponedBtn,
                          { backgroundColor: p.accent, borderWidth: 0, opacity: pressed ? 0.8 : 1, transition: 'opacity 90ms ease' },
                        ]}
                      >
                        <Text style={[styles.postponedBtnText, { color: '#fff' }]}>{t('postponed_do_now')}</Text>
                      </Pressable>
                    </View>
                  ) : currentAlt ? (
                    <View style={[styles.postponedSug, { borderColor: p.border, backgroundColor: p.section }]}>
                      <ExerciseGlyph label={currentAlt.muscle_group} size={18} />
                      <View style={styles.postponedNames}>
                        <Text style={[styles.postponedName, { color: p.text }]} numberOfLines={1}>
                          {nameOf(currentAlt)}
                        </Text>
                        <Text style={[styles.postponedWait, { color: p.dim }]} numberOfLines={1}>
                          {t(`equip_${currentAlt.equipment}`)}
                        </Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${t('alt_use')} ${nameOf(currentAlt)}`}
                        onPress={() => usePostponedAlt(pp.exercise_id, currentAlt.id)}
                        style={({ pressed }) => [
                          styles.postponedBtn,
                          { backgroundColor: p.accent, borderWidth: 0, opacity: pressed ? 0.8 : 1, transition: 'opacity 90ms ease' },
                        ]}
                      >
                        <Text style={[styles.postponedBtnText, { color: '#fff' }]}>{t('alt_use')}</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Text style={[styles.postponedWait, { color: p.dim, paddingVertical: 6 }]}>{t('alt_none')}</Text>
                  )}

                  <View style={styles.postponedBtns}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t('postponed_next')}
                      disabled={currentAlt === null && !showOriginal}
                      onPress={() => nextSuggestion(pp.exercise_id)}
                      style={({ pressed }) => [
                        styles.postponedBtn,
                        {
                          backgroundColor: 'transparent',
                          borderColor: p.border,
                          opacity: pressed ? 0.7 : 1,
                          transition: 'opacity 90ms ease',
                        },
                      ]}
                    >
                      <Text style={[styles.postponedBtnText, { color: p.secondary }]} numberOfLines={1}>
                        {t('postponed_next')}
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
                      <Text style={[styles.postponedBtnText, { color: p.red }]} numberOfLines={1}>
                        {t('postponed_skip')}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* (las notas viven ahora dentro de "Detalles") */}
        {error ? <Text style={[styles.error, { color: p.red }]}>{error}</Text> : null}
      </ScrollView>

      {/* ---- toast de confirmación ---- */}
      {toast ? (
        <View style={styles.toast} pointerEvents="none">
          <View style={[styles.toastDot, { backgroundColor: '#30D158' }]} />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      {/* Hoja de valores (peso / reps / duración / peso corporal / altura / 1RM). */}
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
                  : pick.kind === 'height'
                    ? t('sess_height')
                    : pick.kind === 'bench'
                      ? t('bench_1rm')
                      : t('sess_bodyweight')
          }
          unit={pick.kind === 'reps' ? 'reps' : pick.kind === 'height' ? 'cm' : 'kg'}
          values={
            pick.kind === 'reps'
              ? [5, 8, 10, 12, 15, 20, 25, 30]
              : pick.kind === 'weight'
                ? [0, 2.5, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 90, 100]
                : pick.kind === 'duration'
                  ? [15, 20, 30, 40, 45, 50, 60, 75, 90]
                  : pick.kind === 'height'
                    ? [150, 155, 160, 165, 170, 175, 180, 185, 190]
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
                  : pick.kind === 'height'
                    ? Number(heightStr) || 0
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
                  : pick.kind === 'height'
                    ? { min: 100, max: 230, step: 1 }
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

      {/* R-16: búsqueda de ejercicios bajo demanda (hoja inferior). */}
      {searchOpen ? (
        <Modal visible transparent animationType="slide" onRequestClose={() => setSearchOpen(false)}>
          <Pressable style={styles.searchBack} onPress={() => setSearchOpen(false)} accessibilityLabel={t('sess_search_ph')} />
          <View style={[styles.searchSheet, { backgroundColor: p.card }]}>
            <View style={styles.searchHandle} />
            <View style={styles.searchHeader}>
              <Text style={[styles.searchTitle, { color: p.text }]}>{t('sess_add')}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('delete')}
                onPress={() => setSearchOpen(false)}
                style={({ pressed }) => [styles.searchClose, { backgroundColor: p.fieldBg, opacity: pressed ? 0.7 : 1, transition: 'opacity 90ms ease' }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <XGlyph size={16} color={p.secondary} />
              </Pressable>
            </View>
            <TextInput
              style={[styles.searchInput, { backgroundColor: p.fieldBg, borderColor: p.border, color: p.text }]}
              placeholder={t('sess_search_ph')}
              placeholderTextColor={p.dim}
              value={q}
              onChangeText={setQ}
              autoCorrect={false}
              accessibilityLabel={t('sess_search_ph')}
            />
            <ScrollView style={styles.searchResults} showsVerticalScrollIndicator={false}>
              {results.map((e) => (
                <Pressable
                  key={e.id}
                  style={({ pressed }) => [
                    styles.resultRow,
                    {
                      backgroundColor: p.section,
                      borderColor: p.cardBorder,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                      transition: 'transform 90ms ease',
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={nameOf(e)}
                  onPress={() => {
                    addExercise(e.id);
                    setSearchOpen(false);
                  }}
                >
                  <Image source={e.imageAsset} style={styles.resultThumb} resizeMode="cover" />
                  <Text style={[styles.resultName, { color: p.text }]} numberOfLines={1}>
                    {nameOf(e)}
                  </Text>
                  <Text style={[styles.resultAdd, { color: p.accent }]}>+ {t('sess_add_exercise')}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Modal>
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

      {/* Barra fija: arriba, la leyenda de la acción del momento
          ("Siguiente: X" / "Último ejercicio"); abajo, los botones.
          Siempre visible, sin scroll. */}
      <View style={[styles.footer, { backgroundColor: p.headerBg, borderTopColor: p.border }]}>
        <Text
          style={[styles.footerCaption, { color: saved ? p.green : p.secondary }]}
          numberOfLines={saved ? 2 : 1}
        >
          {saved
            ? `${t('sess_saved')} — ${t('sess_saved_hint')}`
            : currentId
              ? isLastExercise
                ? t('sess_last_hint')
                : `${t('sess_next_prefix')} ${nameOf(nextInPlan ?? undefined)}`
              : `${plural(draft.length, t, 'hist_exercise', 'hist_exercises')} · ${plural(totalSets, t, 'hist_set', 'hist_sets_total')}`}
        </Text>
        <View style={styles.footerBtns}>
          {currentId ? (
            <Pressable
              style={({ pressed }) => [
                styles.finishBtn,
                { backgroundColor: p.accent, opacity: pressed ? 0.85 : 1, transition: 'opacity 90ms ease' },
              ]}
              accessibilityRole="button"
              accessibilityLabel={isLastExercise ? t('sess_done_all') : t('sess_finish')}
              onPress={finishExercise}
            >
              <Text style={[styles.finishBtnText, { color: '#fff' }]}>{t('sess_finish')}</Text>
            </Pressable>
          ) : null}
          <Pressable
            style={({ pressed }) => [
              { flex: 1, opacity: draft.length === 0 || saving ? 0.4 : pressed ? 0.85 : 1, transition: 'opacity 90ms ease' },
            ]}
            accessibilityRole="button"
            disabled={draft.length === 0 || saving}
            onPress={save}
          >
            <Gradient colors={GRADIENT.cta} style={styles.saveBtnBox} contentStyle={styles.saveBtn}>
              <Text style={styles.saveBtnText}>{saving ? t('saving') : isBenchmark ? t('bench_save') : t('sess_save')}</Text>
            </Gradient>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // El fondo es el degradado premium (lo pinta App); aquí transparente.
    backgroundColor: 'transparent',
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
    // El fondo es el degradado premium (lo pinta App); aquí transparente.
    backgroundColor: 'transparent',
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
  // "Detalles": barra plegable con los campos secundarios.
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderRadius: RADII.field,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  detailsSummary: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  detailsLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailsLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsArrowWrap: {
    width: 12,
    height: 7,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  detailsArrowBar: {
    width: 8,
    height: 2.4,
    borderRadius: 1.2,
  },
  detailsBody: {
    gap: 0,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  // La caja de fecha usa las mismas métricas que un ValueBox (reps/kg) para
  // que las cajas de "Detalles" queden todas del mismo tamaño.
  dateBox: {
    width: '100%', // misma fila que la caja de duración → mismos anchos
    borderRadius: RADII.field,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dateText: {
    fontSize: 19,
    fontWeight: '700',
  },
  dateUnit: {
    fontSize: 12,
    marginTop: 2,
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
  // R-15: fila de acción + sugerencia
  actionRow: {
    marginTop: 12,
  },
  actionBtn: {
    height: 52,
    borderRadius: RADII.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 16,
    letterSpacing: -0.2,
  },
  suggestCard: {
    marginTop: 10,
    borderRadius: RADII.card,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  suggestHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  suggestTitleWrap: {
    flex: 1,
    gap: 1,
  },
  suggestName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  suggestMeta: {
    fontSize: 12,
  },
  suggestHint: {
    fontSize: 13,
  },
  suggestBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  suggestUse: {
    flex: 1,
    height: 46,
    borderRadius: RADII.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestUseText: {
    fontSize: 15,
  },
  suggestSkip: {
    width: 88,
    height: 46,
    borderRadius: RADII.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  suggestSkipText: {
    fontSize: 15,
  },
  suggestGhost: {
    marginTop: 10,
    height: 52,
    borderRadius: RADII.field,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestGhostText: {
    fontSize: 15,
    letterSpacing: -0.2,
  },
  // R-16: hoja de búsqueda
  searchBack: {
    flex: 1,
    backgroundColor: 'rgba(10,15,30,0.45)',
    justifyContent: 'flex-end',
  },
  searchSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  searchHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  searchClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    borderRadius: RADII.field,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  searchResults: {
    gap: 8,
    maxHeight: 400,
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
    justifyContent: 'center',
  },
  statusChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: '100%', // la fila 1RM tiene dos columnas → cajas del mismo ancho
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
    gap: 8,
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
  setDoneWrap: {
    width: 44,
    alignItems: 'center',
  },
  doneCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueBox: {
    width: '100%', // el box llena su columna (flex:1) → mismo ancho que su vecino
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
  // ---- Foco en el ejercicio actual ----
  focusStrip: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  nowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nowDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  nowText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  posText: {
    fontSize: 12,
    fontWeight: '600',
  },
  nextLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  nextName: {
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
  finishBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  finishBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
  goBtn: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  goBtnText: {
    fontSize: 13,
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
    flexDirection: 'column',
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  postponedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  postponedNames: {
    flex: 1,
    gap: 1,
  },
  postponedName: {
    fontSize: 14,
    fontWeight: '600',
  },
  postponedWait: {
    fontSize: 11,
    fontWeight: '600',
  },
  postponedSug: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: RADII.field,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  postponedBtns: {
    flexDirection: 'row',
    gap: 8,
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
    flexDirection: 'column',
    gap: 8,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  footerCaption: {
    fontSize: 13,
    fontWeight: '600',
  },
  footerBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  savedText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtnBox: {
    flex: 1,
    borderRadius: RADII.tile,
  },
  saveBtn: {
    paddingVertical: 14,
    paddingHorizontal: 26,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
