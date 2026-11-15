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
import { exName } from '../lib/names';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '../data';
import type { Session, SetLog } from '../store';
import { searchExercises, normalizeSession, uid, todayISO, oneRm, latestWeight, type CardioIntensity } from '../lib/gym';
import { cardioKcal } from '../lib/energy';
import { store } from '../store';
import { GROUP_COLORS, RADII } from '../theme';
import { useTheme } from '../theme-context';
import { useScale, fs } from '../scale';
import { XGlyph, CheckGlyph } from '../components/TabIcon';
import { Chevron } from '../components/Chevron';
import { ExerciseHowTo } from '../components/ExerciseHowTo';
import { tapLight, success } from '../lib/haptics';
import { PickerSheet, fmtNum } from '../components/PickerSheet';
import { Gradient } from '../components/Gradient';
import { plural } from '../lib/plural';
import { GroupGlyph } from '../components/GroupGlyph';
import {
  suggestAlternatives,
  suggestNextExercise,
  weightForExercise,
  recentRows,
  type EquipmentStatus,
  type RecentRow,
} from '../lib/workout';
import type { ActiveSession, ActiveDraftExercise, PostponedExercise } from '../lib/session';

/** '2026-11-08' -> 'Nov 8' (EN) · '8 nov' (ES/FR/NL). Local, sin Intl. */
const M_SHORT: Record<string, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  nl: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
};
export function fmtDay(iso: string, lang: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const l = (lang || 'en').slice(0, 2);
  const arr = M_SHORT[l] || M_SHORT.en;
  return l === 'en' ? `${arr[m - 1]} ${d}` : `${d} ${arr[m - 1]}`;
}

/** Día de la semana corto (índice getUTCDay: 0 = domingo). */
const WD_SHORT: Record<string, string[]> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  es: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  fr: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  nl: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
};
/** '2026-11-15' -> 'sáb 15 nov' (año solo si no es el actual). */
export function fmtDate(iso: string, lang: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const l = (lang || 'en').slice(0, 2);
  const wd = (WD_SHORT[l] || WD_SHORT.en)[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const year = y !== new Date().getFullYear() ? ` ${y}` : '';
  return `${wd} ${fmtDay(iso, l)}${year}`;
}

/** Icono de línea por grupo muscular (ver components/GroupGlyph.tsx).
 *  Se usa en tarjetas de entreno, historial, biblioteca y empty states. */
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
  return <GroupGlyph group={label} size={size} color={c} />;
}

/** Casilla de valor grande (reps, peso, duración…): se toca y elige desde
 *  una hoja con valores — sin teclado, a un toque. */
function ValueBox({
  value,
  unit,
  onPress,
  accent,
  done,
  compact,
}: {
  value: string;
  unit: string;
  onPress: () => void;
  /** Resaltado "activo" (por ejemplo, un campo ya rellenado). */
  accent?: boolean;
  /** Serie COMPLETADA: se marca en verde (estado de éxito). */
  done?: boolean;
  /** Fila de series: solo el número (la unidad va en la cabecera de columna). */
  compact?: boolean;
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
        compact && styles.valueBoxCompact,
        {
          backgroundColor: active ? activeColor : p.fieldBg,
          borderColor: active ? activeColor : p.border,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      <Text style={[styles.valueBoxNum, { fontSize: fs(scale, compact ? 20 : 19), color: active ? p.onAccent : p.text }]}>
        {value}
      </Text>
      {compact ? null : (
        <Text style={[styles.valueBoxUnit, { fontSize: fs(scale, 12), color: active ? p.onAccent : p.secondary }]}>
          {unit}
        </Text>
      )}
    </Pressable>
  );
}

/** Pausa / reanudar dibujados con Views: los glifos ❚❚ ▶ ✕ salían como
 *  "tofu" (□) porque Montserrat no los incluye. */
function PauseGlyph({ color = '#fff' }: { color?: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }} accessibilityElementsHidden>
      <View style={{ width: 4, height: 14, borderRadius: 1.5, backgroundColor: color }} />
      <View style={{ width: 4, height: 14, borderRadius: 1.5, backgroundColor: color }} />
    </View>
  );
}
function PlayGlyph({ color = '#fff' }: { color?: string }) {
  return (
    <View
      accessibilityElementsHidden
      style={{
        width: 0,
        height: 0,
        marginLeft: 3,
        borderTopWidth: 8,
        borderBottomWidth: 8,
        borderLeftWidth: 13,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: color,
      }}
    />
  );
}


