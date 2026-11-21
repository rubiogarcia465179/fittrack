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
import { applyTired, generateWorkout, isBodyweightExercise, movementKey, recentRows, schemeFor, type EquipmentMode, type WorkoutPlan } from '../lib/workout';
import { fmtKg, snapPlan } from '../lib/plates';
import { asSessions, loadLog, type LogEntry } from '../lib/webLog';
import { WebHistory } from './WebHistory';
import { SPLITS, splitLabel } from '../lib/nextSplit';
import { exName } from '../lib/names';
import type { Goal } from '../lib/types';
import { photosFor } from '../exercisePhotos';
import { ExerciseHowTo } from '../components/ExerciseHowTo';
import { ExerciseThumb } from '../components/ExerciseThumb';
import { Chevron } from '../components/Chevron';
import { WebSession } from './WebSession';
import { fitToDuration, planMinutes } from '../lib/webFit';
import { exerciseFromRow, startSession, type WsState } from '../lib/webSession';
import { BENCH_CHOICES, benchmarksFromBench, benchOneRm, intensityForLevel, levelFromBench, setsForLevel } from '../lib/benchEstimate';

const BRAND_ICON = require('../../assets/logo-mark.png');

type Focus = 'push' | 'pull' | 'legs' | 'full';
const FOCUS_GROUPS: Record<Focus, string[]> = {
  push: SPLITS[0],
  pull: SPLITS[1],
  legs: SPLITS[2],
  full: ['legs', 'chest', 'back', 'shoulders', 'core'],
};
const FOCI: Focus[] = ['push', 'pull', 'legs', 'full'];
// Varios a la vez (R-166); "Abdominales" (R-165) añade core a cualquier sesión.
const GOALS: Goal[] = ['build_muscle', 'strength', 'lose_fat', 'endurance', 'abs'];
const DURATIONS = [30, 45, 60, 90, 120];
/** "45 min", "1 h 30", "2 h". */
const durLabel = (d: number) => (d < 90 ? `${d} min` : d % 60 ? `${Math.floor(d / 60)} h ${d % 60}` : `${d / 60} h`);
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
  const [goals, setGoals] = useState<Goal[]>(['build_muscle']);
  const toggleGoal = (g: Goal) => setGoals((gs) => (gs.includes(g) ? (gs.length > 1 ? gs.filter((x) => x !== g) : gs) : [...gs, g]));
  // R-168: "Cansadísimo" — ligero al principio, el peso sube poco a poco.
  const [tired, setTired] = useState(false);
  // R-169: historial pegado de WhatsApp (solo en este navegador).
  const [log, setLog] = useState<LogEntry[]>(() => loadLog());
  const [historyOpen, setHistoryOpen] = useState(false);
  // Logo durante la sesión: avisa a la sesión para que pida terminar.
  const [exitSignal, setExitSignal] = useState(0);
  const [duration, setDuration] = useState(45);
  const [mode, setMode] = useState<EquipmentMode>('full_gym');
  // R-150: la web no tiene historial; el press de banca (peso para 8 reps)
  // da el nivel y los pesos de toda la sesión. null = "No lo sé" (sin pesos).
  const [bench, setBench] = useState<number | null>(null);
  const loads = mode !== 'bodyweight' && bench != null;
  const level = loads ? levelFromBench(benchOneRm(bench!)) : null;
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  // R-152: la sesión en marcha (solo web, en memoria: no se guarda nada).
  const [running, setRunning] = useState<WsState | null>(null);
  const cardioMin = Math.max(10, Math.round(duration / 3));
  const start = () => {
    if (!plan) return;
    setRunning(
      startSession(
        plan.exercises,
        (id) => {
          const e = byId.get(id);
          return { cardio: e?.muscle_group === 'cardio', bodyweight: !e || isBodyweightExercise(e) };
        },
        cardioMin,
        Date.now(),
      ),
    );
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: false }), 0);
  };
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
  }, [focus, goals, tired, duration, mode, bench]);

  // Brazos según el día: en empuje, tríceps; en tirón, bíceps (como en un
  // gimnasio de verdad). Dentro de cada grupo, el multiarticular primero.
  const build = (exclude: string[]) => {
    const prefer = { ...PREFER };
    for (const e of exercises) {
      if (e.muscle_group !== 'arms') continue;
      const tri = TRICEPS.test(e.name_en);
      if ((focus === 'push' && !tri) || (focus === 'pull' && tri)) prefer[e.id] = (prefer[e.id] || 0) - 6;
    }
    // Mismas reglas para la sesión base y para cada ejercicio extra.
    const genOpts = (extraExclude: string[]) => ({
      groups: FOCUS_GROUPS[focus],
      equipment_mode: mode,
      experience: level ?? 'intermediate',
      // Marcas estimadas desde la banca → peso recomendado en cada ejercicio con carga.
      benchmarks: loads ? benchmarksFromBench(bench!, exercises, isBodyweightExercise) : undefined,
      // Los clásicos con dibujo real primero: reconocibles y con imagen en cada fila.
      prefer,
      intensity: level ? intensityForLevel(level) : ('moderate' as const),
      goals,
      // Historial importado de WhatsApp → pesos de lo que ya hiciste.
      recent: log.length ? recentRows(asSessions(log)) : undefined,
      exercises,
      // La web no pregunta el nivel: nada avanzado (pinos, muscle-ups…), y sin
      // gimnasio nada que necesite máquina; sin material, tampoco barra fija.
      exclude_ids: [
        ...exclude,
        ...extraExclude,
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
    const plan = generateWorkout(genOpts([]));
    const order = plan.muscle_groups;
    const groupOf = (id: string) => byId.get(id)?.muscle_group || '';
    const isCompound = (id: string) => COMPOUND.test(byId.get(id)?.name_en || '');
    const isCardio = (id: string) => groupOf(id) === 'cardio';
    // Series según el nivel (principiante una menos, avanzado una más).
    const scheme = schemeFor(goals);
    const baseSets = level ? setsForLevel(scheme.sets, level) : scheme.sets;
    plan.exercises = plan.exercises.map((x) => ({ ...x, sets: baseSets }));
    // R-153: ejercicios, series y descansos caben en el tiempo elegido (máximo).
    plan.exercises = fitToDuration(plan.exercises, duration, {
      isCardio,
      cardioMin,
      baseSets,
      groupOf,
      // Otro ejercicio: del grupo con menos ejercicios y que no repita movimiento.
      more: (taken) => {
        const keys = new Set(taken.map((id) => movementKey(byId.get(id)!)));
        const cands = generateWorkout(genOpts(taken)).exercises.filter((x) => !keys.has(movementKey(byId.get(x.exercise_id)!)));
        const n = (g: string) => taken.filter((id) => groupOf(id) === g).length;
        return cands.sort((a, b) => n(groupOf(a.exercise_id)) - n(groupOf(b.exercise_id)))[0] ?? null;
      },
    }) as typeof plan.exercises;
    plan.exercises = plan.exercises
      .map((x, i) => ({ x, i }))
      .sort((a, b) =>
        order.indexOf(groupOf(a.x.exercise_id)) - order.indexOf(groupOf(b.x.exercise_id)) ||
        Number(isCompound(b.x.exercise_id)) - Number(isCompound(a.x.exercise_id)) ||
        a.i - b.i,
      )
      .map(({ x }) => x);
    // Cansadísimo: rampa sobre el orden final; luego, pesos que existen (R-171).
    if (tired) plan.exercises = applyTired(plan.exercises);
    plan.exercises = snapPlan(plan.exercises, (id) => byId.get(id));
    plan.tired = tired || undefined;
    plan.estimated_duration_min = Math.round(planMinutes(plan.exercises, isCardio, cardioMin));
    return plan;
  };
  const create = (exclude: string[] = []) => {
    setPlan(build(exclude));
    // En móvil las preguntas se pliegan en un resumen: se vuelve arriba.
    if (!wide) setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 30);
  };

  const stickyCreate = !wide && !plan && !running;
  const goHome = () => {
    if (running) {
      setExitSignal((n) => n + 1);
      return;
    }
    setPlan(null);
    setDetail(null);
    setHistoryOpen(false);
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 0);
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
      <Question label={t('web_q_goal')} hint={t('web_q_goal_hint')} multi>
        {GOALS.map((g) => (
          <Chip key={g} label={t(`goal_${g}`)} on={goals.includes(g)} onPress={() => toggleGoal(g)} multi />
        ))}
      </Question>
      <Question label={t('gen_duration')}>
        {DURATIONS.map((d) => (
          <Chip key={d} label={durLabel(d)} on={duration === d} onPress={() => setDuration(d)} />
        ))}
      </Question>
      <Question label={t('web_q_equipment')}>
        {MODES.map((m) => (
          <Chip key={m} label={t(`web_eq_${m}`)} on={mode === m} onPress={() => setMode(m)} />
        ))}
      </Question>
      {/* Sin historial: una pregunta da el nivel y los pesos (solo si hay carga). */}
      {mode !== 'bodyweight' ? (
        <Question label={t('web_q_bench')} hint={t('web_q_bench_hint')}>
          <Chip label={t('web_bench_unknown')} on={bench == null} onPress={() => setBench(null)} />
          {BENCH_CHOICES.map((kg) => (
            <Chip key={kg} label={`${kg} kg`} on={bench === kg} onPress={() => setBench(kg)} />
          ))}
        </Question>
      ) : null}

      {/* Un solo interruptor: casi siempre es "normal"; se marca solo el día que hace falta. */}
      <Question label={t('web_q_today')} hint={tired ? t('web_tired_hint') : undefined} multi>
        <Chip label={t('web_today_tired')} on={tired} onPress={() => setTired((v) => !v)} multi />
      </Question>

      {/* Móvil: el botón vive fijo abajo (siempre a la vista); aquí solo en ancho. */}
      {(wide && plan) || !wide ? null : (
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
      {/* R-169: historial con WhatsApp (pegar la conversación). */}
      <Pressable
        accessibilityRole="button"
        onPress={() => setHistoryOpen(true)}
        style={({ pressed }) => [styles.histLink, { opacity: pressed ? 0.6 : 1 }]}
      >
        <Text style={[styles.histText, { color: p.secondary }]}>
          {log.length ? t('wa_history_n', { count: log.length }) : t('wa_history_link')}
        </Text>
      </Pressable>
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
          ? [tired ? t('web_today_tired') : null, level ? t(`level_${level}`) : null, sameScheme]
          : [goals.map((g) => t(`goal_${g}`)).join(' + '), tired ? t('web_today_tired') : null, level ? t(`level_${level}`) : null, durLabel(plan.estimated_duration_min || duration), t(`web_eq_${mode}`), sameScheme]
        ).filter(Boolean).join(' · ')}
      </Text>
      {plan.exercises.map((x, i) => {
        const e = byId.get(x.exercise_id);
        if (!e) return null;
        const cardio = e.muscle_group === 'cardio';
        // Peso recomendado (desde la banca); en mancuernas, por mano.
        const kg = x.recommended_weight_kg > 0 ? (e.equipment === 'dumbbell' ? t('web_kg_hand', { kg: fmtKg(x.recommended_weight_kg, lang) }) : `${fmtKg(x.recommended_weight_kg, lang)} kg`) : null;
        const line = cardio ? `${cardioMin} min` : [sameScheme ? null : `${x.sets} × ${x.reps} · ${t('web_rest', { s: x.rest_sec })}`, kg].filter(Boolean).join(' · ');
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
              {line ? (
                <Text style={[styles.rowSets, { color: kg && sameScheme ? p.text : p.secondary }]}>{line}</Text>
              ) : null}
            </View>
            <Chevron color={p.secondary} />
          </Pressable>
        );
      })}
      {/* El consejo del peso solo si hay algo que cargar. */}
      {mode !== 'bodyweight' ? (
        <Text style={[styles.tip, { color: p.secondary, borderTopColor: p.border }]}>{t(loads ? 'web_weight_tip_bench' : 'web_weight_tip')}</Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => create(plan.exercises.map((x) => x.exercise_id))}
        style={({ pressed }) => [styles.secondary, { borderColor: p.border, opacity: pressed ? 0.6 : 1 }]}
      >
        <Text style={[styles.secondaryText, { color: p.text }]}>{t('web_again')}</Text>
      </Pressable>
      {/* Seguir la sesión de verdad: tiempo, series hechas y descansos (R-152). */}
      <Pressable
        accessibilityRole="button"
        onPress={start}
        style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
          styles.primary,
          { marginTop: 12, backgroundColor: p.accent, opacity: pressed ? 0.85 : hovered ? 0.92 : 1 },
        ]}
      >
        <Text style={[styles.primaryText, { color: p.onAccent }]}>{t('web_start')}</Text>
      </Pressable>
    </View>
  ) : null;

  return (
    <View style={[styles.root, { backgroundColor: p.bg }]}>
      <ScrollView ref={scrollRef} contentContainerStyle={[styles.scroll, stickyCreate && { paddingBottom: 96 }]}>
        <View style={[styles.page, { maxWidth: wide ? 1120 : 560 }]}>
          {/* Cabecera: marca a la izquierda, idioma a la derecha */}
          {/* En la sesión, la pantalla entera es para entrenar (R-160): sin cabecera. */}
          {running ? null : (
          <View style={styles.header}>
            {/* Marca: el icono (círculo de "serie hecha") + el nombre, igual que en el móvil. */}
            {/* R-157: logo y nombre = volver al inicio (en la sesión, pide terminar). */}
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`FitTrack. ${t('web_home')}`}
              onPress={goHome}
              style={({ pressed }) => [styles.brandRow, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Image source={BRAND_ICON} style={styles.brandIcon} accessibilityIgnoresInvertColors />
              <Text style={[styles.brand, { color: p.text }]}>FitTrack</Text>
            </Pressable>
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
          )}

          {running ? (
            <WebSession
              initial={running}
              byId={byId}
              onExit={() => setRunning(null)}
              onNew={() => {
                setRunning(null);
                setPlan(null);
              }}
              exitSignal={exitSignal}
              onLog={setLog}
              onTop={() => setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: false }), 0)}
              onExtra={(taken) => {
                // Un ejercicio más, con las mismas reglas (grupo con menos, sin repetir movimiento).
                const keys = new Set(taken.map((id) => movementKey(byId.get(id)!)));
                const cand = build(taken).exercises.find((x) => !taken.includes(x.exercise_id) && !keys.has(movementKey(byId.get(x.exercise_id)!)));
                if (!cand) return null;
                const e = byId.get(cand.exercise_id);
                return exerciseFromRow(cand, () => ({ cardio: e?.muscle_group === 'cardio', bodyweight: !e || isBodyweightExercise(e) }), cardioMin);
              }}
            />
          ) : (
          <View style={wide ? styles.columns : null}>
            {!wide && plan ? null : form}
            {result ?? empty}
          </View>
          )}

          {/* Créditos: dibujos de Everkinetic con licencia CC BY-SA 3.0, modificados
              (el enlace lleva a la lista de originales, fuentes y cambios). */}
          {running ? null : (
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
          )}
        </View>
      </ScrollView>
      {/* Móvil: "Crear entreno" fijo abajo — la acción principal siempre visible (Fase 25). */}
      {stickyCreate ? (
        <View style={[styles.sticky, { backgroundColor: p.bg, borderTopColor: p.border }]}>
          <Pressable
            accessibilityRole="button"
            onPress={() => create()}
            style={({ pressed }) => [styles.primary, { marginTop: 0, width: '100%', maxWidth: 520, backgroundColor: p.accent, opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={[styles.primaryText, { color: p.onAccent }]}>{t('web_create')}</Text>
          </Pressable>
        </View>
      ) : null}
      {historyOpen ? <WebHistory log={log} exercises={exercises} onChange={setLog} onClose={() => setHistoryOpen(false)} /> : null}
      {detailEx ? <ExerciseHowTo exercise={detailEx} onClose={() => setDetail(null)} /> : null}
    </View>
  );
}

function Question({ label, hint, children, multi }: { label: string; hint?: string; children: React.ReactNode; multi?: boolean }) {
  const { p } = useTheme();
  return (
    <View style={styles.q} accessibilityRole={multi ? undefined : 'radiogroup'} accessibilityLabel={hint ? `${label}. ${hint}` : label}>
      <Text style={[styles.qLabel, { color: p.secondary }, hint ? { marginBottom: 4 } : null]}>{label}</Text>
      {/* Aclaración opcional (p. ej. la banca: solo es una estimación para ajustar la sesión). */}
      {hint ? <Text style={[styles.qHint, { color: p.secondary }]}>{hint}</Text> : null}
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

function Chip({ label, on, onPress, multi }: { label: string; on: boolean; onPress: () => void; multi?: boolean }) {
  const { p } = useTheme();
  return (
    <Pressable
      accessibilityRole={multi ? 'checkbox' : 'radio'}
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
  brandIcon: { width: 34, height: 34, borderRadius: 8 },
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
  qHint: { fontSize: 15, lineHeight: 21, marginBottom: 12 },
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
  sticky: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, borderTopWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  histLink: { minHeight: 44, alignSelf: 'center', justifyContent: 'center', marginTop: 8, paddingHorizontal: 12 },
  histText: { fontSize: 15, fontWeight: '600', textDecorationLine: 'underline' },
  footer: { fontSize: 12, lineHeight: 18, textAlign: 'center' },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 16 },
  footerLink: { minHeight: 44, justifyContent: 'center', maxWidth: '100%', flexShrink: 1 },
});
