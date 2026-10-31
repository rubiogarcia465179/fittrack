import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
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

export default function SessionScreen({
  exercises,
  onSaved,
}: {
  exercises: Exercise[];
  onSaved: (s: Session) => void;
}) {
  const { t, i18n } = useTranslation();
  const [date, setDate] = useState<string>(todayISO());
  const [weightStr, setWeightStr] = useState('');
  const [notes, setNotes] = useState('');
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState<DraftExercise[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const byId = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const results = useMemo(
    () => searchExercises(exercises, q, 'all', 'all').slice(0, 12),
    [exercises, q],
  );

  const lang = i18n.language as string;
  const nameOf = (e?: { name_en: string; name_nl: string }) =>
    e ? (lang === 'nl' ? e.name_nl || e.name_en : e.name_en) : '';

  const addExercise = (id: string) => {
    if (draft.some((d) => d.exercise_id === id)) {
      Alert.alert(t('sess_add_exercise'), id);
      return;
    }
    setDraft((d) => [...d, { exercise_id: id, sets: [{ reps: 10, weight_kg: 0 }] }]);
    setQ('');
    setSaved(false);
  };

  const removeExercise = (id: string) =>
    setDraft((d) => d.filter((x) => x.exercise_id !== id));

  const addSet = (id: string) =>
    setDraft((d) =>
      d.map((x) =>
        x.exercise_id === id
          ? { ...x, sets: [...x.sets, { reps: 10, weight_kg: x.sets[x.sets.length - 1]?.weight_kg || 0 }] }
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
    const n = Math.max(0, Math.round(Number(raw.replace(',', '.')) || 0));
    setDraft((d) =>
      d.map((x) =>
        x.exercise_id === id
          ? {
              ...x,
              sets: x.sets.map((s, i) =>
                i === idx ? { ...s, [field]: field === 'weight_kg' ? Math.max(0, Number(raw.replace(',', '.')) || 0) : n } : s,
              ),
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

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{t('sess_title')}</Text>
      <Text style={styles.sub}>{t('sess_sub')}</Text>

      <View style={styles.fieldsRow}>
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>{t('sess_date')}</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            inputMode="text"
            accessibilityLabel={t('sess_date')}
          />
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

      <Text style={styles.saveTitle}>{t('sess_save')}</Text>
      {draft.length === 0 ? (
        <Text style={styles.empty}>{t('sess_no_exercises')}</Text>
      ) : (
        draft.map((d) => {
          const ex = byId.get(d.exercise_id);
          return (
            <View key={d.exercise_id} style={styles.draftCard}>
              <View style={styles.draftHeader}>
                <Text style={styles.draftName} numberOfLines={1}>
                  {ex ? nameOf(ex) : d.exercise_id}
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={t('delete')}
                  onPress={() => removeExercise(d.exercise_id)}
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
                  {ex ? `1RM ≈ ${Math.round(Math.max(...d.sets.map((s) => oneRm(s.weight_kg, s.reps)), 0) * 10) / 10} kg` : ''}
                </Text>
              </View>
              {d.sets.map((s, i) => (
                <View key={i} style={styles.setRow}>
                  <Text style={styles.setNum}>{t('sess_set')} {i + 1}</Text>
                  <View style={styles.setInput}>
                    <Text style={styles.setInputLabel}>{t('sess_reps')}</Text>
                    <TextInput
                      style={styles.setField}
                      value={String(s.reps)}
                      onChangeText={(v) => setSet(d.exercise_id, i, 'reps', v)}
                      inputMode="numeric"
                      accessibilityLabel={t('sess_reps')}
                    />
                  </View>
                  <View style={styles.setInput}>
                    <Text style={styles.setInputLabel}>{t('sess_weight')}</Text>
                    <TextInput
                      style={styles.setField}
                      value={String(s.weight_kg)}
                      onChangeText={(v) => setSet(d.exercise_id, i, 'weight_kg', v)}
                      inputMode="decimal"
                      accessibilityLabel={t('sess_weight')}
                    />
                  </View>
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

      <TouchableOpacity style={styles.saveBtn} accessibilityRole="button" onPress={save}>
        <Text style={styles.saveBtnText}>{t('sess_save')}</Text>
      </TouchableOpacity>
      {saved ? (
        <Text style={styles.saved}>
          {t('sess_saved')} — {t('sess_saved_hint')}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: 20,
    paddingBottom: 40,
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
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
  },
  search: {
    backgroundColor: COLORS.fieldBg,
    borderRadius: RADII.field,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
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
    padding: 10,
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
  draftRemove: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.red,
    marginLeft: 8,
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
    gap: 8,
    marginBottom: 6,
  },
  setNum: {
    fontSize: 12,
    color: COLORS.dim,
    width: 52,
  },
  setInput: {
    flex: 1,
  },
  setInputLabel: {
    fontSize: 10,
    color: COLORS.dim,
    marginBottom: 2,
  },
  setField: {
    backgroundColor: COLORS.fieldBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
  },
  setRemove: {
    fontSize: 16,
    color: COLORS.red,
    paddingHorizontal: 6,
  },
  addSet: {
    alignSelf: 'flex-start',
    marginTop: 4,
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
    paddingVertical: 11,
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
  saveBtn: {
    backgroundColor: COLORS.blue,
    borderRadius: RADII.field,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  saved: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.green,
    marginTop: 10,
    textAlign: 'center',
  },
});
