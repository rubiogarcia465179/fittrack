import { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '../data';
import type { Session, SetLog } from '../store';
import { searchExercises, normalizeSession, uid, todayISO, oneRm } from '../lib/gym';
import { store } from '../store';
import { COLORS, RADII } from '../theme';

interface DraftExercise {
  exercise_id: string;
  sets: SetLog[];
}

/**
 * Stepper reutilizable: [−] [valor editable] [+].
 * Tap = 1 paso; mantener pulsado repite (450 ms de delay, ~110 ms/paso).
 * El valor sigue siendo editable por teclado (mismo TextInput de antes).
 */
function Stepper({
  value,
  step,
  onDelta,
  onText,
  label,
  inputMode,
  inputStyle,
}: {
  value: number;
  step: number;
  onDelta: (delta: number) => void;
  onText: (raw: string) => void;
  label: string;
  inputMode: 'numeric' | 'decimal';
  inputStyle?: object;
}) {
  const cb = useRef(onDelta);
  cb.current = onDelta;
  const holdT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdI = useRef<ReturnType<typeof setInterval> | null>(null);
  const held = useRef(false);

  // Tap → 1 paso (onPress, que sí se dispara en web y nativo).
  const tap = (delta: number) => {
    if (!held.current) cb.current(delta);
  };
  // Mantener pulsado: tras 450 ms repite cada ~110 ms.
  const begin = (delta: number) => {
    held.current = false;
    if (holdT.current) return; // ya sosteniendo
    holdT.current = setTimeout(() => {
      held.current = true;
      cb.current(delta);
      holdI.current = setInterval(() => cb.current(delta), 110);
    }, 450);
  };
  const end = () => {
    if (holdT.current) {
      clearTimeout(holdT.current);
      holdT.current = null;
    }
    if (holdI.current) {
      clearInterval(holdI.current);
      holdI.current = null;
    }
  };

  const btn = (delta: number, sign: string) => (
    <TouchableOpacity
      style={styles.stepBtn}
      accessibilityRole="button"
      accessibilityLabel={label + ' ' + sign}
      onPress={() => tap(delta)}
      onPressIn={() => begin(delta)}
      onPressOut={end}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      activeOpacity={0.6}
    >
      <Text style={styles.stepBtnText}>{sign}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.stepperRow}>
      {btn(-step, '−')}
      <TextInput
        style={[styles.setField, inputStyle]}
        value={String(value)}
        onChangeText={onText}
        inputMode={inputMode}
        textAlign="center"
        accessibilityLabel={label}
      />
      {btn(step, '+')}
    </View>
  );
}

