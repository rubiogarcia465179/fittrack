import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
// SafeAreaView de react-native está obsoleto: se usa react-native-safe-area-context.
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANG_KEY, type Lang, setLanguage } from './src/i18n';
import { loadExercises, type Exercise } from './src/data';
import { store, backupFileName, type Backup, type Session, type BenchmarkRef, type Profile } from './src/store';
import { sortByDate, uid, todayISO } from './src/lib/gym';
import { ThemeProvider, useTheme } from './src/theme-context';
import { RADII, THEME_IDS, type ThemeId } from './src/theme';
import { COUNTRY_BY_CODE, type CountryCode } from './src/theme-flags';
import { newActiveSession, type ActiveSession, type ActiveDraftExercise } from './src/lib/session';
import { generateWorkout, recentRows, weightForExercise, type WorkoutPlan } from './src/lib/workout';
import { effectiveRecords, recordsAsBenchmarks, BENCHMARK_TEST } from './src/lib/records';
import { progressionFor } from './src/lib/progression';
import type { Goal, Intensity } from './src/lib/types';
import { QuickStartSheet, type QuickStartOptions } from './src/components/QuickStartSheet';
import TabIcon from './src/components/TabIcon';
import { Gradient } from './src/components/Gradient';
import DashboardScreen from './src/screens/DashboardScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import { ExerciseHowTo } from './src/components/ExerciseHowTo';
import SessionScreen from './src/screens/SessionScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SessionStartScreen from './src/screens/SessionStartScreen';
import { loadFonts, MONT } from './src/lib/fonts';
import { nextSplit, mondayPushSkipped } from './src/lib/nextSplit';
import { BackBar } from './src/components/BackBar';
import { saveHomePhoto } from './src/lib/homePhoto';
import { saveBackupFile } from './src/lib/backupFile';
import { cancelRestAlert } from './src/lib/restAlert';
import { currentExerciseId } from './src/lib/merged-ids';

// 3 pestañas (Inicio · Entrenar · Perfil). Historial y Ejercicios se abren
// desde Inicio como pantallas con "atrás" (no son pestañas).
type Tab = 'dashboard' | 'library' | 'session' | 'history' | 'profile';
const TABS: Tab[] = ['dashboard', 'session', 'profile'];
const ACTIVE_KEY = 'fittrack.active.v1';
const QS_KEY = 'fittrack.quickstart.v1';
const THEME_KEY = 'fittrack.theme.v1';
const NAT_KEY = 'fittrack.nationality.v1';
const FLAG_KEY = 'fittrack.themeflag.v1';

export default function App() {
  // La sesión activa ES la fuente del tema: debe vivir por encima del
  // ThemeProvider, así que App mantiene el estado y Root (dentro del
  // provider) dibuja la UI.
  const [active, setActive] = useState<ActiveSession | null>(null);
  const persistActive = (a: ActiveSession | null) => {
    setActive(a);
    if (a) void AsyncStorage.setItem(ACTIVE_KEY, JSON.stringify(a));
    else {
      void AsyncStorage.removeItem(ACTIVE_KEY);
      void cancelRestAlert(); // sin entreno no hay descanso que avisar
    }
  };
  const [tab, setTab] = useState<Tab>('dashboard');
  // UN solo lenguaje de diseño en toda la app; el usuario elige el tema en
  // Perfil (Noche por defecto). Se recuerda en AsyncStorage.
  const [themeId, setThemeId] = useState<ThemeId>('night');
  useEffect(() => {
    void AsyncStorage.getItem(THEME_KEY).then((v) => {
      if (v && (THEME_IDS as string[]).includes(v)) setThemeId(v as ThemeId);
    });
  }, []);
  const pickTheme = (id: ThemeId) => {
    setThemeId(id);
    void AsyncStorage.setItem(THEME_KEY, id);
  };
  // Nacionalidad (opcional) y, aparte, si se usa su bandera como tema.
  const [nationality, setNationality] = useState<CountryCode | null>(null);
  const [useFlag, setUseFlag] = useState(false);
  useEffect(() => {
    void AsyncStorage.multiGet([NAT_KEY, FLAG_KEY]).then((kv) => {
      const nat = kv[0][1];
      if (nat && COUNTRY_BY_CODE.has(nat as CountryCode)) setNationality(nat as CountryCode);
      setUseFlag(kv[1][1] === '1');
    });
  }, []);
  const pickNationality = (c: CountryCode) => {
    setNationality(c);
    void AsyncStorage.setItem(NAT_KEY, c);
  };
  const toggleFlag = (on: boolean) => {
    setUseFlag(on);
    void AsyncStorage.setItem(FLAG_KEY, on ? '1' : '0');
  };
  const effectiveTheme = useFlag && nationality ? `flag:${nationality}` : themeId;
  return (
    <SafeAreaProvider>
    <ThemeProvider themeId={effectiveTheme}>
      <Root
        active={active}
        persistActive={persistActive}
        tab={tab}
        setTab={setTab}
        themeId={themeId}
        onPickTheme={pickTheme}
        nationality={nationality}
        onPickNationality={pickNationality}
        useFlag={useFlag}
        onToggleFlag={toggleFlag}
      />
    </ThemeProvider>
    </SafeAreaProvider>
  );
}

