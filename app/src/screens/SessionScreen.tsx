import { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '../data';
import type { Session, SetLog } from '../store';
import { searchExercises, normalizeSession, uid, todayISO, oneRm } from '../lib/gym';
import { store } from '../store';
import { COLORS, RADII, SHADOW, GRADIENT_STOPS } from '../theme';
import { useScale, fs } from '../scale';
import { XGlyph } from '../components/TabIcon';
import { PickerSheet, fmtNum } from '../components/PickerSheet';
import { plural } from '../lib/plural';

/** '2026-11-08' -> 'Nov 8' (mes corto + día). Local, sin Intl. */
const M_SHORT_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const M_SHORT_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const M_SHORT_FR = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
export function fmtDay(iso: string, lang: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const arr = lang === 'es' ? M_SHORT_ES : lang === 'fr' ? M_SHORT_FR : M_SHORT_EN;
  return `${arr[m - 1]} ${d}`;
}

interface DraftExercise {
  exercise_id: string;
  sets: SetLog[];
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
  const scale = useScale();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${value} ${unit}`}
      onPress={onPress}
      style={[
        styles.valueBox,
        accent && { backgroundColor: COLORS.blue },
      ]}
    >
      <Text style={[styles.valueBoxNum, { fontSize: fs(scale, 19), color: accent ? '#fff' : COLORS.text }]}>
        {value}
      </Text>
      <Text style={[styles.valueBoxUnit, { fontSize: fs(scale, 12), color: accent ? 'rgba(255,255,255,0.85)' : COLORS.secondary }]}>
        {unit}
      </Text>
    </Pressable>
  );
}

export default function SessionScreen({
  exercises,
  sessions,
  onSaved,
}: {
  exercises: Exercise[];
  sessions: Session[]; // recientes primero: para prellenar con los últimos valores
  onSaved: (s: Session) => void;
}) {
  const { t, i18n } = useTranslation();
  const scale = useScale();
  const [date, setDate] = useState<string>(todayISO());
  const [dateOpen, setDateOpen] = useState(false);
  const [weightStr, setWeightStr] = useState('');
  const [duration, setDuration] = useState<number>(0); // 0 = no indicada
  const [notes, setNotes] = useState('');
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState<DraftExercise[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<any>(null);
  // Offset (y dentro del contenido del ScrollView) de cada tarjeta del draft,
  // capturado en onLayout: permite ir directo a la tarjeta de un ejercicio.
  const cardOffsets = useRef<Record<string, number>>({});

  // Hojas de elección (peso / reps / duración / peso corporal): un toque
  // sobre el valor, sin teclado.
  type PickTarget =
    | { kind: 'reps'; ex: string; idx: number }
    | { kind: 'weight'; ex: string; idx: number }
    | { kind: 'duration' }
    | { kind: 'body' };
  const [pick, setPick] = useState<PickTarget | null>(null);

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
    // 3 series por defecto: lo estándar en un entrenamiento — no obliga a
    // pulsar "Añadir serie" dos veces de más. Si el ejercicio ya se hizo en
    // una sesión anterior, se prellenan con sus últimos pesos y reps.
    const lastSets = sessions
      .find((s) => s.exercises.some((e) => e.exercise_id === id))
      ?.exercises.find((e) => e.exercise_id === id)?.sets;
    const bases: SetLog[] =
      lastSets && lastSets.length > 0
        ? lastSets
        : [{ reps: 10, weight_kg: 0 }];
    const fresh: SetLog[] = [];
    for (let i = 0; i < 3; i++) {
      fresh.push({ reps: bases[Math.min(i, bases.length - 1)].reps || 10, weight_kg: bases[Math.min(i, bases.length - 1)].weight_kg ?? 0 });
    }
    setDraft((d) => [...d, { exercise_id: id, sets: fresh }]);
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

  // Confirmación de la hoja: aplica el valor según el destino y cierra.
  const confirmPick = (v: number) => {
    if (!pick) return;
    if (pick.kind === 'reps') {
      setSet(pick.ex, pick.idx, 'reps', v);
    } else if (pick.kind === 'weight') {
      setSet(pick.ex, pick.idx, 'weight_kg', v);
    } else if (pick.kind === 'duration') {
      setDuration(Math.round(v));
    } else if (pick.kind === 'body') {
      setWeightStr(String(v));
    }
    setPick(null);
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
        duration_min: duration > 0 ? duration : null,
        body_weight_kg: bodyWeight > 0 ? bodyWeight : null,
      }) as Session;
      await store.addSession(normalized);
      setDraft([]);
      setNotes('');
      setWeightStr('');
      setDuration(0);
      setSaved(true);
      onSaved(normalized);
    } catch (e) {
      setError(String((e as Error)?.message || e));
    }
  };

  const totalSets = draft.reduce((a, d) => a + d.sets.length, 0);

  // CTA principal: degradado azul vertical (prop CSS de RN-web; en nativo
  // se pinta de plano con la primera parada si no hubiera soporte).
  const ctaBg = {
    backgroundColor: GRADIENT_STOPS[0],
    background: `linear-gradient(180deg, ${GRADIENT_STOPS[0]} 0%, ${GRADIENT_STOPS[1]} 100%)`,
  } as object;

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
        <Text style={[styles.title, { fontSize: fs(scale, 32) }]} numberOfLines={1}>
          {t('sess_title')}
        </Text>
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
              <Text style={styles.dateText}>{fmtDay(date, lang)}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{t('picker_duration')}</Text>
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
            <Text style={styles.fieldLabel}>{t('sess_bodyweight')}</Text>
            <ValueBox
              value={weightStr ? fmtNum(Number(weightStr)) : '—'}
              unit="kg"
              onPress={() => setPick({ kind: 'body' })}
              accent={weightStr !== ''}
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
                  {d === todayISO() ? t('cal_today') : fmtDay(d, lang)}
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
                    <View style={styles.setFieldWrap}>
                      <Text style={styles.setCaption}>{t('sess_set')} {i + 1}</Text>
                      <ValueBox
                        value={String(s.reps)}
                        unit="reps"
                        onPress={() => setPick({ kind: 'reps', ex: d.exercise_id, idx: i })}
                        accent={s.reps > 0}
                      />
                    </View>
                    <View style={styles.setFieldWrap}>
                      <Text style={styles.setCaption}>{t('sess_weight')}</Text>
                      <ValueBox
                        value={fmtNum(s.weight_kg)}
                        unit="kg"
                        onPress={() => setPick({ kind: 'weight', ex: d.exercise_id, idx: i })}
                        accent={s.weight_kg > 0}
                      />
                    </View>
                    <View style={styles.setDelWrap}>
                      <Text style={styles.setCaption}>{t('delete')}</Text>
                      <TouchableOpacity
                        style={styles.setRemoveBtn}
                        accessibilityRole="button"
                        accessibilityLabel={t('delete')}
                        onPress={() => removeSet(d.exercise_id, i)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <XGlyph size={18} color={COLORS.red} />
                      </TouchableOpacity>
                    </View>
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

      {/* Hoja de valores (peso / reps / duración / peso corporal). */}
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
                  : t('sess_bodyweight')
          }
          unit={pick.kind === 'reps' ? 'reps' : pick.kind === 'weight' ? 'kg' : pick.kind === 'duration' ? t('picker_minutes') : 'kg'}
          values={
            pick.kind === 'reps'
              ? [5, 8, 10, 12, 15, 20, 25, 30]
              : pick.kind === 'weight'
                ? [0, 2.5, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 90, 100]
                : pick.kind === 'duration'
                  ? [15, 20, 30, 40, 45, 50, 60, 75, 90]
                  : [45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 100]
          }
          value={
            pick.kind === 'reps'
              ? draft.find((x) => x.exercise_id === pick!.ex)?.sets[pick!.idx]?.reps ?? 0
              : pick.kind === 'weight'
                ? draft.find((x) => x.exercise_id === pick!.ex)?.sets[pick!.idx]?.weight_kg ?? 0
                : pick.kind === 'duration'
                  ? duration
                  : Number(weightStr) || 0
          }
          custom={
            pick.kind === 'reps'
              ? { min: 1, max: 200, step: 1 }
              : pick.kind === 'weight'
                ? { min: 0, max: 500, step: 2.5 }
                : pick.kind === 'duration'
                  ? { min: 1, max: 600, step: 5 }
                  : { min: 10, max: 400, step: 1 }
          }
          labelCustom={t('other_value')}
          labelUse={t('use_value')}
          onSelect={() => undefined}
          onConfirm={confirmPick}
        />
      ) : null}

      {/* Barra fija de guardado: siempre visible, sin hacer scroll. */}
      <View style={styles.footer}>
        {saved ? (
          <Text style={styles.savedText} numberOfLines={2}>
            {t('sess_saved')} — {t('sess_saved_hint')}
          </Text>
        ) : (
          <Text style={styles.footerCount} numberOfLines={1}>
            {plural(draft.length, t, 'hist_exercise', 'hist_exercises')} · {plural(totalSets, t, 'hist_set', 'hist_sets_total')}
          </Text>
        )}
        <TouchableOpacity
          style={[styles.saveBtn, ctaBg, draft.length === 0 && styles.saveBtnDisabled]}
          accessibilityRole="button"
          disabled={draft.length === 0}
          onPress={save}
          activeOpacity={0.85}
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
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: COLORS.text,
  },
  sub: {
    fontSize: 15,
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
    fontSize: 16,
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
    ...SHADOW.card,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginBottom: 12,
    ...SHADOW.card,
  },
  draftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  draftName: {
    fontSize: 16,
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
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 10,
  },
  setFieldWrap: {
    flex: 1,
    gap: 5,
  },
  setDelWrap: {
    flex: 0.55,
    gap: 5,
  },
  setCaption: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.dim,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  valueBox: {
    flex: 1,
    backgroundColor: COLORS.fieldBg,
    borderRadius: RADII.field,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    minHeight: 56,
  },
  valueBoxNum: {
    fontWeight: '700',
  },
  valueBoxUnit: {
    marginLeft: 6,
    fontWeight: '500',
  },
  setRemoveBtn: {
    flex: 1,
    height: 56,
    borderRadius: RADII.field,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.35)',
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: RADII.tile,
    paddingVertical: 14,
    paddingHorizontal: 26,
    ...SHADOW.cta,
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