export default function SessionScreen({
  exercises,
  onSaved,
}: {
  exercises: Exercise[];
  onSaved: (s: Session) => void;
}) {
  const { t, i18n } = useTranslation();
  const [date, setDate] = useState<string>(todayISO());
  const [dateOpen, setDateOpen] = useState(false);
  const [weightStr, setWeightStr] = useState('');
  const [notes, setNotes] = useState('');
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState<DraftExercise[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<any>(null);
  // Offset (y dentro del contenido del ScrollView) de cada tarjeta del draft,
  // capturado en onLayout: permite ir directo a la tarjeta de un ejercicio.
  const cardOffsets = useRef<Record<string, number>>({});

  const byId = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
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

  const addExercise = (id: string) => {
    if (draft.some((d) => d.exercise_id === id)) {
      // Ya está en la sesión: no interrumpir con un Alert en mitad del
      // entrenamiento; limpiar la búsqueda e ir directo a su tarjeta para
      // ajustar los sets.
      setQ('');
      const off = cardOffsets.current[id] ?? 0;
      setTimeout(
        () =>
          scrollRef.current?.scrollTo({
            y: Math.max(0, off - 24),
            animated: true,
          }),
        60,
      );
      return;
    }
    setDraft((d) => [...d, { exercise_id: id, sets: [{ reps: 10, weight_kg: 0 }] }]);
    setQ('');
    setSaved(false);
    // La tarjeta nueva es la última del draft: desplazarse hasta ella para
    // que los steppers queden a la vista sin buscar el scroll a mano.
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  };

  const removeExercise = (id: string) =>
    setDraft((d) => d.filter((x) => x.exercise_id !== id));

  // Nuevo set: copia reps Y peso del set anterior (lo típico en una sesión).
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

  const setSet = (id: string, idx: number, field: 'reps' | 'weight_kg', raw: string) => {
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
                          ? Math.max(0, Number(raw.replace(',', '.')) || 0)
                          : Math.max(0, Math.round(Number(raw.replace(',', '.')) || 0)),
                    }
                  : s,
              ),
            }
          : x,
      ),
    );
  };

  // Paso del stepper (±delta) sin tocar el teclado.
  const bump = (id: string, idx: number, field: 'reps' | 'weight_kg', delta: number) => {
    setDraft((d) =>
      d.map((x) =>
        x.exercise_id === id
          ? {
              ...x,
              sets: x.sets.map((s, i) => {
                if (i !== idx) return s;
                const cur = field === 'reps' ? s.reps : s.weight_kg;
                const next = Math.max(0, Math.round((cur + delta) * 100) / 100);
                return field === 'reps' ? { ...s, reps: Math.round(next) } : { ...s, weight_kg: next };
              }),
            }
          : x,
      ),
    );
  };

  const save = async () => {
    setError('');
    try {
      const bodyWeight = Number(weightStr.replace(',', '.'));
      const normalized = normalizeSession({
        id: uid(),
        date,
        exercises: draft,
        notes,
        body_weight_kg: bodyWeight > 0 ? bodyWeight : null,
      }) as Session;
      await store.addSession(normalized);
      setDraft([]);
      setNotes('');
      setWeightStr('');
      setSaved(true);
      onSaved(normalized);
    } catch (e) {
      setError(String((e as Error)?.message || e));
    }
  };

  const totalSets = draft.reduce((a, d) => a + d.sets.length, 0);

  return (
    // Con el teclado abierto, el contenedor se encoge (iOS: height; Android:
    // padding) para que el campo en foco y la barra de guardado queden
    // siempre alcanzables, sin solapar el teclado.
    <KeyboardAvoidingView style={styles.root} behavior="padding">
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={styles.title}>{t('sess_title')}</Text>
        <Text style={styles.sub}>{t('sess_sub')}</Text>

        <View style={styles.fieldsRow}>
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{t('sess_date')}</Text>
            <TouchableOpacity
              style={[styles.dateBox, dateOpen && styles.dateBoxActive]}
              accessibilityRole="button"
              accessibilityLabel={date}
              onPress={() => setDateOpen((o) => !o)}
            >
              <Text style={styles.dateText}>{date}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{t('sess_bodyweight')}</Text>
            <TextInput
              style={styles.input}
              value={weightStr}
              onChangeText={setWeightStr}
              inputMode="decimal"
              accessibilityLabel={t('sess_bodyweight')}
            />
          </View>
        </View>
        {dateOpen ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateRow}
          >
            {recentDays.map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.dateChip,
                  d === todayISO() && styles.dateChipToday,
                  d === date && styles.dateChipSel,
                ]}
                accessibilityRole="button"
                accessibilityLabel={d}
                onPress={() => {
                  setDate(d);
                  setDateOpen(false);
                }}
              >
                <Text style={[styles.dateChipText, d === date && styles.dateChipTextSel]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        <Text style={styles.fieldLabel}>{t('sess_pick')}</Text>
        <TextInput
          style={styles.search}
          placeholder={t('sess_search_ph')}
          placeholderTextColor={COLORS.dim}
          value={q}
          onChangeText={setQ}
          autoCorrect={false}
          accessibilityLabel={t('sess_pick')}
        />
        <View style={styles.results}>
          {results.map((e) => (
            <TouchableOpacity
              key={e.id}
              style={styles.resultRow}
              accessibilityRole="button"
              accessibilityLabel={nameOf(e)}
              onPress={() => addExercise(e.id)}
              activeOpacity={0.7}
            >
              <Image source={e.imageAsset} style={styles.resultThumb} resizeMode="cover" />
              <Text style={styles.resultName} numberOfLines={1}>
                {nameOf(e)}
              </Text>
              <Text style={styles.resultAdd}>+ {t('sess_add_exercise')}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.saveTitle}>
          {t('hist_exercises')}
        </Text>
        {draft.length === 0 ? (
          <Text style={styles.empty}>{t('sess_no_exercises')}</Text>
        ) : (
          draft.map((d) => {
            const ex = byId.get(d.exercise_id);
            return (
              <View
                key={d.exercise_id}
                style={styles.draftCard}
                onLayout={(e) => {
                  cardOffsets.current[d.exercise_id] = e.nativeEvent.layout.y;
                }}
              >
                <View style={styles.draftHeader}>
                  <Text style={styles.draftName} numberOfLines={1}>
                    {ex ? nameOf(ex) : d.exercise_id}
                  </Text>
                  <TouchableOpacity
                    style={styles.draftRemoveBtn}
                    accessibilityRole="button"
                    accessibilityLabel={t('delete')}
                    onPress={() => removeExercise(d.exercise_id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.draftRemove}>{t('delete')}</Text>
                  </TouchableOpacity>
                </View>
                {ex ? (
                  <Text style={styles.draftMeta}>
                    {t(`group_${ex.muscle_group}`)} · {t(`equip_${ex.equipment}`)}
                  </Text>
                ) : null}

                <View style={styles.setsHeader}>
                  <Text style={styles.setsLabel}>{t('sess_sets')}</Text>
                  <Text style={styles.oneRm}>
                    {ex
                      ? `1RM ≈ ${Math.round(Math.max(...d.sets.map((s) => oneRm(s.weight_kg, s.reps)), 0) * 10) / 10} kg`
                      : ''}
                  </Text>
                </View>
                {d.sets.map((s, i) => (
                  <View key={i} style={styles.setRow}>
                    <Text style={styles.setNum}>
                      {t('sess_set')} {i + 1}
                    </Text>
                    <Stepper
                      value={s.reps}
                      step={1}
                      label={t('sess_reps')}
                      inputMode="numeric"
                      onDelta={(delta) => bump(d.exercise_id, i, 'reps', delta)}
                      onText={(v) => setSet(d.exercise_id, i, 'reps', v)}
                    />
                    <Stepper
                      value={s.weight_kg}
                      step={2.5}
                      label={t('sess_weight')}
                      inputMode="decimal"
                      onDelta={(delta) => bump(d.exercise_id, i, 'weight_kg', delta)}
                      onText={(v) => setSet(d.exercise_id, i, 'weight_kg', v)}
                    />
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={t('delete')}
                      onPress={() => removeSet(d.exercise_id, i)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.setRemove}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addSet}
                  accessibilityRole="button"
                  onPress={() => addSet(d.exercise_id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addSetText}>+ {t('sess_add_set')}</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <Text style={styles.fieldLabel}>{t('sess_notes')}</Text>
        <TextInput
          style={styles.notes}
          placeholder={t('sess_notes_ph')}
          placeholderTextColor={COLORS.dim}
          value={notes}
          onChangeText={setNotes}
          multiline
          accessibilityLabel={t('sess_notes')}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      {/* Barra fija de guardado: siempre visible, sin hacer scroll. */}
      <View style={styles.footer}>
        {saved ? (
          <Text style={styles.savedText} numberOfLines={2}>
            {t('sess_saved')} — {t('sess_saved_hint')}
          </Text>
        ) : (
          <Text style={styles.footerCount} numberOfLines={1}>
            {draft.length} {t('hist_exercises')} · {totalSets} {t('hist_sets_total')}
          </Text>
        )}
        <TouchableOpacity
          style={[styles.saveBtn, draft.length === 0 && styles.saveBtnDisabled]}
          accessibilityRole="button"
          disabled={draft.length === 0}
          onPress={save}
        >
          <Text style={styles.saveBtnText}>{t('sess_save')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  body: {
    padding: 20,
    paddingBottom: 24,
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
    color: COLORS.secondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.fieldBg,
    borderRadius: RADII.field,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  dateBox: {
    backgroundColor: COLORS.fieldBg,
    borderRadius: RADII.field,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBoxActive: {
    borderColor: COLORS.blue,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateRow: {
    gap: 8,
    paddingBottom: 12,
  },
  dateChip: {
    borderRadius: RADII.field,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateChipToday: {
    borderColor: COLORS.blue,
  },
  dateChipSel: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateChipTextSel: {
    color: '#ffffff',
  },
  search: {
    backgroundColor: COLORS.fieldBg,
    borderRadius: RADII.field,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  results: {
    marginTop: 10,
    gap: 8,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 12,
  },
  resultThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.section,
  },
  resultName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 10,
  },
  resultAdd: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.blue,
  },
  saveTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 10,
  },
  empty: {
    fontSize: 13,
    color: COLORS.dim,
    backgroundColor: COLORS.section,
    borderRadius: 12,
    padding: 14,
  },
  draftCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginBottom: 12,
  },
  draftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  draftName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  draftRemoveBtn: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    // target táctil ≥ 44px (iOS HIG)
    borderRadius: 10,
  },
  draftRemove: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.red,
  },
  draftMeta: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
  },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 6,
  },
  setsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  oneRm: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.blue,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  setNum: {
    fontSize: 12,
    color: COLORS.dim,
    width: 44,
  },
  stepperRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  stepBtn: {
    width: 30,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.section,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 18,
  },
  setField: {
    flex: 1,
    minWidth: 0, // el input HTML tiene min-width por defecto; sin esto la fila
    // del set desborda en móvil (medido a 393px)
    backgroundColor: COLORS.fieldBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 4,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.text,
    minHeight: 34,
  },
  setRemove: {
    fontSize: 16,
    color: COLORS.red,
    paddingHorizontal: 10,
    paddingVertical: 12,
    // target táctil ≥ 44px (iOS HIG)
    borderRadius: 10,
  },
  addSet: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.section,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  addSetText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.blue,
  },
  notes: {
    backgroundColor: COLORS.fieldBg,
    borderRadius: RADII.field,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 72,
    marginTop: 4,
  },
  error: {
    fontSize: 13,
    color: COLORS.red,
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footerCount: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  savedText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.green,
  },
  saveBtn: {
    backgroundColor: COLORS.blue,
    borderRadius: RADII.field,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
});
