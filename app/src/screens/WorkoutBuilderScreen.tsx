/**
 * Generador de entrenamiento en PASOS (R-17): una pregunta por pantalla,
 * nada que hacer scroll. Progreso con puntos, botón Atrás, y revisión final
 * del plan antes de empezar.
 *
 *  Entrenamiento:  1) tipo  2) objetivo  3) grupos  4) duración/exp/int  5) material  6) plan
 *  Benchmark:      1) tipo  2) grupos  3) duración/exp/int  4) material  5) plan
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
  recentRows,
  type WorkoutPlan,
  type EquipmentMode,
  type Experience,
  type Intensity,
  type Goal,
} from '../lib/workout';
import { ExerciseGlyph } from './SessionScreen';

const MODES: { id: EquipmentMode; labelKey: string }[] = [
  { id: 'full_gym', labelKey: 'mode_full' },
  { id: 'dumbbells', labelKey: 'mode_dumbbells' },
  { id: 'bodyweight', labelKey: 'mode_bodyweight' },
];
const EXPS: Experience[] = ['beginner', 'intermediate', 'advanced'];
const INTENS: Intensity[] = ['low', 'moderate', 'high'];
const DURATIONS = [20, 30, 40, 60, 90];
const GOALS: Goal[] = ['build_muscle', 'lose_fat', 'definition', 'lose_weight', 'strength', 'endurance'];

type Page = 'type' | 'goal' | 'groups' | 'duration' | 'mode' | 'review';

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
  const [idx, setIdx] = useState(0);
  const [goal, setGoal] = useState<Goal>('build_muscle');
  const [mode, setMode] = useState<EquipmentMode>('full_gym');
  const [exp, setExp] = useState<Experience>('intermediate');
  const [intensity, setIntensity] = useState<Intensity>('moderate');
  const [duration, setDuration] = useState(40);
  const [groups, setGroups] = useState<string[]>([]);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [startConfirm, setStartConfirm] = useState(false);

  const pages: Page[] =
    kind === 'benchmark'
      ? ['type', 'groups', 'duration', 'mode', 'review']
      : ['type', 'goal', 'groups', 'duration', 'mode', 'review'];
  const page: Page = pages[idx];
  const total = pages.length;

  const byId = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const nameOf = (id: string) => {
    const e = byId.get(id);
    return e ? (lang === 'nl' ? e.name_nl || e.name_en : e.name_en) : id;
  };

  const toggleGroup = (g: string) =>
    setGroups((gs) => (gs.includes(g) ? gs.filter((x) => x !== g) : [...gs, g]));

  const buildPlan = (k: 'training' | 'benchmark' = kind) => {
    setGenerating(true);
    // latencia breve para feedback de carga (la acción se ve registrada).
    setTimeout(() => {
      const targetGroups =
        groups.length ? groups : (k === 'benchmark' ? GROUPS : (['chest', 'back', 'legs'] as string[]));
      const pl = generateWorkout({
        groups: targetGroups,
        equipment_mode: mode,
        duration_min: duration,
        experience: exp,
        intensity,
        goal,
        benchmarks,
        exercises,
        recent: recentRows(sessions),
      });
      setPlan(pl);
      setGenerating(false);
    }, 400);
  };

  const next = () => {
    if (idx + 1 >= total) return;
    setIdx(idx + 1);
    if (pages[idx + 1] === 'review') buildPlan();
  };
  const back = () => {
    if (idx === 0) {
      onBack();
      return;
    }
    setIdx(idx - 1);
  };

  const start = () => {
    if (!plan) return;
    onStarted(plan, kind);
  };

  // ---------- controles reutilizables ----------
  const Chip = <T extends string>({ value, options, labelOf, onPick, cols = 3 }: {
    value: T; options: T[]; labelOf: (v: T) => string; onPick: (v: T) => void; cols?: number;
  }) => (
    <View style={[styles.chipGrid, { gap: 8 }]}>
      {options.map((o) => {
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
            <Text style={[styles.chipText, { fontSize: fs(scale, 15), color: active ? '#fff' : p.text }]} numberOfLines={1}>
              {labelOf(o)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const StepHeader = ({ title, sub }: { title: string; sub?: string }) => (
    <View style={styles.stepHead}>
      <Text style={[styles.title, { fontSize: fs(scale, 26), color: p.text }]}>{title}</Text>
      {sub ? <Text style={[styles.sub, { fontSize: fs(scale, 15), color: p.secondary }]}>{sub}</Text> : null}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: p.bg }]}>
      {/* barra superior: atrás + progreso */}
      <View style={[styles.top, { borderBottomColor: p.border }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          onPress={back}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1, transition: 'opacity 90ms ease' }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.back, { color: p.accent }]}>{'←'} {t('back')}</Text>
        </Pressable>
        <View style={styles.dots} accessibilityElementsHidden>
          {pages.map((pg, i) => (
            <View
              key={pg + i}
              style={[
                styles.dot,
                {
                  backgroundColor: i <= idx ? p.accent : p.border,
                  transform: [{ scale: i === idx ? 1.25 : 1 }],
                },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.stepCount, { color: p.dim }]}>{t('wiz_step', { n: idx + 1, m: total })}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {page === 'type' ? (
          <>
            <StepHeader title={t('gen_type')} />
            <View style={[styles.typeRow, { gap: 10 }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: kind === 'training' }}
                onPress={() => { setKind('training'); setPlan(null); setIdx(0); }}
                style={({ pressed }) => [
                  styles.typeCard,
                  {
                    backgroundColor: p.card,
                    borderColor: kind === 'training' ? p.accent : p.cardBorder,
                    borderWidth: kind === 'training' ? 1.5 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    transition: 'transform 90ms ease',
                  },
                ]}
              >
                <Text style={[styles.typeText, { fontSize: fs(scale, 18), color: kind === 'training' ? p.accent : p.text, fontWeight: '700' }]}>
                  {t('gen_type_training')}
                </Text>
                <Text style={[styles.typeHint, { fontSize: fs(scale, 13), color: p.secondary }]} numberOfLines={2}>
                  {t('gen_type_training_d')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: kind === 'benchmark' }}
                onPress={() => { setKind('benchmark'); setPlan(null); setIdx(0); }}
                style={({ pressed }) => [
                  styles.typeCard,
                  {
                    backgroundColor: p.card,
                    borderColor: kind === 'benchmark' ? p.accent : p.cardBorder,
                    borderWidth: kind === 'benchmark' ? 1.5 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    transition: 'transform 90ms ease',
                  },
                ]}
              >
                <Text style={[styles.typeText, { fontSize: fs(scale, 18), color: kind === 'benchmark' ? p.accent : p.text, fontWeight: '700' }]}>
                  {t('gen_type_bench')}
                </Text>
                <Text style={[styles.typeHint, { fontSize: fs(scale, 13), color: p.secondary }]} numberOfLines={2}>
                  {t('gen_type_bench_d')}
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {page === 'goal' ? (
          <>
            <StepHeader title={t('wiz_goal')} />
            <View style={styles.goalList}>
              {GOALS.map((g) => {
                const active = goal === g;
                return (
                  <Pressable
                    key={g}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setGoal(g)}
                    style={({ pressed }) => [
                      styles.goalRow,
                      {
                        backgroundColor: p.card,
                        borderColor: active ? p.accent : p.cardBorder,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                        transition: 'transform 90ms ease, border-color 120ms ease',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.goalRadio,
                        {
                          borderColor: active ? p.accent : p.border,
                          backgroundColor: active ? p.accent : 'transparent',
                        },
                      ]}
                    >
                      {active ? <View style={styles.goalRadioDot} /> : null}
                    </View>
                    <View style={styles.goalTexts}>
                      <Text style={[styles.goalName, { fontSize: fs(scale, 17), color: p.text, fontWeight: '700' }]}>
                        {t(`goal_${g}`)}
                      </Text>
                      <Text style={[styles.goalDesc, { fontSize: fs(scale, 13), color: p.secondary }]}>
                        {t(`goal_${g}_d`)}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {page === 'groups' ? (
          <>
            <StepHeader title={t('gen_groups')} sub={t('gen_groups_hint')} />
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
                        flexBasis: `${33.33 - 2}%`,
                        backgroundColor: active ? p.accent : p.card,
                        borderColor: active ? p.accent : p.border,
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                        transition: 'transform 80ms ease, background-color 120ms ease',
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { fontSize: fs(scale, 15), color: active ? '#fff' : p.text }]} numberOfLines={1}>
                      {t(`group_${g}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {page === 'duration' ? (
          <>
            <StepHeader title={t('gen_duration')} />
            <View style={styles.durRow}>
              {DURATIONS.map((d) => {
                const active = duration === d;
                return (
                  <Pressable
                    key={d}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setDuration(d)}
                    style={({ pressed }) => [
                      styles.durChip,
                      {
                        backgroundColor: active ? p.accent : p.card,
                        borderColor: active ? p.accent : p.border,
                        transform: [{ scale: pressed ? 0.94 : 1 }],
                        transition: 'transform 80ms ease, background-color 120ms ease',
                      },
                    ]}
                  >
                    <Text style={[styles.durNum, { fontSize: fs(scale, 17), color: active ? '#fff' : p.text, fontWeight: '700' }]}>
                      {d}
                    </Text>
                    <Text style={[styles.durUnit, { fontSize: fs(scale, 11), color: active ? 'rgba(255,255,255,0.85)' : p.dim }]}>
                      {t('gen_min')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={[styles.label, { fontSize: fs(scale, 14), color: p.secondary, marginTop: 18 }]}>{t('gen_exp')}</Text>
            <Chip value={exp} options={EXPS} labelOf={(v) => t(`exp_${v}`)} onPick={setExp} cols={3} />
            <Text style={[styles.label, { fontSize: fs(scale, 14), color: p.secondary, marginTop: 14 }]}>{t('gen_intensity')}</Text>
            <Chip value={intensity} options={INTENS} labelOf={(v) => t(`intensity_${v}`)} onPick={setIntensity} cols={3} />
          </>
        ) : null}

        {page === 'mode' ? (
          <>
            <StepHeader title={t('gen_mode')} sub={t('gen_mode_hint')} />
            <View style={styles.modeList}>
              {MODES.map((m) => {
                const active = mode === m.id;
                return (
                  <Pressable
                    key={m.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setMode(m.id)}
                    style={({ pressed }) => [
                      styles.modeRow,
                      {
                        backgroundColor: p.card,
                        borderColor: active ? p.accent : p.cardBorder,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                        transition: 'transform 90ms ease, border-color 120ms ease',
                      },
                    ]}
                  >
                    <View
                      style={[styles.goalRadio, { borderColor: active ? p.accent : p.border, backgroundColor: active ? p.accent : 'transparent' }]}
                    >
                      {active ? <View style={styles.goalRadioDot} /> : null}
                    </View>
                    <Text style={[styles.modeName, { fontSize: fs(scale, 16), color: p.text, fontWeight: '700' }]}>
                      {t(m.labelKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {page === 'review' ? (
          <>
            <StepHeader title={t('wiz_review')} />
            {generating ? (
              <View style={styles.genCard}>
                <View style={styles.spinWrap}>
                  <View style={[styles.spin, { backgroundColor: p.accent }]} />
                  <Text style={[styles.genCardText, { color: p.secondary }]}>{t('gen_generating')}</Text>
                </View>
              </View>
            ) : plan ? (
              <View style={[styles.planCard, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card }]}>
                <View style={styles.planHead}>
                  <Text style={[styles.planTitle, { fontSize: fs(scale, 16), color: p.text, fontWeight: '700' }]}>{t('gen_plan')}</Text>
                  <Text style={[styles.planMeta, { fontSize: fs(scale, 13), color: p.secondary }]}>
                    {plan.estimated_duration_min} {t('gen_min')} · {t(`mode_${plan.equipment_mode === 'full_gym' ? 'full' : plan.equipment_mode}`)}
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
                          <Text style={[styles.planName, { fontSize: fs(scale, 15), color: p.text }]} numberOfLines={1}>
                            {nameOf(e.exercise_id)}
                          </Text>
                          <Text style={[styles.planMeta2, { fontSize: fs(scale, 12), color: p.dim }]}>
                            {t(`group_${ex?.muscle_group || 'legs'}`)} · {t(`equip_${ex?.equipment || 'other'}`)}
                          </Text>
                        </View>
                        <View style={styles.planRight}>
                          <Text style={[styles.planWeight, { fontSize: fs(scale, 15), color: p.accent, fontWeight: '700' }]}>
                            {e.recommended_weight_kg > 0 ? `${Math.round(e.recommended_weight_kg * 10) / 10} kg` : t('plan_bodyweight')}
                          </Text>
                          <Text style={[styles.planMeta2, { fontSize: fs(scale, 12), color: p.secondary }]}>
                            {e.sets}×{e.reps} · {e.rest_sec}s
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
                {benchmarks.length === 0 && kind === 'training' ? (
                  <Text style={[styles.planHint, { fontSize: fs(scale, 12), color: p.dim, marginTop: 10 }]}>
                    {t('gen_no_bench_hint')}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>

      {/* CTA inferior: Siguiente / Empezar */}
      <View style={[styles.bottom, { backgroundColor: p.bg, borderTopWidth: 1, borderTopColor: p.border }]}>
        <Pressable
          accessibilityRole="button"
          disabled={page === 'review' && (!plan || generating)}
          onPress={() => (page === 'review' ? setStartConfirm(true) : next())}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: p.accent,
              opacity: page === 'review' && (!plan || generating) ? 0.5 : pressed ? 0.85 : 1,
              transition: 'opacity 90ms ease',
              ...SHADOW.cta,
            },
          ]}
        >
          <Text style={[styles.ctaText, { fontSize: fs(scale, 17), color: '#fff', fontWeight: '700' }]}>
            {page === 'review' ? t('gen_start') : t('wiz_next')}
          </Text>
        </Pressable>
      </View>

      {/* confirmación de inicio */}
      {startConfirm ? (
        <View style={styles.modalBack} pointerEvents="box-none">
          <View style={[styles.modalCard, { backgroundColor: p.card, ...SHADOW.card }]}>
            <Text style={[styles.modalTitle, { fontSize: fs(scale, 18), color: p.text, fontWeight: '700' }]}>{t('gen_start_q')}</Text>
            <Text style={[styles.modalSub, { fontSize: fs(scale, 14), color: p.secondary, marginTop: 6 }]}>
              {plan ? `${plan.exercises.length} ${t('hist_exercises')} · ~${plan.estimated_duration_min} ${t('gen_min')}` : ''}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setStartConfirm(false);
                start();
              }}
              style={({ pressed }) => [styles.modalBtn, { backgroundColor: p.green, opacity: pressed ? 0.85 : 1, transition: 'opacity 90ms ease' }]}
            >
              <Text style={[styles.modalBtnText, { color: '#fff', fontWeight: '700' }]}>{t('gen_start')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setStartConfirm(false)}
              style={({ pressed }) => [styles.modalBtn, { backgroundColor: p.fieldBg, opacity: pressed ? 0.7 : 1, transition: 'opacity 90ms ease', marginTop: 8 }]}
            >
              <Text style={[styles.modalBtnText, { color: p.secondary, fontWeight: '600' }]}>{t('back')}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  backBtn: { paddingHorizontal: 4 },
  back: { fontSize: 15, fontWeight: '600' },
  dots: { flexDirection: 'row', gap: 5, flex: 1, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  stepCount: { fontSize: 12, fontWeight: '600' },
  body: { padding: 18, paddingBottom: 24, gap: 12 },
  stepHead: { gap: 4, marginTop: 4 },
  title: { fontWeight: '700', letterSpacing: -0.4 },
  sub: { lineHeight: 20 },
  typeRow: { flexDirection: 'row' },
  typeCard: { flex: 1, borderRadius: RADII.card, padding: 16, gap: 6 },
  typeText: {},
  typeHint: { lineHeight: 18 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { height: 50, borderRadius: RADII.field, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  chipText: { fontWeight: '600' },
  goalList: { gap: 8 },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: RADII.field, borderWidth: 1.5, paddingVertical: 12, paddingHorizontal: 12 },
  goalRadio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  goalRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
  goalTexts: { flex: 1, gap: 2 },
  goalName: { letterSpacing: -0.2 },
  goalDesc: {},
  durRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  durChip: { flexBasis: '18.5%', height: 56, borderRadius: RADII.field, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 1 },
  durNum: {},
  durUnit: {},
  label: { fontWeight: '600', letterSpacing: 0.2, textTransform: 'uppercase' },
  modeList: { gap: 8 },
  modeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: RADII.field, borderWidth: 1.5, paddingVertical: 14, paddingHorizontal: 12 },
  modeName: { letterSpacing: -0.2 },
  genCard: { minHeight: 120, justifyContent: 'center', alignItems: 'center' },
  spinWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  spin: { width: 20, height: 20, borderRadius: 10 },
  genCardText: { fontWeight: '600' },
  planCard: { borderRadius: RADII.card, borderWidth: 1, marginTop: 6, overflow: 'hidden' },
  planHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  planTitle: {},
  planMeta: {},
  planEmpty: { padding: 16 },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: StyleSheet.hairlineWidth },
  planInfo: { flex: 1, gap: 1 },
  planName: {},
  planMeta2: {},
  planRight: { alignItems: 'flex-end', gap: 1 },
  planWeight: {},
  planHint: {},
  bottom: { padding: 14, gap: 8 },
  cta: { borderRadius: RADII.pill, height: 58, alignItems: 'center', justifyContent: 'center' },
  ctaText: { letterSpacing: -0.2 },
  modalBack: { flex: 1, backgroundColor: 'rgba(10,15,30,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 360, borderRadius: RADII.card, borderWidth: 1, padding: 20, gap: 12 },
  modalTitle: { letterSpacing: -0.3 },
  modalSub: {},
  modalBtn: { borderRadius: RADII.pill, height: 52, alignItems: 'center', justifyContent: 'center' },
  modalBtnText: { fontSize: 16 },
});
