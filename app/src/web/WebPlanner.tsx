/**
 * WEB PÚBLICA (R-136, solo web): una sola pantalla que crea un entreno.
 * Sin perfil, sin guardar nada. Pide lo justo (qué entrenas, objetivo,
 * tiempo, nivel, material), un botón, y la sesión aparece en la misma
 * pantalla; cada ejercicio abre "¿Cómo se hace?" (dibujo + vídeo).
 * Idioma arriba a la derecha (ES · EN · NL · FR). Se adapta al ancho:
 * una columna en móvil, dos (preguntas | sesión) en pantallas anchas.
 *
 * Se activa con EXPO_PUBLIC_WEB_MODE=planner (web/build.js y netlify.toml).
 * La app de iOS/Android y el build de capturas siguen siendo la app completa.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CC_BY_SA_3, DRAWINGS_CREDITS } from '../lib/attribution';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, useTheme } from '../theme-context';
import { LANGS, setLanguage, type Lang } from '../i18n';
import { loadFonts } from '../lib/fonts';
import { loadExercises } from '../data';
import { generateWorkout, type EquipmentMode, type WorkoutPlan } from '../lib/workout';
import { SPLITS, splitLabel } from '../lib/nextSplit';
import { exName } from '../lib/names';
import type { Goal } from '../lib/types';
import { photosFor } from '../exercisePhotos';
import { ExerciseHowTo } from '../components/ExerciseHowTo';
import { ExerciseThumb } from '../components/ExerciseThumb';
import { Chevron } from '../components/Chevron';

const BRAND_ICON = require('../../assets/icon.png');

type Focus = 'push' | 'pull' | 'legs' | 'full';
const FOCUS_GROUPS: Record<Focus, string[]> = {
  push: SPLITS[0],
  pull: SPLITS[1],
  legs: SPLITS[2],
  full: ['legs', 'chest', 'back', 'shoulders', 'core'],
};
const FOCI: Focus[] = ['push', 'pull', 'legs', 'full'];
const GOALS: Goal[] = ['build_muscle', 'strength', 'lose_fat', 'endurance'];
const DURATIONS = [30, 45, 60];
const MODES: EquipmentMode[] = ['full_gym', 'dumbbells', 'bodyweight'];

/** Idioma inicial: el del navegador si es uno de los 4; si no, inglés. */
function browserLang(): Lang {
  const n = (typeof navigator !== 'undefined' && (navigator.languages?.[0] || navigator.language)) || 'en';
  const two = n.slice(0, 2).toLowerCase() as Lang;
  return (LANGS as readonly string[]).includes(two) ? two : 'en';
}

/** Prioridad en la web: los clásicos con dibujo real (+3) y, entre ellos, los
 *  multiarticulares (+2 más): una sesión de empuje empieza por un press, no
 *  por dos aperturas. */
const COMPOUND = /press|squat|deadlift|row|pull|chin|dip|lunge|step|thrust|bridge|hack/i;
const TRICEPS = /tricep|dip|skull|french|kickback|pushdown|extension|close-grip|close grip/i;
/** Sin gimnasio: nada de máquinas, poleas ni barras fijas. */
const NEEDS_GYM = /machine|smith|cable|pulley|pulldown|pull down|leg curl|leg press|leg extension|hack|scott|butterfly|lever|hyperextension|roman chair/i;
const NEEDS_BAR = /chin|pull-up|pull up|dip|hanging|muscle.?up|deadhang|l hold|ring|braced|weighted|plate/i;
/** Demasiado técnico para quien no ha dicho su nivel. */
const TOO_HARD = /handstand|pistol|muscle.?up|snatch|snach|clean|turkish/i;
let PREFER: Record<string, number> = {};
/** Un básico de aislamiento por grupo (+2,5): cada grupo = un multiarticular +
 *  un aislamiento, no dos variantes del mismo press. */
