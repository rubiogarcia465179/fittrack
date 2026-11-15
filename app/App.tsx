import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANG_KEY, type Lang, setLanguage } from './src/i18n';
import { loadExercises, type Exercise } from './src/data';
import { store, type Session, type BenchmarkRef, type Profile } from './src/store';
import { sortByDate, uid, todayISO } from './src/lib/gym';
import { ThemeProvider, useTheme } from './src/theme-context';
import { RADII, THEME_IDS, type ThemeId } from './src/theme';
import { COUNTRY_BY_CODE, type CountryCode } from './src/theme-flags';
import { newActiveSession, type ActiveSession, type ActiveDraftExercise } from './src/lib/session';
import { generateWorkout, recentRows, type WorkoutPlan } from './src/lib/workout';
import type { Goal, Intensity } from './src/lib/types';
import { QuickStartSheet, type QuickStartOptions } from './src/components/QuickStartSheet';
import TabIcon from './src/components/TabIcon';
import { Gradient } from './src/components/Gradient';
import DashboardScreen from './src/screens/DashboardScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import DetailScreen from './src/screens/DetailScreen';
import SessionScreen from './src/screens/SessionScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SessionStartScreen from './src/screens/SessionStartScreen';
import { loadFonts, MONT } from './src/lib/fonts';
import { nextSplit } from './src/lib/nextSplit';
import { BackBar } from './src/components/BackBar';

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
    else void AsyncStorage.removeItem(ACTIVE_KEY);
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
          if (a && Array.isArray(a.draft)) persistActive(a);
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
  const startWorkout = (plan: WorkoutPlan, type: 'training' | 'benchmark') => {
    const draft: ActiveDraftExercise[] = plan.exercises.map((x) => ({
      exercise_id: x.exercise_id,
      // Cardio (Fase 12) se registra por tiempo: un bloque de 20 min moderados.
      sets: exercises.find((e) => e.id === x.exercise_id)?.muscle_group === 'cardio'
        ? [{ reps: 0, weight_kg: 0, duration_min: 20, intensity: 'moderate' as const }]
        : Array.from({ length: x.sets }, () => ({
            reps: x.reps,
            weight_kg: x.recommended_weight_kg,
          })),
      equipment_status: 'available' as const,
      rest_after: x.rest_sec,
    }));
    const a = newActiveSession({ type, equipment_mode: plan.equipment_mode, benchmarks }, todayISO, uid);
    a.draft = draft;
    persistActive(a);
  };

  // R-14: sesión en blanco (el usuario añade los ejercicios a mano).
  const startManualSession = () => {
    const a = newActiveSession({ type: 'training', equipment_mode: 'full_gym', benchmarks }, todayISO, uid);
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
  const openQuickStart = () => {
    if (active) {
      setTab('session');
      return;
    }
    setQsOpen(true);
  };

  const quickStart = () => {
    setQsOpen(false);
    void AsyncStorage.setItem(QS_KEY, JSON.stringify(qs));
    // Energía baja → un nivel menos de intensidad (nunca por debajo de suave).
    const order: Intensity[] = ['low', 'moderate', 'high'];
    const intensity = qs.energy === 'low' ? order[Math.max(0, order.indexOf(qs.intensity) - 1)] : qs.intensity;
    const split = nextSplit(sessions, new Map(exercises.map((e) => [e.id, e.muscle_group])));
    const plan = generateWorkout({
      groups: split,
      equipment_mode: 'full_gym',
      duration_min: qs.duration,
      experience: profile?.experience || 'intermediate',
      intensity,
      goal: qs.goal,
      benchmarks,
      exercises,
      recent: recentRows(sessions),
    });
    startWorkout(plan, 'training');
    setTab('session');
  };

  const handleSaved = (s: Session) => {
    setSessions((prev) => sortByDate([s, ...prev]));
    // Al guardar, el entrenamiento activo termina: de vuelta al modo normal.
    persistActive(null);
    flash(t(s.type === 'benchmark' ? 'bench_saved' : 'sess_saved') + ' ✓');
    if (s.type === 'benchmark') {
      void store.benchmarks().then(setBenchmarks);
    }
  };

  const handleDeleted = async (id: string) => {
    await store.deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };
  const handleExport = () => store.toJson();
  const handleClearAll = async () => {
    await store.clearAll();
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

  // Benchmarks con nombres para la UI.
  const benchNamed = useMemo(() => {
    const byId = new Map(exercises.map((e) => [e.id, e]));
    return benchmarks.map((b) => {
      const e = byId.get(b.exercise_id);
      return {
        name_en: e?.name_en || b.exercise_id,
        name_nl: e?.name_nl || b.exercise_id,
        name_es: e?.name_es,
        name_fr: e?.name_fr,
        estimated_1rm: b.estimated_1rm,
      };
    });
  }, [benchmarks, exercises]);

  const openExercise = (id: string) => setDetailId(id);
  const detail = detailId ? exercises.find((e) => e.id === detailId) || exercises[0] : null;
  const handleDiscard = () => {
    persistActive(null);
    flash(t('sess_discarded'));
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
          <View style={[styles.appToast, { backgroundColor: p.headerBg, borderColor: p.border }]}>
            <Text style={[styles.appToastText, { color: p.text }]}>{toast}</Text>
          </View>
        ) : null}
        <View style={styles.wideWrap}>
          <View style={styles.wideInner}>
            {detail ? (
              <DetailScreen exercise={detail} onBack={() => setDetailId(null)} />
            ) : tab === 'dashboard' ? (
              <DashboardScreen
                exercises={exercises}
                sessions={sessions}
                benchmarks={benchNamed}
                activeWorkout={active != null}
                onStartSession={openQuickStart}
                onOpenHistory={(d) => {
                  setHistDate(d || null);
                  setTab('history');
                }}
                onOpenLibrary={() => setTab('library')}
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
                onExport={handleExport}
                onClearAll={handleClearAll}
                onDataChanged={handleDataChanged}
                onProfileChanged={setProfile}
                themeId={themeId}
                onPickTheme={onPickTheme}
                nationality={nationality}
                onPickNationality={onPickNationality}
                useFlag={useFlag}
                onToggleFlag={onToggleFlag}
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
      {qsOpen ? (
        <QuickStartSheet value={qs} onChange={setQs} onCancel={() => setQsOpen(false)} onContinue={quickStart} />
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
    left: '50%',
    transform: [{ translateX: -140 }],
    width: 280,
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