/** Acceso rápido: círculo con icono de línea blanco + rótulo corto debajo. */
function QuickAction({
  label,
  onPress,
  active = false,
  children,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  const { p } = useTheme();
  return (
    <View style={styles.quickItem}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: active }}
        onPress={onPress}
        style={({ pressed }) => [
          styles.quickCircle,
          {
            backgroundColor: p.card,
            borderColor: active ? p.text : p.border,
            transform: [{ scale: pressed ? 0.94 : 1 }],
          },
        ]}
      >
        {children}
      </Pressable>
      <Text style={[styles.quickLabel, { color: p.secondary }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** Iconos de línea blancos dibujados con Views (sin glifos de fuente). */
function PlusGlyph({ color = '#fff' }: { color?: string }) {
  return (
    <View style={{ width: 20, height: 20 }} accessibilityElementsHidden>
      <View style={{ position: 'absolute', left: 0, top: 9, width: 20, height: 2, borderRadius: 1, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: 9, top: 0, width: 2, height: 20, borderRadius: 1, backgroundColor: color }} />
    </View>
  );
}
function WandGlyph({ color = '#fff' }: { color?: string }) {
  return (
    <View style={{ width: 22, height: 22 }} accessibilityElementsHidden>
      <View style={{ position: 'absolute', left: 1, top: 10, width: 17, height: 2, borderRadius: 1, backgroundColor: color, transform: [{ rotate: '-45deg' }] }} />
      <View style={{ position: 'absolute', right: 1, top: 1, width: 6, height: 6, borderWidth: 1.5, borderColor: color, transform: [{ rotate: '45deg' }] }} />
      <View style={{ position: 'absolute', left: 3, top: 2, width: 3, height: 3, borderRadius: 1.5, backgroundColor: color }} />
    </View>
  );
}
function SlidersGlyph({ color = '#fff', bg = '#000' }: { color?: string; bg?: string }) {
  return (
    <View style={{ width: 22, height: 18 }} accessibilityElementsHidden>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 4, height: 2, borderRadius: 1, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: 0, right: 0, top: 12, height: 2, borderRadius: 1, backgroundColor: color }} />
      <View style={{ position: 'absolute', left: 4, top: 1, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: color, backgroundColor: bg }} />
      <View style={{ position: 'absolute', right: 3, top: 9, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: color, backgroundColor: bg }} />
    </View>
  );
}

/** Escala 1–5 con extremos rotulados (valoración opcional al terminar). */
function RatingRow({
  label,
  low,
  high,
  value,
  onChange,
}: {
  label: string;
  low: string;
  high: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  const { p } = useTheme();
  return (
    <View style={styles.ratingBlock}>
      <Text style={[styles.ratingLabel, { color: p.text }]}>{label}</Text>
      <View style={styles.ratingRow} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {[1, 2, 3, 4, 5].map((n) => {
          const on = value === n;
          return (
            <Pressable
              key={n}
              accessibilityRole="radio"
              accessibilityLabel={`${label}: ${n}/5`}
              accessibilityState={{ checked: on }}
              onPress={() => onChange(on ? null : n)}
              style={({ pressed }) => [
                styles.ratingDot,
                {
                  backgroundColor: on ? p.accent : p.fieldBg,
                  borderColor: on ? p.accent : p.border,
                  transform: [{ scale: pressed ? 0.92 : 1 }],
                },
              ]}
            >
              <Text style={[styles.ratingNum, { color: on ? p.onAccent : p.text }]}>{n}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.ratingEnds}>
        <Text style={[styles.ratingEnd, { color: p.secondary }]}>{low}</Text>
        <Text style={[styles.ratingEnd, { color: p.secondary }]}>{high}</Text>
      </View>
    </View>
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
    | { kind: 'cmin'; ex: string; idx: number }
    | { kind: 'ckm'; ex: string; idx: number }
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
  // "¿Máquina ocupada?": las opciones Ocupado / Fuera de servicio solo se
  // despliegan cuando hacen falta (antes: 3 chips fijos en cada ejercicio).
  const [equipOpen, setEquipOpen] = useState(false);
  // Hoja "¿Cómo se hace?" del ejercicio actual (id) o null.
  const [howToId, setHowToId] = useState<string | null>(null);
  // Descanso entre series: instante de fin + duración total (para la barra).
  // Se guarda en la sesión activa: sobrevive a cambiar de pestaña.
  const [restUntil, setRestUntil] = useState<number | null>(session.rest_until ?? null);
  const [restTotal, setRestTotal] = useState<number>(session.rest_total ?? 90);
  useEffect(() => setEquipOpen(false), [currentIndex]);

  const byId = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const isCardio = (id: string) => byId.get(id)?.muscle_group === 'cardio';
  /** Serie por defecto de cardio: lo último que hizo en ese ejercicio, o 20 min moderados. */
  const cardioSet = (id: string): SetLog => {
    const last = sessions
      .find((s) => s.exercises.some((e) => e.exercise_id === id))
      ?.exercises.find((e) => e.exercise_id === id)?.sets?.[0];
    return {
      reps: 0,
      weight_kg: 0,
      duration_min: last?.duration_min || 20,
      ...(last?.distance_km ? { distance_km: last.distance_km } : {}),
      intensity: last?.intensity || 'moderate',
    };
  };

  // Valoración opcional al terminar (energía y sensación, 1–5).
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [energy, setEnergy] = useState<number | null>(null);
  const [feeling, setFeeling] = useState<number | null>(null);
  const bodyKg = Number(weightStr.replace(',', '.')) || latestWeight(sessions) || 0;
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
    exName(e, lang);

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
      rest_until: restUntil ?? undefined,
      rest_total: restTotal,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, duration, weightStr, heightStr, notes, draft, postponed, restUntil, restTotal]);

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
  // Reloj grande del banner: m:ss (o h:mm:ss a partir de una hora).
  const pad2 = (n: number) => String(n).padStart(2, '0');
  const clockLabel =
    elapsedSec >= 3600
      ? `${Math.floor(elapsedSec / 3600)}:${pad2(Math.floor((elapsedSec % 3600) / 60))}:${pad2(elapsedSec % 60)}`
      : `${Math.floor(elapsedSec / 60)}:${pad2(elapsedSec % 60)}`;

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
    if (isCardio(id)) {
      setDraft((d) => [...d, { exercise_id: id, sets: [cardioSet(id)] }]);
      setQ('');
      setSaved(false);
      setCurrentIndex(draft.length);
      flash(t('sess_added'));
      setTimeout(() => focusScroll(id), 60);
      return;
    }
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
    // En el primer ejercicio no hace falta saltar: así se ve la foto y los accesos rápidos.
    if (currentIndex === 0) { focusedOnce.current = true; return; }
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
              // La nueva serie copia la anterior (fuerza o cardio), sin marcar.
              sets: [
                ...x.sets,
                x.sets.length > 0
                  ? { ...x.sets[x.sets.length - 1], done: false }
                  : isCardio(id)
                    ? cardioSet(id)
                    : { reps: 10, weight_kg: 0 },
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

  /** Cardio: cambia la intensidad de una serie (suave → moderada → fuerte). */
  const cycleIntensity = (id: string, idx: number) => {
    const order: CardioIntensity[] = ['easy', 'moderate', 'hard'];
    setDraft((d) =>
      d.map((x) =>
        x.exercise_id === id
          ? {
              ...x,
              sets: x.sets.map((s, i) =>
                i === idx ? { ...s, intensity: order[(order.indexOf(s.intensity || 'moderate') + 1) % 3] } : s,
              ),
            }
          : x,
      ),
    );
  };

  const setSet = (id: string, idx: number, field: 'reps' | 'weight_kg' | 'duration_min' | 'distance_km', v: number) => {
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
                        field === 'weight_kg' || field === 'distance_km'
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
    const d0 = draft.find((x) => x.exercise_id === id);
    const wasDone = !!d0?.sets[idx]?.done;
    setDraft((d) =>
      d.map((x) =>
        x.exercise_id === id
          ? { ...x, sets: x.sets.map((s, i) => (i === idx ? { ...s, done: !s.done } : s)) }
          : x,
      ),
    );
    // Al COMPLETAR una serie de fuerza empieza el descanso del plan
    // (rest_after) o 90 s por defecto. Desmarcar no lo inicia.
    if (!wasDone) tapLight(); // háptico al completar una serie
    if (!wasDone && d0 && !isCardio(id)) startRest(d0.rest_after || 90);
  };

  // ---- Temporizador de descanso (estado declarado arriba; se persiste) ----
  const startRest = (sec: number) => {
    setRestTotal(sec);
    setRestUntil(Date.now() + sec * 1000);
  };
  const addRest = (sec: number) => {
    setRestTotal((tt) => tt + sec);
    setRestUntil((u) => (u ?? Date.now()) + sec * 1000);
  };
  const restLeft = restUntil ? Math.max(0, Math.ceil((restUntil - now) / 1000)) : 0;
  useEffect(() => {
    if (restUntil && now >= restUntil) {
      setRestUntil(null);
      success(); // háptico al terminar el descanso
      flash(t('rest_done'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, restUntil]);

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
              sets: isCardio(altId)
                ? [cardioSet(altId)]
                : [
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
    else if (pick.kind === 'cmin') setSet(pick.ex, pick.idx, 'duration_min', v);
    else if (pick.kind === 'ckm') setSet(pick.ex, pick.idx, 'distance_km', v);
    else if (pick.kind === 'duration') setDuration(Math.round(v));
    else if (pick.kind === 'body') setWeightStr(String(v));
    else if (pick.kind === 'height') setHeightStr(String(v));
    else if (pick.kind === 'bench') setBenchValue(pick.ex, v);
    setPick(null);
  };

  // ---- guardar ----
  /** "Terminar" abre primero la valoración opcional; guardar no depende de ella. */
  const finish = () => {
    if (saving || draft.length === 0) return;
    setCheckinOpen(true);
  };

  const save = async (rating?: { energy: number | null; feeling: number | null }) => {
    if (saving) return;
    setCheckinOpen(false);
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
        energy: rating?.energy ?? null,
        feeling: rating?.feeling ?? null,
      }) as Session;
      await store.addSession(normalized);
      success();
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
        <Text style={[styles.statusChipText, { color: active ? p.onAccent : p.secondary }]}>{label}</Text>
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
      {/* ---- Cabecera del entreno (estilo X): cerrar · título + series ----
          Sin reloj ni batería (decisión del usuario): solo lo que importa.
          Debajo, una línea fina de progreso de series completadas. */}
      <View style={styles.activeBanner}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('sess_discard')}
          onPress={() => setConfirmDiscard(true)}
          style={({ pressed }) => [styles.pauseBtn, { opacity: pressed ? 0.7 : 1, borderColor: p.border, backgroundColor: p.card }]}
        >
          <XGlyph size={14} color={p.text} />
        </Pressable>
        <View
          style={styles.activeCenter}
          accessible
          accessibilityRole="header"
          accessibilityLabel={`${isBenchmark ? t('bench_title') : t('sess_title')}. ${doneSets}/${totalSets} ${t('workout_sets_done')}`}
        >
          <Text style={[styles.activeTitle, { color: p.text }]}>{isBenchmark ? t('bench_title') : t('sess_title')}</Text>
          <Text style={[styles.activeSets, { color: p.secondary }]} numberOfLines={1}>
            {doneSets}/{totalSets} {t('workout_sets_done')}
          </Text>
        </View>
        <View style={styles.bannerSpacer} />
      </View>
      <View style={[styles.progressLine, { backgroundColor: p.border }]} accessibilityElementsHidden importantForAccessibility="no">
        <View style={[styles.progressLineFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: p.text }]} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* ---- Accesos rápidos (la foto vive solo en Main: "auténtico o nada") ---- */}
        <View style={styles.quickRow}>
          <QuickAction label={t('sess_add')} onPress={openSearch}>
            <PlusGlyph color={p.text} />
          </QuickAction>
          {/* Con un ejercicio en curso, "Sugerir" vive en "Más opciones". */}
          {currentId ? null : (
            <QuickAction label={t('sess_suggest')} onPress={requestSuggestion}>
              <WandGlyph color={p.text} />
            </QuickAction>
          )}
          <QuickAction label={t('sess_details')} onPress={() => setDetailsOpen((o) => !o)} active={detailsOpen}>
            <SlidersGlyph color={p.text} bg={p.card} />
          </QuickAction>
        </View>
        {/* sugerencia (R-15): el ejercicio que sigue, con 1 toque */}
        {suggested ? (
          <View style={[styles.suggestCard, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card }]}>
            <View style={styles.suggestHead}>
              <ExerciseGlyph label={suggested.muscle_group} size={22} color={p.text} />
              <View style={styles.suggestTitleWrap}>
                <Text style={[styles.suggestName, { color: p.text }]} numberOfLines={1}>
                  {nameOf(suggested)}
                </Text>
                <Text style={[styles.suggestMeta, { color: p.dim }]}>
                  {t(`group_${suggested.muscle_group}`)}{suggested.equipment !== 'other' ? ` · ${t(`equip_${suggested.equipment}`)}` : ''}
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
                <Text style={[styles.suggestUseText, { color: p.onAccent, fontWeight: '700' }]}>{t('suggest_use')}</Text>
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
        ) : null}

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
                  <Text style={[styles.dateUnit, { color: p.secondary }]}>{t('field_date')}</Text>
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
                    <Text style={[styles.dateChipText, { color: d === date ? p.onAccent : p.text }]}>
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

        {draft.length === 0 ? (
          <Text style={[styles.empty, { color: p.dim }]}>{t('sess_no_exercises')}</Text>
        ) : (
          draft.map((d, di) => {
            const ex = byId.get(d.exercise_id);
            const est1rm = Math.round(Math.max(...d.sets.map((s) => oneRm(s.weight_kg, s.reps)), 0));
            const isCurrent = di === currentIndex;
            const doneCount = d.sets.filter((s) => s.done).length;
            const allDone = d.sets.length > 0 && doneCount === d.sets.length;

            // ---- Resto de ejercicios: UNA fila compacta (tocar = ir allí) ----
            if (!isCurrent) {
              const first = d.sets[0];
              const cardioMin = d.sets.reduce((a, s) => a + (s.duration_min || 0), 0);
              const cardioKm = d.sets.reduce((a, s) => a + (s.distance_km || 0), 0);
              const summary = !first
                ? plural(0, t, 'hist_set', 'hist_sets_total')
                : isCardio(d.exercise_id)
                  ? `${fmtNum(cardioMin)} min${cardioKm > 0 ? ` · ${fmtNum(cardioKm)} km` : ''}`
                  : `${d.sets.length} × ${first.reps} · ${fmtNum(first.weight_kg)} kg`;
              return (
                <Pressable
                  key={d.exercise_id}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('sess_go_to')}: ${ex ? nameOf(ex) : d.exercise_id}. ${summary}. ${doneCount}/${d.sets.length}`}
                  onPress={() => jumpToExercise(d.exercise_id)}
                  onLayout={(e) => {
                    cardOffsets.current[d.exercise_id] = e.nativeEvent.layout.y;
                  }}
                  style={({ pressed }) => [
                    styles.compactRow,
                    { backgroundColor: pressed ? p.card : 'transparent' },
                  ]}
                >
                  <ExerciseGlyph label={ex?.muscle_group || 'legs'} size={22} color={p.text} />
                  <View style={styles.compactMain}>
                    <Text style={[styles.compactName, { color: p.text }]} numberOfLines={1}>
                      {ex ? nameOf(ex) : d.exercise_id}
                    </Text>
                    <Text style={[styles.compactSub, { color: p.secondary }]} numberOfLines={1}>
                      {summary}
                    </Text>
                  </View>
                  {allDone ? (
                    <View style={[styles.compactDone, { backgroundColor: p.green }]}>
                      <CheckGlyph size={14} color={p.onAccent} />
                    </View>
                  ) : (
                    <Text style={[styles.compactCount, { color: p.secondary }]}>
                      {doneCount}/{d.sets.length}
                    </Text>
                  )}
                  <Chevron color={p.dim} />
                </Pressable>
              );
            }

            // ---- Ejercicio ACTUAL: la única tarjeta completa ----
            return (
              <View
                key={d.exercise_id}
                style={[styles.draftCard, { backgroundColor: p.card, borderColor: p.cardBorder }]}
                onLayout={(e) => {
                  cardOffsets.current[d.exercise_id] = e.nativeEvent.layout.y;
                }}
              >
                <View style={styles.draftHeader}>
                  <View style={styles.draftTitleWrap}>
                    <ExerciseGlyph label={ex?.muscle_group || 'legs'} size={22} color={p.text} />
                    <Text style={[styles.draftName, { color: p.text }]} numberOfLines={2} accessibilityRole="header">
                      {ex ? nameOf(ex) : d.exercise_id}
                    </Text>
                  </View>
                  <Text
                    style={[styles.draftPos, { color: p.secondary }]}
                    accessibilityLabel={t('sess_pos', { n: di + 1, m: draft.length })}
                  >
                    {di + 1}/{draft.length}
                  </Text>
                </View>
                {ex ? (
                  <Text style={[styles.draftMeta, { color: p.secondary }]} numberOfLines={1}>
                    {t(`group_${ex.muscle_group}`)}{ex.equipment !== 'other' ? ` · ${t(`equip_${ex.equipment}`)}` : ''}
                    {!isBenchmark && est1rm > 0 ? ` · 1RM ≈ ${est1rm} kg` : ''}
                    {isCardio(d.exercise_id) && bodyKg > 0
                      ? ` · ≈ ${d.sets.reduce((a, s) => a + cardioKcal(s.duration_min || 0, bodyKg, s.intensity), 0)} kcal`
                      : ''}
                  </Text>
                ) : null}

                {/* ¿Cómo se hace? → hoja con fotos, qué entrena y pasos. */}
                {ex ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${t('howto_button')}: ${nameOf(ex)}`}
                    onPress={() => setHowToId(ex.id)}
                    style={({ pressed }) => [styles.howBtn, { borderColor: p.border, opacity: pressed ? 0.7 : 1 }]}
                  >
                    <View style={[styles.howIcon, { borderColor: p.text }]}>
                      <Text style={[styles.howIconText, { color: p.text }]}>i</Text>
                    </View>
                    <Text style={[styles.howText, { color: p.text }]}>{t('howto_button')}</Text>
                  </Pressable>
                ) : null}

                {/* benchmark: 1RM */}
                {isBenchmark ? (
                  <View style={styles.benchRow}>
                    <View style={styles.benchCol}>
                      <Text style={[styles.setCaption, { color: p.secondary }]}>{t('bench_1rm_auto')}</Text>
                      <View style={[styles.benchBox, { backgroundColor: p.fieldBg, borderColor: p.border }]}>
                        <Text style={[styles.benchBoxNum, { color: p.text }]}>{est1rm > 0 ? `${est1rm} kg` : '—'}</Text>
                      </View>
                    </View>
                    <View style={styles.benchCol}>
                      <Text style={[styles.setCaption, { color: p.secondary }]}>{t('bench_1rm')}</Text>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setPick({ kind: 'bench', ex: d.exercise_id })}
                        style={({ pressed }) => [
                          styles.benchBox,
                          { backgroundColor: p.fieldBg, borderColor: p.border, transform: [{ scale: pressed ? 0.97 : 1 }] },
                        ]}
                      >
                        <Text style={[styles.benchBoxNum, { color: benchManual[d.exercise_id] ? p.accent : p.dim }]}>
                          {benchManual[d.exercise_id] ? `${benchManual[d.exercise_id]} kg` : t('bench_manual')}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : null}

                {isCardio(d.exercise_id) ? (
                  <>
                    {/* Cardio: minutos · km · intensidad · hecha. */}
                    <View style={styles.colHead} accessibilityElementsHidden importantForAccessibility="no">
                      <Text style={[styles.colHeadNum, { color: p.secondary }]}>{t('sess_set')}</Text>
                      <Text style={[styles.colHeadField, { color: p.secondary }]}>min</Text>
                      <Text style={[styles.colHeadField, { color: p.secondary }]}>km</Text>
                      <Text style={[styles.colHeadInt, { color: p.secondary }]} numberOfLines={1}>{t('cardio_intensity')}</Text>
                      <Text style={[styles.colHeadDone, { color: p.secondary }]}>{t('sess_set_done')}</Text>
                    </View>
                    {d.sets.map((s, i) => (
                      <View key={i} style={styles.setRow}>
                        <Text style={[styles.setNum, { color: s.done ? p.green : p.secondary }]}>{i + 1}</Text>
                        <View style={styles.setFieldWrap}>
                          <ValueBox
                            value={fmtNum(s.duration_min || 0)}
                            unit="min"
                            onPress={() => setPick({ kind: 'cmin', ex: d.exercise_id, idx: i })}
                            done={!!s.done}
                            compact
                          />
                        </View>
                        <View style={styles.setFieldWrap}>
                          <ValueBox
                            value={s.distance_km ? fmtNum(s.distance_km) : '—'}
                            unit="km"
                            onPress={() => setPick({ kind: 'ckm', ex: d.exercise_id, idx: i })}
                            done={!!s.done}
                            compact
                          />
                        </View>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`${t('cardio_intensity')}: ${t(`int_${s.intensity || 'moderate'}`)}`}
                          onPress={() => cycleIntensity(d.exercise_id, i)}
                          style={({ pressed }) => [
                            styles.intChip,
                            {
                              borderColor: s.intensity === 'hard' ? p.accent : p.border,
                              backgroundColor: s.intensity === 'hard' ? p.accent : p.fieldBg,
                              transform: [{ scale: pressed ? 0.95 : 1 }],
                            },
                          ]}
                        >
                          <Text
                            style={[styles.intChipText, { color: s.intensity === 'hard' ? p.onAccent : p.text }]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                          >
                            {t(`int_${s.intensity || 'moderate'}`)}
                          </Text>
                        </Pressable>
                        <View style={styles.setDoneWrap}>
                          <Pressable
                            style={({ pressed }) => [
                              styles.doneCircle,
                              {
                                borderColor: s.done ? p.green : p.border,
                                backgroundColor: s.done ? p.green : 'transparent',
                                transform: [{ scale: pressed ? 0.9 : 1 }],
                              },
                            ]}
                            accessibilityRole="checkbox"
                            accessibilityLabel={`${t('sess_set')} ${i + 1}: ${fmtNum(s.duration_min || 0)} min`}
                            accessibilityState={{ checked: !!s.done }}
                            onPress={() => toggleSetDone(d.exercise_id, i)}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          >
                            {s.done ? <CheckGlyph size={18} color={p.onAccent} /> : null}
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </>
                ) : (
                  <>
                {/* Cabecera de columnas UNA vez (no en cada serie). */}
                <View style={styles.colHead} accessibilityElementsHidden importantForAccessibility="no">
                  <Text style={[styles.colHeadNum, { color: p.secondary }]}>{t('sess_set')}</Text>
                  <Text style={[styles.colHeadField, { color: p.secondary }]}>reps</Text>
                  <Text style={[styles.colHeadField, { color: p.secondary }]}>kg</Text>
                  <Text style={[styles.colHeadDone, { color: p.secondary }]}>{t('sess_set_done')}</Text>
                </View>
                {d.sets.map((s, i) => (
                  <View key={i} style={styles.setRow}>
                    <Text style={[styles.setNum, { color: s.done ? p.green : p.secondary }]}>{i + 1}</Text>
                    <View style={styles.setFieldWrap}>
                      <ValueBox
                        value={String(s.reps)}
                        unit="reps"
                        onPress={() => setPick({ kind: 'reps', ex: d.exercise_id, idx: i })}
                        done={!!s.done}
                        compact
                      />
                    </View>
                    <View style={styles.setFieldWrap}>
                      <ValueBox
                        value={fmtNum(s.weight_kg)}
                        unit="kg"
                        onPress={() => setPick({ kind: 'weight', ex: d.exercise_id, idx: i })}
                        done={!!s.done}
                        compact
                      />
                    </View>
                    <View style={styles.setDoneWrap}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.doneCircle,
                          {
                            borderColor: s.done ? p.green : p.border,
                            backgroundColor: s.done ? p.green : 'transparent',
                            transform: [{ scale: pressed ? 0.9 : 1 }],
                          },
                        ]}
                        accessibilityRole="checkbox"
                        accessibilityLabel={`${t('sess_set')} ${i + 1}: ${s.reps} reps, ${fmtNum(s.weight_kg)} kg`}
                        accessibilityState={{ checked: !!s.done }}
                        onPress={() => toggleSetDone(d.exercise_id, i)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        {s.done ? <CheckGlyph size={18} color={p.onAccent} /> : null}
                      </Pressable>
                    </View>
                  </View>
                ))}
                  </>
                )}

                {/* Series: añadir / quitar la última (sin una X por fila). */}
                <View style={styles.setActions}>
                  <Pressable
                    style={({ pressed }) => [styles.textBtn, { opacity: pressed ? 0.6 : 1 }]}
                    accessibilityRole="button"
                    onPress={() => addSet(d.exercise_id)}
                  >
                    <Text style={[styles.textBtnLabel, { color: p.text }]}>+ {t('sess_add_set')}</Text>
                  </Pressable>
                  {d.sets.length > 1 ? (
                    <Pressable
                      style={({ pressed }) => [styles.textBtn, { opacity: pressed ? 0.6 : 1 }]}
                      accessibilityRole="button"
                      onPress={() => removeSet(d.exercise_id, d.sets.length - 1)}
                    >
                      <Text style={[styles.textBtnLabel, { color: p.secondary }]}>− {t('sess_remove_set')}</Text>
                    </Pressable>
                  ) : null}
                </View>

                {/* Acciones poco frecuentes: plegadas en "Más opciones" (una
                    sola tarea a la vista: series, descanso, siguiente). */}
                <View style={[styles.cardFoot, { borderTopColor: p.cardBorder, justifyContent: 'center' }]}>
                  <Pressable
                    style={({ pressed }) => [styles.textBtn, styles.moreBtn, { opacity: pressed ? 0.6 : 1 }]}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: equipOpen }}
                    onPress={() => setEquipOpen((o) => !o)}
                  >
                    <Text style={[styles.footLink, { color: p.secondary }]}>{t('sess_more')}</Text>
                    <Chevron dir={equipOpen ? 'up' : 'down'} color={p.secondary} size={7} />
                  </Pressable>
                </View>
                {equipOpen ? (
                  <View style={styles.moreList}>
                    <Pressable
                      style={({ pressed }) => [styles.moreRow, { borderBottomColor: p.cardBorder, opacity: pressed ? 0.6 : 1 }]}
                      accessibilityRole="button"
                      onPress={() => {
                        setEquipOpen(false);
                        sameGroupSuggest();
                      }}
                    >
                      <Text style={[styles.moreText, { color: p.text }]}>{t('sess_suggest')}</Text>
                    </Pressable>
                    <View style={[styles.moreRow, { borderBottomColor: p.cardBorder }]}>
                      <Text style={[styles.moreText, { color: p.text }]}>{t('sess_equip_q')}</Text>
                      <View style={[styles.statusRow, { marginTop: 8, justifyContent: 'flex-start' }]}>
                        {statusChip(d.exercise_id, 'busy', t('status_busy'))}
                        {statusChip(d.exercise_id, 'unavailable', t('status_unavailable'))}
                      </View>
                    </View>
                    <Pressable
                      style={({ pressed }) => [styles.moreRow, { borderBottomWidth: 0, opacity: pressed ? 0.6 : 1 }]}
                      accessibilityRole="button"
                      onPress={() => removeExercise(d.exercise_id)}
                    >
                      <Text style={[styles.moreText, { color: p.secondary }]}>{t('sess_remove_ex')}</Text>
                    </Pressable>
                  </View>
                ) : null}
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
                    <ExerciseGlyph label={ex?.muscle_group || 'legs'} size={18} color={p.text} />
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
                      <ExerciseGlyph label={ex?.muscle_group || 'legs'} size={18} color={p.text} />
                      <View style={styles.postponedNames}>
                        <Text style={[styles.postponedName, { color: p.text }]} numberOfLines={1}>
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
                        <Text style={[styles.postponedBtnText, { color: p.onAccent }]}>{t('postponed_do_now')}</Text>
                      </Pressable>
                    </View>
                  ) : currentAlt ? (
                    <View style={[styles.postponedSug, { borderColor: p.border, backgroundColor: p.section }]}>
                      <ExerciseGlyph label={currentAlt.muscle_group} size={18} color={p.text} />
                      <View style={styles.postponedNames}>
                        <Text style={[styles.postponedName, { color: p.text }]} numberOfLines={1}>
                          {nameOf(currentAlt)}
                        </Text>
                        <Text style={[styles.postponedWait, { color: p.dim }]} numberOfLines={1}>
                          {currentAlt.equipment !== 'other' ? t(`equip_${currentAlt.equipment}`) : t(`group_${currentAlt.muscle_group}`)}
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
                        <Text style={[styles.postponedBtnText, { color: p.onAccent }]}>{t('alt_use')}</Text>
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
          <View style={[styles.toastDot, { backgroundColor: p.accent }]} />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      {/* Hoja de valores (peso / reps / duración / peso corporal / altura / 1RM). */}
      {pick ? (
        <PickerSheet
          open
          title={
            pick.kind === 'cmin'
              ? t('picker_duration')
              : pick.kind === 'ckm'
                ? t('picker_distance')
                : pick.kind === 'reps'
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
          unit={pick.kind === 'cmin' ? 'min' : pick.kind === 'ckm' ? 'km' : pick.kind === 'reps' ? 'reps' : pick.kind === 'height' ? 'cm' : 'kg'}
          values={
            pick.kind === 'cmin'
              ? [5, 10, 15, 20, 25, 30, 40, 45, 60, 90]
              : pick.kind === 'ckm'
                ? [1, 2, 3, 4, 5, 6, 8, 10, 15, 20]
                : pick.kind === 'reps'
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
            pick.kind === 'cmin'
              ? draft.find((x) => x.exercise_id === pick!.ex)?.sets[pick!.idx]?.duration_min ?? 0
              : pick.kind === 'ckm'
                ? draft.find((x) => x.exercise_id === pick!.ex)?.sets[pick!.idx]?.distance_km ?? 0
                : pick.kind === 'reps'
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
            pick.kind === 'cmin'
              ? { min: 1, max: 300, step: 1 }
              : pick.kind === 'ckm'
                ? { min: 0, max: 100, step: 0.5 }
                : pick.kind === 'reps'
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
                  <Text style={[styles.resultAdd, { color: p.secondary }]}>+ {t('sess_add_exercise')}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Modal>
      ) : null}

      {/* Valoración opcional al terminar (Fase 12): rellenar o finalizar sin más. */}
      {checkinOpen ? (
        <Modal visible transparent animationType="slide" onRequestClose={() => setCheckinOpen(false)}>
          <Pressable style={styles.searchBack} onPress={() => setCheckinOpen(false)} accessibilityLabel={t('cancel')} />
          <View style={[styles.searchSheet, styles.checkinSheet, { backgroundColor: p.card }]}>
            <View style={styles.searchHandle} />
            <Text style={[styles.searchTitle, { color: p.text }]} accessibilityRole="header">{t('checkin_title')}</Text>
            <Text style={[styles.checkinSub, { color: p.secondary }]}>{t('checkin_sub')}</Text>
            <RatingRow
              label={t('checkin_energy')}
              low={t('checkin_low')}
              high={t('checkin_high')}
              value={energy}
              onChange={setEnergy}
            />
            <RatingRow
              label={t('checkin_feeling')}
              low={t('checkin_bad')}
              high={t('checkin_great')}
              value={feeling}
              onChange={setFeeling}
            />
            <Pressable
              style={({ pressed }) => [{ marginTop: 20, opacity: saving ? 0.4 : pressed ? 0.85 : 1 }]}
              accessibilityRole="button"
              disabled={saving}
              onPress={() => save({ energy, feeling })}
            >
              <Gradient colors={GRADIENT.cta} style={styles.saveBtnBox} contentStyle={styles.saveBtn}>
                <Text style={[styles.saveBtnText, { color: p.onAccent }]}>{isBenchmark ? t('bench_save') : t('sess_save')}</Text>
              </Gradient>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.textBtn, { marginTop: 6, opacity: pressed ? 0.6 : 1 }]}
              accessibilityRole="button"
              disabled={saving}
              onPress={() => save()}
            >
              <Text style={[styles.textBtnLabel, { color: p.secondary }]}>{t('checkin_skip')}</Text>
            </Pressable>
          </View>
        </Modal>
      ) : null}

      {howToId && byId.get(howToId) ? <ExerciseHowTo exercise={byId.get(howToId)!} onClose={() => setHowToId(null)} /> : null}

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
        {/* Descanso en curso: cuenta atrás grande + barra + "+15 s" / "Saltar". */}
        {restUntil && restLeft > 0 ? (
          <View style={styles.restBox} accessible accessibilityLiveRegion="polite" accessibilityLabel={`${t('rest_title')}: ${restLeft} s`}>
            <View style={styles.restTop}>
              <Text style={[styles.restLabel, { color: p.secondary }]}>{t('rest_title')}</Text>
              <Text style={[styles.restTime, { color: p.text }]}>
                {Math.floor(restLeft / 60)}:{String(restLeft % 60).padStart(2, '0')}
              </Text>
              <View style={styles.restBtns}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => addRest(15)}
                  style={({ pressed }) => [styles.restBtn, { borderColor: p.border, opacity: pressed ? 0.6 : 1 }]}
                >
                  <Text style={[styles.restBtnText, { color: p.text }]}>+15 s</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setRestUntil(null)}
                  style={({ pressed }) => [styles.restBtn, { borderColor: p.border, opacity: pressed ? 0.6 : 1 }]}
                >
                  <Text style={[styles.restBtnText, { color: p.text }]}>{t('rest_skip')}</Text>
                </Pressable>
              </View>
            </View>
            <View style={[styles.restTrack, { backgroundColor: p.fieldBg }]}>
              <Gradient
                colors={GRADIENT.cta}
                style={[styles.restFill, { width: `${Math.max(2, Math.round((restLeft / Math.max(1, restTotal)) * 100))}%` }]}
              />
            </View>
          </View>
        ) : null}
        {/* Leyenda solo cuando aporta: qué viene después, o el guardado. */}
        {!(restUntil && restLeft > 0) && (saved || (currentId && !isLastExercise)) ? (
          <Text
            style={[styles.footerCaption, { color: saved ? p.text : p.secondary }]}
            numberOfLines={saved ? 2 : 1}
          >
            {saved
              ? `${t('sess_saved')} — ${t('sess_saved_hint')}`
              : `${t('sess_next_prefix')} ${nameOf(nextInPlan ?? undefined)}`}
          </Text>
        ) : null}
        <View style={styles.footerBtns}>
          {currentId && !isLastExercise ? (
            <>
              {/* Mitad del entreno: "Siguiente ejercicio" es LA acción;
                  "Terminar" (guardar ya) queda como secundaria discreta. */}
              <Pressable
                style={({ pressed }) => [
                  styles.endBtn,
                  { borderColor: p.border, opacity: saving ? 0.4 : pressed ? 0.7 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={isBenchmark ? t('bench_save') : t('sess_save')}
                disabled={saving}
                onPress={finish}
              >
                <Text style={[styles.endBtnText, { color: p.text }]} numberOfLines={1}>
                  {saving ? t('saving') : t('sess_end')}
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [{ flex: 1, opacity: pressed ? 0.85 : 1 }]}
                accessibilityRole="button"
                onPress={finishExercise}
              >
                <Gradient colors={GRADIENT.cta} style={styles.saveBtnBox} contentStyle={styles.saveBtn}>
                  <Text style={[styles.saveBtnText, { color: p.onAccent }]} numberOfLines={1} adjustsFontSizeToFit>
                    {t('sess_next_ex')}
                  </Text>
                </Gradient>
              </Pressable>
            </>
          ) : (
            // Último ejercicio (o sesión libre): una sola acción, guardar.
            <Pressable
              style={({ pressed }) => [{ flex: 1, opacity: draft.length === 0 || saving ? 0.4 : pressed ? 0.85 : 1 }]}
              accessibilityRole="button"
              disabled={draft.length === 0 || saving}
              onPress={finish}
            >
              <Gradient colors={GRADIENT.cta} style={styles.saveBtnBox} contentStyle={styles.saveBtn}>
                <Text style={[styles.saveBtnText, { color: p.onAccent }]} numberOfLines={1} adjustsFontSizeToFit>
                  {saving ? t('saving') : isBenchmark ? t('bench_save') : currentId ? t('sess_finish_save') : t('sess_save')}
                </Text>
              </Gradient>
            </Pressable>
          )}
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
  // ---- Estado del entreno: [X]  batería + reloj / series  [pausa] ----
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 12,
  },
  activeCenter: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  statusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  battery: {
    width: 58,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    padding: 2,
    justifyContent: 'center',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 4,
  },
  activeTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  bannerSpacer: {
    width: 44,
  },
  progressLine: {
    height: 2,
  },
  progressLineFill: {
    height: 2,
  },
  activeSets: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 1,
  },
  pauseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ---- Foto de cabecera + accesos rápidos ----
  hero: {
    marginHorizontal: -20,
    marginTop: -20,
    height: 230,
    overflow: 'hidden',
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 18,
  },
  quickItem: {
    width: 104,
    alignItems: 'center',
    gap: 8,
  },
  quickCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
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
    marginTop: 16,
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
    flexDirection: 'row',
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
  empty: {
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 24,
  },
  draftCard: {
    borderRadius: RADII.tile,
    borderWidth: 2,
    padding: 16,
    marginBottom: 10,
  },
  draftPos: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginLeft: 8,
  },
  // Ejercicios que no son el actual: una fila compacta.
  // Fila plana (sin tarjeta): icono de línea · TÍTULO en mayúsculas ·
  // subtítulo gris · estado · chevron.
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 62,
    borderRadius: RADII.field,
    paddingHorizontal: 6,
    paddingVertical: 10,
    marginBottom: 2,
  },
  compactMain: {
    flex: 1,
    minWidth: 0,
  },
  compactName: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  compactSub: {
    fontSize: 13,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  compactCount: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  compactDone: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  colHeadNum: {
    width: 36,
    fontSize: 12,
    fontWeight: '600',
  },
  colHeadField: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  colHeadDone: {
    width: 48,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  setNum: {
    width: 36,
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  setActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  textBtn: {
    minHeight: 44,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBtnLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  cardFoot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
    marginHorizontal: -4,
  },
  footLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  moreBtn: { flexDirection: 'row', gap: 8 },
  moreList: { marginTop: 2 },
  moreRow: { minHeight: 48, justifyContent: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  moreText: { fontSize: 15, fontWeight: '600' },
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
    letterSpacing: 0.6,
    textTransform: 'uppercase',
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
    alignItems: 'center',
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
    width: 48,
    alignItems: 'center',
  },
  doneCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  valueBoxCompact: {
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  valueBoxNum: {
    fontSize: 19,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  valueBoxUnit: {
    fontSize: 12,
    marginTop: 2,
  },
  // ---- Cardio ----
  colHeadInt: {
    width: 96,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  intChip: {
    width: 96,
    minHeight: 48,
    borderRadius: RADII.field,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  intChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // ---- Valoración al terminar ----
  checkinSheet: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  checkinSub: {
    fontSize: 14,
    marginTop: 4,
  },
  ratingBlock: {
    marginTop: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  ratingDot: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingNum: {
    fontSize: 17,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  ratingEnds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  ratingEnd: {
    fontSize: 13,
    fontWeight: '500',
  },
  // ---- Descanso entre series (en la barra fija, sobre los botones) ----
  restBox: {
    gap: 8,
  },
  restTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  restLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  restTime: {
    flex: 1,
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  restBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  restBtn: {
    minHeight: 40,
    minWidth: 64,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  restTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  restFill: {
    height: 4,
    borderRadius: 2,
  },
  // Footer: "Terminar" secundario (contorno) junto a la acción principal.
  endBtn: {
    minHeight: 52,
    borderRadius: RADII.tile,
    borderWidth: 1,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endBtnText: {
    fontSize: 16,
    fontWeight: '600',
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    fontSize: 14,
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
    minHeight: 52,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000', // botón blanco, texto negro
  },
  // ---- "¿Cómo se hace?" ----
  howBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginTop: 12,
  },
  howIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  howIconText: {
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 13,
  },
  howText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