const ISOLATION = new Set(['lateral_raises', 'hammercurls', 'leg_curls_laying', 'crunches', 'fly_with_dumbbells', 'tricep_dumbbell_kickback']);
/** Los más conocidos de cada grupo (+1): lo que un principiante reconoce. */
const STAPLES = new Set([
  'incline_bench_press', 'incline_dumbbell_press', 'shoulder_press_dumbbells', 'lateral_raises', 'push_ups',
  'pull_ups', 'chin_ups', 'rowing_seated', 'rowing_t_bar', 'biceps_curls_with_barbell', 'hammercurls',
  'back_squat', 'romanian_deadlift', 'leg_press', 'leg_curls_laying', 'crunches', 'side_plank',
]);

export default function WebPlanner() {
  return (
    <ThemeProvider themeId="night">
      <Planner />
    </ThemeProvider>
  );
}

function Planner() {
  const { t, i18n } = useTranslation();
  const { p } = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 960;
  const lang = i18n.language as Lang;
  const [exercises] = useState(() => loadExercises());
  const byId = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  if (!Object.keys(PREFER).length) {
    for (const e of exercises) {
      if (photosFor(e.id).kind === 'drawing')
        PREFER[e.id] = 3 + (COMPOUND.test(e.name_en) ? 2 : 0) + (STAPLES.has(e.id) ? 1 : 0) + (ISOLATION.has(e.id) ? 2.5 : 0);
    }
  }

  const [focus, setFocus] = useState<Focus>('push');
  const [goal, setGoal] = useState<Goal>('build_muscle');
  const [duration, setDuration] = useState(45);
  const [mode, setMode] = useState<EquipmentMode>('full_gym');
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    void loadFonts();
    setLanguage(browserLang());
  }, []);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = lang;
    document.title = `FitTrack · ${t('qs_title')}`;
  }, [lang, t]);

  // Tras crear la primera sesión, en pantalla ancha cada respuesta la
  // actualiza al momento (se ve al lado). En móvil la sesión queda debajo:
  // se quita y el botón la vuelve a crear (y baja hasta ella).
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setPlan((prev) => (prev && wide ? build([]) : null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, goal, duration, mode]);

  // Brazos según el día: en empuje, tríceps; en tirón, bíceps (como en un
  // gimnasio de verdad). Dentro de cada grupo, el multiarticular primero.
  const build = (exclude: string[]) => {
    const prefer = { ...PREFER };
    for (const e of exercises) {
      if (e.muscle_group !== 'arms') continue;
      const tri = TRICEPS.test(e.name_en);
      if ((focus === 'push' && !tri) || (focus === 'pull' && tri)) prefer[e.id] = (prefer[e.id] || 0) - 6;
    }
    const plan = generateWorkout({
      groups: FOCUS_GROUPS[focus],
      equipment_mode: mode,
      duration_min: duration,
      experience: 'intermediate',
      // Los clásicos con dibujo real primero: reconocibles y con imagen en cada fila.
      prefer,
      intensity: 'moderate',
      goal,
      exercises,
      // La web no pregunta el nivel: nada avanzado (pinos, muscle-ups…), y sin
      // gimnasio nada que necesite máquina; sin material, tampoco barra fija.
      exclude_ids: [
        ...exclude,
        ...exercises
          .filter(
            (e) =>
              e.level === 'advanced' ||
              TOO_HARD.test(e.name_en) ||
              (mode !== 'full_gym' && (NEEDS_GYM.test(e.name_en) || e.equipment === 'machine' || e.equipment === 'cable')) ||
              (mode === 'bodyweight' && NEEDS_BAR.test(e.name_en)),
          )
          .map((e) => e.id),
      ],
    });
    const groupOf = (id: string) => byId.get(id)?.muscle_group || '';
    const isCompound = (id: string) => COMPOUND.test(byId.get(id)?.name_en || '');
    const order = FOCUS_GROUPS[focus];
    plan.exercises = plan.exercises
      .map((x, i) => ({ x, i }))
      .sort((a, b) =>
        order.indexOf(groupOf(a.x.exercise_id)) - order.indexOf(groupOf(b.x.exercise_id)) ||
        Number(isCompound(b.x.exercise_id)) - Number(isCompound(a.x.exercise_id)) ||
        a.i - b.i,
      )
      .map(({ x }) => x);
    return plan;
  };
  const create = (exclude: string[] = []) => {
    setPlan(build(exclude));
    // En móvil las preguntas se pliegan en un resumen: se vuelve arriba.
    if (!wide) setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 30);
  };

  const focusLabel = (f: Focus) => (f === 'full' ? t('group_full_body') : splitLabel(FOCUS_GROUPS[f], t));
  const detailEx = detail ? byId.get(detail) ?? null : null;

  const form = (
    <View style={[styles.form, wide && { width: 440 }]}>
      <Text style={[styles.h1, { color: p.text }, wide && styles.h1Wide]} accessibilityRole="header">
        {t('qs_title')}
      </Text>
      <Text style={[styles.tagline, { color: p.secondary }]}>{t('web_tagline')}</Text>

      <Question label={t('web_q_focus')}>
        {FOCI.map((f) => (
          <Chip key={f} label={focusLabel(f)} on={focus === f} onPress={() => setFocus(f)} />
        ))}
      </Question>
      <Question label={t('web_q_goal')}>
        {GOALS.map((g) => (
          <Chip key={g} label={t(`goal_${g}`)} on={goal === g} onPress={() => setGoal(g)} />
        ))}
      </Question>
      <Question label={t('gen_duration')}>
        {DURATIONS.map((d) => (
          <Chip key={d} label={`${d} min`} on={duration === d} onPress={() => setDuration(d)} />
        ))}
      </Question>
      <Question label={t('web_q_equipment')}>
        {MODES.map((m) => (
          <Chip key={m} label={t(`web_eq_${m}`)} on={mode === m} onPress={() => setMode(m)} />
        ))}
      </Question>

      {wide && plan ? null : (
      <Pressable
        accessibilityRole="button"
        onPress={() => create()}
        style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
          styles.primary,
          { backgroundColor: p.accent, opacity: pressed ? 0.85 : hovered ? 0.92 : 1 },
        ]}
      >
        <Text style={[styles.primaryText, { color: p.onAccent }]}>{t('web_create')}</Text>
      </Pressable>
      )}
    </View>
  );

  // Pantalla ancha sin sesión todavía: la columna derecha ya existe (sin
  // saltos de diseño) con un estado vacío sereno: tres dibujos y una frase.
  const empty = wide && !plan ? (
    <View style={[styles.result, styles.empty, { flex: 1, marginLeft: 48, marginTop: 0, borderColor: p.border }]}>
      <View style={styles.emptyArt} accessibilityElementsHidden>
        {['back_squat', 'incline_bench_press', 'pull_ups'].map((id) => (
          <ExerciseThumb key={id} id={id} group="legs" size={120} color={p.dim} />
        ))}
      </View>
      <Text style={[styles.emptyText, { color: p.secondary }]}>{t('web_empty')}</Text>
    </View>
  ) : null;

  // Si todas las series y descansos son iguales, se dice una vez arriba.
  const schemes = plan ? [...new Set(plan.exercises.map((x) => `${x.sets} × ${x.reps} · ${t('web_rest', { s: x.rest_sec })}`))] : [];
  const sameScheme = schemes.length === 1 ? schemes[0] : null;

  const result = plan ? (
    <View
      style={[styles.result, wide ? { flex: 1, marginLeft: 48, marginTop: 0 } : null, { borderColor: p.border, backgroundColor: p.card }]}
      accessibilityLiveRegion="polite"
    >
      {/* Móvil: las preguntas se pliegan y "Cambiar" vive junto al título.
          Ancho: lo elegido ya se ve a la izquierda; aquí solo series y descanso. */}
      <View style={styles.resultHead}>
        <Text style={[styles.resultTitle, { color: p.text, flex: 1 }]} accessibilityRole="header">
          {focusLabel(focus)}
        </Text>
        {!wide ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setPlan(null)}
            style={({ pressed }) => [styles.change, { borderColor: p.border, opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={[styles.changeText, { color: p.text }]}>{t('home_change_split')}</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={[styles.resultMeta, { color: p.secondary }]}>
        {(wide
          ? [sameScheme]
          : [t(`goal_${goal}`), `${plan.estimated_duration_min || duration} min`, t(`web_eq_${mode}`), sameScheme]
        ).filter(Boolean).join(' · ')}
      </Text>
      {plan.exercises.map((x, i) => {
        const e = byId.get(x.exercise_id);
        if (!e) return null;
        const cardio = e.muscle_group === 'cardio';
        return (
          <Pressable
            key={x.exercise_id}
            accessibilityRole="button"
            accessibilityLabel={`${i + 1}. ${exName(e, lang)}. ${t('web_tap_hint')}`}
            onPress={() => setDetail(x.exercise_id)}
            style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
              styles.row,
              { borderTopColor: p.border, backgroundColor: hovered ? 'rgba(255,255,255,0.05)' : 'transparent', opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={[styles.glyph, { borderColor: p.border }]} accessibilityElementsHidden>
              <ExerciseThumb id={e.id} group={e.muscle_group} size={56} color={p.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowName, { color: p.text }]} numberOfLines={2}>
                {exName(e, lang)}
              </Text>
              {/* Series y descanso: si son iguales en todos, ya están arriba (una vez). */}
              {cardio || !sameScheme ? (
                <Text style={[styles.rowSets, { color: p.secondary }]}>
                  {cardio ? `${Math.max(10, Math.round(duration / 3))} min` : `${x.sets} × ${x.reps} · ${t('web_rest', { s: x.rest_sec })}`}
                </Text>
              ) : null}
            </View>
            <Chevron color={p.secondary} />
          </Pressable>
        );
      })}
      {/* El consejo del peso solo si hay algo que cargar. */}
      {mode !== 'bodyweight' ? (
        <Text style={[styles.tip, { color: p.secondary, borderTopColor: p.border }]}>{t('web_weight_tip')}</Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => create(plan.exercises.map((x) => x.exercise_id))}
        style={({ pressed }) => [styles.secondary, { borderColor: p.border, opacity: pressed ? 0.6 : 1 }]}
      >
        <Text style={[styles.secondaryText, { color: p.text }]}>{t('web_again')}</Text>
      </Pressable>
    </View>
  ) : null;

  return (
    <View style={[styles.root, { backgroundColor: p.bg }]}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
        <View style={[styles.page, { maxWidth: wide ? 1120 : 560 }]}>
          {/* Cabecera: marca a la izquierda, idioma a la derecha */}
          <View style={styles.header}>
            {/* Marca: el icono (círculo de "serie hecha") + el nombre, igual que en el móvil. */}
            <View style={styles.brandRow} accessibilityRole="header">
              <Image source={BRAND_ICON} style={styles.brandIcon} accessibilityIgnoresInvertColors />
              <Text style={[styles.brand, { color: p.text }]}>FitTrack</Text>
            </View>
            <View style={styles.langs} accessibilityRole="radiogroup" accessibilityLabel={t('profile_language')}>
              {LANGS.slice()
                .sort((a, b) => ['es', 'en', 'nl', 'fr'].indexOf(a) - ['es', 'en', 'nl', 'fr'].indexOf(b))
                .map((l) => (
                  <Pressable
                    key={l}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: lang === l }}
                    accessibilityLabel={l.toUpperCase()}
                    onPress={() => setLanguage(l)}
                    style={({ pressed }) => [styles.lang, { opacity: pressed ? 0.6 : 1 }]}
                  >
                    <Text style={[styles.langText, { color: lang === l ? p.text : p.dim, fontWeight: lang === l ? '800' : '600' }]}>
                      {l.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
            </View>
          </View>

          <View style={wide ? styles.columns : null}>
            {!wide && plan ? null : form}
            {result ?? empty}
          </View>

          {/* Créditos: dibujos de Everkinetic con licencia CC BY-SA 3.0, modificados
              (el enlace lleva a la lista de originales, fuentes y cambios). */}
          <View style={styles.footerWrap}>
            <Text style={[styles.footer, { color: p.dim }]}>{t('web_footer')}</Text>
            <View style={styles.footerLinks}>
              {[
                [t('web_footer_drawings'), DRAWINGS_CREDITS],
                [t('credits_license_link'), CC_BY_SA_3],
              ].map(([label, url]) => (
                <Pressable key={url} accessibilityRole="link" onPress={() => void Linking.openURL(url).catch(() => undefined)} style={styles.footerLink}>
                  <Text style={[styles.footer, { color: p.secondary, textDecorationLine: 'underline', marginTop: 0 }]}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      {detailEx ? <ExerciseHowTo exercise={detailEx} onClose={() => setDetail(null)} /> : null}
    </View>
  );
}

function Question({ label, children }: { label: string; children: React.ReactNode }) {
  const { p } = useTheme();
  return (
    <View style={styles.q} accessibilityRole="radiogroup" accessibilityLabel={label}>
      <Text style={[styles.qLabel, { color: p.secondary }]}>{label}</Text>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const { p } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: on }}
      onPress={onPress}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.chip,
        {
          backgroundColor: on ? p.accent : hovered ? 'rgba(255,255,255,0.06)' : 'transparent',
          borderColor: on ? p.accent : p.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <Text style={[styles.chipText, { color: on ? p.onAccent : p.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center' },
  page: { width: '100%', paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, paddingBottom: 8 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 30, height: 30, borderRadius: 7 },
  brand: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  langs: { flexDirection: 'row' },
  lang: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  langText: { fontSize: 14, letterSpacing: 0.5 },
  columns: { flexDirection: 'row', alignItems: 'flex-start' },
  form: { width: '100%' },
  h1: { fontSize: 34, fontWeight: '800', letterSpacing: -0.8, marginTop: 16 },
  h1Wide: { fontSize: 44, marginTop: 28 },
  tagline: { fontSize: 17, lineHeight: 24, marginTop: 8 },
  q: { marginTop: 24 },
  qLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontSize: 15, fontWeight: '600' },
  primary: { marginTop: 32, minHeight: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  primaryText: { fontSize: 17, fontWeight: '800' },
  result: { marginTop: 16, borderWidth: 1, borderRadius: 20, padding: 20 },
  resultTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, lineHeight: 30 },
  resultMeta: { fontSize: 15, marginTop: 4, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 76, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderRadius: 8 },
  glyph: { width: 64, height: 64, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  rowName: { fontSize: 16, fontWeight: '700' },
  rowSets: { fontSize: 14, marginTop: 2, fontVariant: ['tabular-nums'] },
  tip: { fontSize: 14, lineHeight: 20, paddingTop: 14, marginTop: 4, borderTopWidth: StyleSheet.hairlineWidth },
  secondary: { marginTop: 16, minHeight: 48, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: 16, fontWeight: '700' },
  empty: { alignItems: 'center', justifyContent: 'center', minHeight: 520, borderStyle: 'dashed' },
  emptyArt: { flexDirection: 'row', gap: 16, opacity: 0.9 },
  emptyText: { fontSize: 17, marginTop: 28, textAlign: 'center', maxWidth: 360, lineHeight: 24 },
  resultHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  change: { minHeight: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  changeText: { fontSize: 15, fontWeight: '700' },
  footerWrap: { marginTop: 40, alignItems: 'center' },
  footer: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 16 },
  footerLink: { minHeight: 44, justifyContent: 'center' },
});