function Root({
  active,
  persistActive,
  tab,
  setTab,
  themeId,
  onPickTheme,
  nationality,
  onPickNationality,
  useFlag,
  onToggleFlag,
}: {
  active: ActiveSession | null;
  persistActive: (a: ActiveSession | null) => void;
  tab: Tab;
  setTab: (t: Tab) => void;
  themeId: ThemeId;
  onPickTheme: (id: ThemeId) => void;
  nationality: CountryCode | null;
  onPickNationality: (c: CountryCode) => void;
  useFlag: boolean;
  onToggleFlag: (on: boolean) => void;
}) {
  const { t } = useTranslation();
  const { p, GRADIENT } = useTheme();

  // R-19: Montserrat se carga al montar; cuando está lista, la raíz aplica la
  // familia (se hereda a todo el texto en web).
  const [fontReady, setFontReady] = useState(false);
  useEffect(() => {
    loadFonts().then(() => setFontReady(true));
  }, []);
  // Historial abierto desde un día del calendario: solo ese día.
  const [histDate, setHistDate] = useState<string | null>(null);
  const [lng, setLng] = useState<Lang>('es');
  const [exercises] = useState<Exercise[]>(() => loadExercises());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkRef[]>([]);
  // Perfil (datos fijos): el asistente lo usa como valores por defecto.
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    void store.profile().then(setProfile);
  }, []);
  const [detailId, setDetailId] = useState<string | null>(null);
  // Feedback de éxito que sobrevive a que el guardado descarta la pantalla
  // (Task 1: la acción de guardar SIEMPRE deja constancia visible).
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flash = (msg: string) => {
    setToast(msg);
    AccessibilityInfo.announceForAccessibility?.(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2800);
  };

  // Carga inicial: sesiones + benchmarks + sesión activa persistida + idioma.
  useEffect(() => {
    (async () => {
      const [ss, bm, act, saved] = await Promise.all([
        store.sessions(),
        store.benchmarks(),
        AsyncStorage.getItem(ACTIVE_KEY),
        AsyncStorage.getItem(LANG_KEY),
      ]);
      setSessions(sortByDate(ss));
      setBenchmarks(bm);
      if (act) {
        try {
          const a = JSON.parse(act) as ActiveSession;
          if (a && Array.isArray(a.draft)) {
            // Ejercicios fusionados (R-119): el entreno en curso sigue al que queda.
            const seen = new Set<string>();
            a.draft = a.draft
              .map((d) => ({ ...d, exercise_id: currentExerciseId(d.exercise_id) }))
              .filter((d) => (seen.has(d.exercise_id) ? false : (seen.add(d.exercise_id), true)));
            a.postponed = (a.postponed || []).map((x) => ({ ...x, exercise_id: currentExerciseId(x.exercise_id) }));
            persistActive(a);
          }
        } catch {
          /* datos corruptos: se ignora */
        }
      }
      if (saved && ['nl', 'es', 'en', 'fr'].includes(saved)) {
        setLng(saved as Lang);
        setLanguage(saved as Lang);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickLang = (l: Lang) => {
    setLng(l);
    setLanguage(l);
    void AsyncStorage.setItem(LANG_KEY, l);
  };

  // Plan generado -> entrenamiento activo (tareas 2/3A/4 + R-17).
  const startWorkout = (
    plan: WorkoutPlan,
    type: 'training' | 'benchmark',
    opts: { intensity?: Intensity; energy?: number } = {},
  ) => {
    const today = todayISO();
    const draft: ActiveDraftExercise[] = plan.exercises.map((x) => {
      const cardio = exercises.find((e) => e.id === x.exercise_id)?.muscle_group === 'cardio';
      // Progresión (B): con histórico manda lo que levantaste de verdad. Si
      // completaste todas las reps, +2,5 kg; con energía baja, el mismo peso.
      const prog = cardio || type === 'benchmark' ? null : progressionFor(x.exercise_id, sessions, x.reps, today);
      const easy = opts.intensity === 'low';
      const w = prog ? (easy ? prog.from : prog.to) : x.recommended_weight_kg;
      return {
        exercise_id: x.exercise_id,
        // Cardio (Fase 12) se registra por tiempo: un bloque de 20 min moderados.
        sets: cardio
          ? [{ reps: 0, weight_kg: 0, duration_min: 20, intensity: 'moderate' as const }]
          : Array.from({ length: x.sets }, () => ({ reps: x.reps, weight_kg: w })),
        equipment_status: 'available' as const,
        rest_after: x.rest_sec,
        ...(prog && !easy ? { progress: prog } : {}),
      };
    });
    // Marcas efectivas (test + mejores series): sirven para pesos y récords en directo.
    const a = newActiveSession({ type, equipment_mode: plan.equipment_mode, benchmarks: effBench }, todayISO, uid);
    a.draft = draft;
    if (opts.energy) a.energy = opts.energy;
    persistActive(a);
  };

  // R-14: sesión en blanco (el usuario añade los ejercicios a mano).
  const startManualSession = () => {
    const a = newActiveSession({ type: 'training', equipment_mode: 'full_gym', benchmarks: effBench }, todayISO, uid);
    a.draft = [];
    persistActive(a);
  };

  // Main → "Empezar sesión": UN toque. Entreno recomendado con el objetivo y
  // nivel del Perfil, para el bloque de grupos que hace más tiempo que no
  // entrenas (empuje / tirón / pierna). Sin pasos intermedios.
  // "Empezar sesión" abre primero la hoja (tiempo · intensidad · energía ·
  // objetivo); "Continuar al entreno" genera el plan. Se recuerda la última
  // elección (AsyncStorage) y, si no hay, se parte del Perfil.
  const [qsOpen, setQsOpen] = useState(false);
  const [qs, setQs] = useState<QuickStartOptions>({ duration: 45, intensity: 'moderate', energy: 'normal', goal: 'build_muscle' });
  useEffect(() => {
    void AsyncStorage.getItem(QS_KEY).then((raw) => {
      if (raw) {
        try {
          setQs((q) => ({ ...q, ...(JSON.parse(raw) as Partial<QuickStartOptions>) }));
          return;
        } catch {
          /* datos corruptos: se ignoran */
        }
      }
      if (profile?.goal) setQs((q) => ({ ...q, goal: profile.goal as Goal }));
    });
  }, [profile?.goal]);
  // "Hoy toca": propuesta por defecto + "Cambiar" (un toque, sin menús).
  const [splitSkip, setSplitSkip] = useState(0);
  const todaySplit = useMemo(
    () => nextSplit(sessions, new Map(exercises.map((e) => [e.id, e.muscle_group])), splitSkip),
    [sessions, exercises, splitSkip],
  );
  const openQuickStart = () => {
    if (active) {
      setTab('session');
      return;
    }
    setQsOpen(true);
  };

  /** La hoja trabaja sobre una copia: solo "Continuar" aplica y guarda la elección. */
  const quickStart = (qs: QuickStartOptions) => {
    setQs(qs);
    setQsOpen(false);
    void AsyncStorage.setItem(QS_KEY, JSON.stringify(qs));
    // Energía baja → un nivel menos de intensidad (nunca por debajo de suave).
    const order: Intensity[] = ['low', 'moderate', 'high'];
    const intensity = qs.energy === 'low' ? order[Math.max(0, order.indexOf(qs.intensity) - 1)] : qs.intensity;
    const split = todaySplit;
    setSplitSkip(0);
    const plan = generateWorkout({
      groups: split,
      equipment_mode: 'full_gym',
      duration_min: qs.duration,
      experience: profile?.experience || 'intermediate',
      intensity,
      goal: qs.goal,
      benchmarks: effBench,
      exercises,
      recent: recentRows(sessions),
    });
    // Energía de la hoja de inicio → escala 1–5 de la valoración (no se repregunta).
    const energy = qs.energy === 'low' ? 2 : qs.energy === 'high' ? 4 : 3;
    startWorkout(plan, 'training', { intensity, energy });
    setTab('session');
  };

  // Marcas efectivas: test de marcas + mejores series de las sesiones.
  const isCardioId = (id: string) => exercises.find((e) => e.id === id)?.muscle_group === 'cardio';
  const effBench = useMemo(
    () => recordsAsBenchmarks(effectiveRecords(sessions, benchmarks, isCardioId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessions, benchmarks, exercises],
  );

  // "Establecer marcas" (desde Perfil): sesión benchmark con los 5 clásicos
  // (BENCHMARK_TEST). Cada uno: calentamiento ligero (10 reps al 60 %) +
  // serie de test (8 reps al peso recomendado). Al guardar, el 1RM estimado
  // de cada ejercicio pasa a ser la marca.
  const startBenchmark = () => {
    if (active) {
      setTab('session');
      return;
    }
    const ids = BENCHMARK_TEST;
    const recent = recentRows(sessions);
    const round25 = (v: number) => Math.max(0, Math.round(v / 2.5) * 2.5);
    const draft: ActiveDraftExercise[] = ids
      .map((id) => exercises.find((e) => e.id === id))
      .filter((e): e is Exercise => !!e)
      .map((e) => {
        const w = weightForExercise(e, { benchmarks: effBench, recent, reps: 8 })?.weight_kg ?? 0;
        return {
          exercise_id: e.id,
          sets: [
            { reps: 10, weight_kg: round25(w * 0.6) },
            // "Tantas como puedas": las reps las apunta el usuario (nada supuesto).
            { reps: 0, weight_kg: w },
          ],
          equipment_status: 'available' as const,
          rest_after: 120,
        };
      });
    const a = newActiveSession({ type: 'benchmark', equipment_mode: 'full_gym', benchmarks: effBench }, todayISO, uid);
    a.draft = draft;
    persistActive(a);
    setTab('session');
  };

  const handleSaved = (s: Session) => {
    setSessions((prev) => sortByDate([s, ...prev]));
    // Al guardar, el entrenamiento activo termina: de vuelta al modo normal.
    persistActive(null);
    flash(t(s.type === 'benchmark' ? 'bench_saved' : 'sess_saved'));
    // El orgullo cae donde vive el progreso: Inicio (día marcado, marcas al día).
    setTab('dashboard');
    if (s.type === 'benchmark') {
      void store.benchmarks().then(setBenchmarks);
    }
  };

  const handleDeleted = async (id: string) => {
    await store.deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };
  // Copia de seguridad completa a un archivo y su restauración (Fase 16).
  const handleBackup = async () => saveBackupFile(backupFileName(), await store.backupJson());
  const handleRestore = async (b: Backup) => {
    const n = await store.restore(b);
    handleDataChanged();
    void store.profile().then(setProfile);
    return n;
  };
  const handleClearAll = async () => {
    await store.clearAll();
    // "Todos los datos" incluye la foto personal de Inicio.
    await saveHomePhoto(null);
    setSessions([]);
    setBenchmarks([]);
    persistActive(null);
  };
  const handleDataChanged = () => {
    void Promise.all([store.sessions(), store.benchmarks()]).then(([ss, bm]) => {
      setSessions(sortByDate(ss));
      setBenchmarks(bm);
    });
  };


  const openExercise = (id: string) => setDetailId(id);
  const detail = detailId ? exercises.find((e) => e.id === detailId) || exercises[0] : null;
  const handleDiscard = (quiet?: boolean) => {
    persistActive(null);
    if (!quiet) flash(t('sess_discarded'));
    setTab('dashboard');
  };

  // Fondo premium: la sesión activa pinta un degradado navy profundo en
  // TODA la app (reconocible al instante); la pestaña Perfil usa un crema
  // sutil. El resto usa el color plano de la paleta.
  const bgColors = GRADIENT.bg;

  return (
    <SafeAreaView
      style={[
        styles.safe,
        {
          backgroundColor: p.bg,
          // R-19: familia global. En web se hereda a todo el texto por CSS.
          fontFamily: fontReady ? MONT : 'system',
        } as any,
      ]}
    >
      {bgColors ? <Gradient colors={bgColors} style={styles.appBg} /> : null}
      <StatusBar style={p.statusBar} />
      {/* Sin barra de marca global: como en las apps de iPhone, cada pantalla
          abre con su propio título grande. El idioma vive en Perfil. */}

      <View style={styles.body}>
        {toast ? (
          <View style={[styles.appToast, { backgroundColor: p.card, borderColor: p.border }]}>
            <Text style={[styles.appToastText, { color: p.text }]}>{toast}</Text>
          </View>
        ) : null}
        <View style={styles.wideWrap}>
          <View style={styles.wideInner}>
            {tab === 'dashboard' ? (
              <DashboardScreen
                exercises={exercises}
                sessions={sessions}
                benchmarks={benchmarks}
                activeWorkout={active != null}
                onStartSession={openQuickStart}
                todayGroups={todaySplit}
                todayMeta={`${t(`goal_${qs.goal}`)} · ${qs.duration} min`}
                mondayNote={splitSkip === 0 && sessions.length > 0 && /* primer arranque: un solo mensaje */ mondayPushSkipped(sessions, new Map(exercises.map((e) => [e.id, e.muscle_group])))}
                onChangeSplit={() => setSplitSkip((n) => n + 1)}
                onOpenHistory={(d) => {
                  setHistDate(d || null);
                  setTab('history');
                }}
                onOpenLibrary={() => setTab('library')}
                onStartBenchmark={startBenchmark}
              />
            ) : tab === 'library' ? (
              <View style={{ flex: 1 }}>
                <BackBar label={t('nav_dashboard')} onBack={() => setTab('dashboard')} />
                <LibraryScreen exercises={exercises} onOpenExercise={openExercise} />
              </View>
            ) : tab === 'session' ? (
              active ? (
                <SessionScreen
                  exercises={exercises}
                  sessions={sessions}
                  session={active}
                  onSessionChange={persistActive}
                  onSaved={handleSaved}
                  onDiscard={handleDiscard}
                />
              ) : (
                <SessionStartScreen
                  onRecommend={() => setQsOpen(true)}
                  onManual={startManualSession}
                />
              )
            ) : tab === 'history' ? (
              <View style={{ flex: 1 }}>
                <BackBar label={t('nav_dashboard')} onBack={() => setTab('dashboard')} />
                <HistoryScreen
                  sessions={sessions}
                  exercises={exercises}
                  onDeleted={handleDeleted}
                  onUpdated={(ns) => setSessions((list) => list.map((x) => (x.id === ns.id ? ns : x)))}
                  onOpenExercise={openExercise}
                  onStartSession={openQuickStart}
                  focusDate={histDate}
                  onClearFocus={() => setHistDate(null)}
                />
              </View>
            ) : (
              <ProfileScreen
                sessions={sessions}
                onHeightLogged={() => {}}
                lng={lng}
                onPickLang={pickLang}
                onBackup={handleBackup}
                onRestore={handleRestore}
                onClearAll={handleClearAll}
                onDataChanged={handleDataChanged}
                onProfileChanged={setProfile}
                themeId={themeId}
                onPickTheme={onPickTheme}
              />
            )}
          </View>
        </View>
      </View>

      {/* Barra inferior estilo X (iOS): ancho completo, negra, línea fina
          arriba, solo iconos (el nombre va en accessibilityLabel). El activo
          en blanco; el resto en gris. */}
      <View
        accessibilityRole="tablist"
        style={[styles.tabbar, { backgroundColor: p.tabBarBg, borderTopColor: p.border }]}
      >
        {TABS.map((tb) => {
          // Historial/Ejercicios cuelgan de Inicio: Inicio sigue marcado.
          const isActive = !detail && (tab === tb || (tb === 'dashboard' && (tab === 'history' || tab === 'library')));
          const label = t(`nav_${tb}`);
          return (
            <Pressable
              key={tb}
              style={({ pressed }) => [styles.tab, { opacity: pressed ? 0.6 : 1 }]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={label}
              onPress={() => {
                setDetailId(null);
                setTab(tb);
              }}
            >
              <View style={styles.tabIconWrap} accessibilityElementsHidden>
                <TabIcon name={tb} color={p.text} bg={p.tabBarBg} active={isActive} />
                {tb === 'session' && active ? <View style={[styles.activeDot, { backgroundColor: p.accent, borderColor: p.bg }]} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      {/* Un ejercicio se ve siempre igual: la hoja "¿Cómo se hace?" (R-118). */}
      {detail ? <ExerciseHowTo exercise={detail} onClose={() => setDetailId(null)} /> : null}
      {qsOpen ? (
        <QuickStartSheet value={qs} onCancel={() => setQsOpen(false)} onContinue={quickStart} />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  appBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  appToast: {
    position: 'absolute',
    bottom: 16, // abajo, sobre la barra (no tapa títulos)
    // Ancho completo con los márgenes de la app y fondo opaco: nada asoma detrás.
    left: 16,
    right: 16,
    borderRadius: RADII.card,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    zIndex: 50,
  },
  appToastText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  body: {
    flex: 1,
  },
  wideWrap: {
    flex: 1,
    alignItems: 'center',
  },
  wideInner: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    flex: 1,
  },
  tabbar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    position: 'absolute',
    top: 8,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
  },

});
