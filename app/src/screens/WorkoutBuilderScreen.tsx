/**
 * Generador de entrenamiento (pestaña "Entrenar", vista previa).
 *
 * Tarea 3A + 4: elige tipo (entrenamiento / benchmark), modo de material
 * (gym completo / solo mancuernas / solo peso corporal), experiencia,
 * intensidad y duración, y genera un plan con ejercicios, peso
 * recomendado (desde los benchmarks), series/reps y descanso. Todo es
 * sobrecableable antes de empezar.
 */
import { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '../data';
import type { Session } from '../store';
import { GROUPS } from '../lib/gym';
import { RADII } from '../theme';
import { useTheme } from '../theme-context';
import { useScale, fs } from '../scale';
import {
  generateWorkout,
  suggestedBenchmarks,
  recentRows,
  type WorkoutPlan,
  type EquipmentMode,
  type Experience,
  type Intensity,
} from '../lib/workout';
import { ExerciseGlyph } from './SessionScreen';

const MODES: { id: EquipmentMode; labelKey: string; hintKey: string }[] = [
  { id: 'full_gym', labelKey: 'mode_full', hintKey: 'mode_full_hint' },
  { id: 'dumbbells', labelKey: 'mode_dumbbells', hintKey: 'mode_dumbbells_hint' },
  { id: 'bodyweight', labelKey: 'mode_bodyweight', hintKey: 'mode_bodyweight_hint' },
];
const EXPS: Experience[] = ['beginner', 'intermediate', 'advanced'];
const INTENS: Intensity[] = ['low', 'moderate', 'high'];
const DURATIONS = [20, 30, 40, 60, 90];

export default function WorkoutBuilderScreen({
  exercises,
  sessions,
  benchmarks,
  onStarted,
  onBack,
}: {
  exercises: Exercise[];
  sessions: Session[];
  benchmarks: { exercise_id: string; estimated_1rm: number }[];
  onStarted: (plan: WorkoutPlan, type: 'training' | 'benchmark') => void;
  onBack: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { p, SHADOW } = useTheme();
  const scale = useScale();
  const lang = i18n.language as string;

  const [kind, setKind] = useState<'training' | 'benchmark'>('training');
  const [mode, setMode] = useState<EquipmentMode>('full_gym');
  const [exp, setExp] = useState<Experience>('intermediate');
  const [intensity, setIntensity] = useState<Intensity>('moderate');
  const [duration, setDuration] = useState(40);
  const [groups, setGroups] = useState<string[]>([]);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [startConfirm, setStartConfirm] = useState(false);

  const byId = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const nameOf = (id: string) => {
    const e = byId.get(id);
    return e ? (lang === 'nl' ? e.name_nl || e.name_en : e.name_en) : id;
  };

  const toggleGroup = (g: string) =>
    setGroups((gs) => (gs.includes(g) ? gs.filter((x) => x !== g) : [...gs, g]));

  // Benchmark: ejercicios sugeridos (3 por grupo, priorizando máquinas).
  const benchList = useMemo(() => {
    if (kind !== 'benchmark') return [];
    return suggestedBenchmarks(groups.length ? groups : GROUPS, exercises, 3);
  }, [kind, groups, exercises]);

  const generate = () => {
    setGenerating(true);
    // pequeña latencia percibida para el feedback de carga (no es lento:
    // 400 ms) — el usuario ve que la acción se registró.
    setTimeout(() => {
      const targetGroups = groups.length ? groups : (['chest', 'back', 'legs'] as string[]);
      const pl = generateWorkout({
        groups: targetGroups,
        equipment_mode: mode,
        duration_min: duration,
        experience: exp,
        intensity,
        benchmarks,
        exercises,
        recent: recentRows(sessions),
      });
      setPlan(pl);
      setGenerating(false);
    }, 400);
  };

  const start = () => {
    if (!plan) return;
    onStarted(plan, kind);
  };

  const Option = <T extends string>({
    value,
    options,
    labelOf,
    onPick,
    cols = 3,
  }: {
    value: T;
    options: T[];
    labelOf: (v: T) => string;
    onPick: (v: T) => void;
    cols?: number;
  }) => (
    <View style={[styles.chipGrid, { gap: 8 }]}>
      {options.map((o, i) => {
        const active = value === o;
        return (
          <Pressable
            key={o}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onPick(o)}
            style={({ pressed }) => [
              styles.chip,
              {
                flexBasis: `${100 / cols - 2}%`,
                backgroundColor: active ? p.accent : p.card,
                borderColor: active ? p.accent : p.border,
                transform: [{ scale: pressed ? 0.95 : 1 }],
                transition: 'transform 80ms ease, background-color 120ms ease',
              },
            ]}
          >
            <Text style={[styles.chipText, { color: active ? '#fff' : p.text }]} numberOfLines={1}>
              {labelOf(o)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: p.bg }]}>
      <ScrollView contentContainerStyle={styles.body}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          onPress={onBack}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1, transition: 'opacity 90ms ease' }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.back, { color: p.accent }]}>{'←'} {t('back')}</Text>
        </Pressable>

        <Text style={[styles.title, { fontSize: fs(scale, 30), color: p.text }]}>{t('gen_title')}</Text>
        <Text style={[styles.sub, { color: p.secondary }]}>{t('gen_sub')}</Text>

        {/* tipo de sesión */}
        <Text style={[styles.label, { color: p.secondary }]}>{t('gen_type')}</Text>
        <View style={[styles.typeRow, { gap: 10 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: kind === 'training' }}
            onPress={() => {
              setKind('training');
              setPlan(null);
            }}
            style={({ pressed }) => [
              styles.typeCard,
              {
                flex: 1,
                backgroundColor: kind === 'training' ? p.accent : p.card,
                borderColor: kind === 'training' ? p.accent : p.border,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                transition: 'transform 80ms ease',
              },
            ]}
          >
            <Text style={[styles.typeText, { color: kind === 'training' ? '#fff' : p.text }]}>{t('gen_type_training')}</Text>
            <Text style={[styles.typeHint, { color: kind === 'training' ? 'rgba(255,255,255,0.8)' : p.dim }]}>{t('gen_type_training_hint')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: kind === 'benchmark' }}
            onPress={() => {
              setKind('benchmark');
              setPlan(null);
            }}
            style={({ pressed }) => [
              styles.typeCard,
              {
                flex: 1,
                backgroundColor: kind === 'benchmark' ? p.accent : p.card,
                borderColor: kind === 'benchmark' ? p.accent : p.border,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                transition: 'transform 80ms ease',
              },
            ]}
          >
            <Text style={[styles.typeText, { color: kind === 'benchmark' ? '#fff' : p.text }]}>{t('gen_type_bench')}</Text>
            <Text style={[styles.typeHint, { color: kind === 'benchmark' ? 'rgba(255,255,255,0.8)' : p.dim }]}>{t('gen_type_bench_hint')}</Text>
          </Pressable>
        </View>

        {/* modo de material */}
        <Text style={[styles.label, { color: p.secondary }]}>{t('gen_mode')}</Text>
        <View style={[styles.modeGrid, { gap: 8 }]}>
          {MODES.map((m) => {
            const active = mode === m.id;
            return (
              <Pressable
                key={m.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  setMode(m.id);
                  setPlan(null);
                }}
                style={({ pressed }) => [
                  styles.modeCard,
                  {
                    flex: 1,
                    backgroundColor: active ? p.accent : p.card,
                    borderColor: active ? p.accent : p.border,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    transition: 'transform 80ms ease',
                  },
                ]}
              >
                <Text style={[styles.modeTitle, { color: active ? '#fff' : p.text }]}>{t(m.labelKey)}</Text>
                <Text style={[styles.modeHint, { color: active ? 'rgba(255,255,255,0.8)' : p.dim }]} numberOfLines={2}>
                  {t(m.hintKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* grupos */}
        <Text style={[styles.label, { color: p.secondary }]}>{t('gen_groups')}</Text>
        <View style={[styles.chipGrid, { gap: 8 }]}>
          {GROUPS.map((g) => {
            const active = groups.includes(g);
            return (
              <Pressable
                key={g}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => toggleGroup(g)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    flexBasis: '47%',
                    flexGrow: 1,
                    backgroundColor: active ? p.accent : p.card,
                    borderColor: active ? p.accent : p.border,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    transition: 'transform 80ms ease',
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: active ? '#fff' : p.text }]}>{t(`group_${g}`)}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* experiencia + intensidad + duración */}
        <Text style={[styles.label, { color: p.secondary }]}>{t('gen_exp')}</Text>
        <Option value={exp} options={EXPS} labelOf={(v) => t(`exp_${v}`)} onPick={setExp} />
        <Text style={[styles.label, { color: p.secondary }]}>{t('gen_intensity')}</Text>
        <Option value={intensity} options={INTENS} labelOf={(v) => t(`intensity_${v}`)} onPick={setIntensity} />
        <Text style={[styles.label, { color: p.secondary }]}>{t('gen_duration')}</Text>
        <View style={[styles.durRow, { gap: 8 }]}>
          {DURATIONS.map((d) => {
            const active = duration === d;
            return (
              <Pressable
                key={d}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  setDuration(d);
                  setPlan(null);
                }}
                style={({ pressed }) => [
                  styles.durChip,
                  {
                    backgroundColor: active ? p.accent : p.card,
                    borderColor: active ? p.accent : p.border,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                    transition: 'transform 80ms ease',
                  },
                ]}
              >
                <Text style={[styles.durText, { color: active ? '#fff' : p.text }]}>
                  {d} {t('gen_min')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* CTA generar */}
        <Pressable
          accessibilityRole="button"
          disabled={generating}
          onPress={generate}
          style={({ pressed }) => [
            styles.genBtn,
            { backgroundColor: p.accent, opacity: generating ? 0.6 : pressed ? 0.85 : 1, transition: 'opacity 90ms ease', ...SHADOW.cta },
          ]}
        >
          {generating ? (
            <View style={styles.spinWrap}>
              <View style={[styles.spin, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
              <Text style={styles.genBtnText}>{t('gen_generating')}</Text>
            </View>
          ) : (
            <Text style={styles.genBtnText}>{t('gen_generate')}</Text>
          )}
        </Pressable>

        {/* plan generado */}
        {plan ? (
          <View style={[styles.planCard, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card, marginTop: 18 }]}>
            <View style={styles.planHead}>
              <Text style={[styles.planTitle, { color: p.text }]}>{t('gen_plan')}</Text>
              <Text style={[styles.planMeta, { color: p.secondary }]}>
                {t(`mode_${plan.equipment_mode === 'full_gym' ? 'full' : plan.equipment_mode}`)} · {t(`intensity_${plan.intensity}`)} · {plan.estimated_duration_min} {t('gen_min')}
              </Text>
            </View>
            {plan.exercises.length === 0 ? (
              <Text style={[styles.planEmpty, { color: p.dim }]}>{t('gen_none')}</Text>
            ) : (
              plan.exercises.map((e) => {
                const ex = byId.get(e.exercise_id);
                return (
                  <View key={e.exercise_id} style={[styles.planRow, { borderTopColor: p.cardBorder }]}>
                    <ExerciseGlyph label={ex?.muscle_group || 'legs'} size={22} />
                    <View style={styles.planInfo}>
                      <Text style={[styles.planName, { color: p.text }]} numberOfLines={1}>
                        {nameOf(e.exercise_id)}
                      </Text>
                      <Text style={[styles.planMeta2, { color: p.dim }]}>
                        {t(`group_${ex?.muscle_group || 'legs'}`)} · {t(`equip_${ex?.equipment || 'other'}`)}
                      </Text>
                    </View>
                    <View style={styles.planRight}>
                      <Text style={[styles.planWeight, { color: p.accent }]}>
                        {e.recommended_weight_kg > 0 ? `${Math.round(e.recommended_weight_kg * 10) / 10} kg` : t('plan_bodyweight')}
                      </Text>
                      <Text style={[styles.planMeta2, { color: p.secondary }]} numberOfLines={1}>
                        {e.sets}×{e.reps} · {e.rest_sec}s
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
            {benchmarks.length === 0 ? (
              <Text style={[styles.planHint, { color: p.dim, marginTop: 10 }]}>
                {t('gen_no_bench_hint')}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={() => setStartConfirm(true)}
              style={({ pressed }) => [
                styles.startBtn,
                { backgroundColor: p.green, opacity: pressed ? 0.85 : 1, transition: 'opacity 90ms ease' },
              ]}
            >
              <Text style={styles.startBtnText}>{t('gen_start')}</Text>
            </Pressable>
          </View>
        ) : null}

        {/* benchmark: ejercicios sugeridos */}
        {kind === 'benchmark' && !plan ? (
          <View style={[styles.planCard, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card, marginTop: 18 }]}>
            <Text style={[styles.planTitle, { color: p.text }]}>{t('bench_suggested')}</Text>
            <Text style={[styles.planSub, { color: p.secondary, marginTop: 2 }]}>
              {t('bench_suggested_hint')}
            </Text>
            {benchList.map((id) => {
              const ex = byId.get(id);
              if (!ex) return null;
              const hasBench = benchmarks.find((b) => b.exercise_id === id);
              return (
                <View key={id} style={[styles.planRow, { borderTopColor: p.cardBorder }]}>
                  <ExerciseGlyph label={ex.muscle_group} size={22} />
                  <View style={styles.planInfo}>
                    <Text style={[styles.planName, { color: p.text }]} numberOfLines={1}>
                      {lang === 'nl' ? ex.name_nl || ex.name_en : ex.name_en}
                    </Text>
                    <Text style={[styles.planMeta2, { color: p.dim }]}>
                      {t(`group_${ex.muscle_group}`)} · {t(`equip_${ex.equipment}`)}
                    </Text>
                  </View>
                  {hasBench ? (
                    <View style={[styles.benchChip, { backgroundColor: p.section }]}>
                      <Text style={[styles.benchChipVal, { color: p.accent }]}>{hasBench.estimated_1rm} kg</Text>
                    </View>
                  ) : (
                    <View style={[styles.benchChipNew, { borderColor: p.border }]}>
                      <Text style={[styles.benchChipNewText, { color: p.dim }]}>{t('bench_new')}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>

      {/* confirmación de inicio */}
      {startConfirm && plan ? (
        <View style={styles.modalBack} pointerEvents="box-none">
          <View style={[styles.modalCard, { backgroundColor: p.card, borderColor: p.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: p.text }]}>{kind === 'benchmark' ? t('bench_start_q') : t('gen_start_q')}</Text>
            <Text style={[styles.modalMsg, { color: p.secondary }]}>
              {plan.exercises.length} {t('hist_exercises')} · {t(`mode_${plan.equipment_mode === 'full_gym' ? 'full' : plan.equipment_mode}`)}
            </Text>
            <View style={styles.modalRow}>
              <Pressable
                accessibilityRole="button"
                onPress={start}
                style={({ pressed }) => [styles.modalBtn, { backgroundColor: p.accent, opacity: pressed ? 0.85 : 1, transition: 'opacity 90ms ease' }]}
              >
                <Text style={styles.modalBtnTextYes}>{t('gen_start')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setStartConfirm(false)}
                style={({ pressed }) => [styles.modalBtn, { backgroundColor: p.section, opacity: pressed ? 0.8 : 1, transition: 'opacity 90ms ease' }]}
              >
                <Text style={[styles.modalBtnText, { color: p.secondary }]}>{t('cancel')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  body: {
    padding: 20,
    paddingBottom: 40,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  back: {
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.6,
    marginTop: 4,
  },
  sub: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 18,
    lineHeight: 19,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
    marginTop: 16,
  },
  typeRow: {
    flexDirection: 'row',
  },
  typeCard: {
    borderRadius: RADII.tile,
    borderWidth: 1.5,
    padding: 14,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  typeHint: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  modeGrid: {
    flexDirection: 'row',
  },
  modeCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  modeTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  modeHint: {
    fontSize: 11,
    marginTop: 4,
    lineHeight: 14,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  durRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  durChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  durText: {
    fontSize: 14,
    fontWeight: '700',
  },
  genBtn: {
    borderRadius: RADII.tile,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  genBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  spinWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    transform: [{ rotate: '45deg' }],
  },
  planCard: {
    borderRadius: RADII.tile,
    borderWidth: 1,
    padding: 14,
  },
  planHead: {
    marginBottom: 4,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  planMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  planSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  planEmpty: {
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 15,
    fontWeight: '600',
  },
  planMeta2: {
    fontSize: 11,
    marginTop: 2,
  },
  planRight: {
    alignItems: 'flex-end',
  },
  planWeight: {
    fontSize: 15,
    fontWeight: '700',
  },
  planHint: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  startBtn: {
    borderRadius: RADII.pill,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  startBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  benchChip: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  benchChipVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  benchChipNew: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  benchChipNewText: {
    fontSize: 11,
    fontWeight: '600',
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
});
