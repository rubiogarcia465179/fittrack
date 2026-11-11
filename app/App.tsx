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
import { store, type Session, type BenchmarkRef } from './src/store';
import { sortByDate, uid, todayISO } from './src/lib/gym';
import { ThemeProvider, useTheme } from './src/theme-context';
import { RADII } from './src/theme';
import { useWide } from './src/scale';
import { newActiveSession, type ActiveSession, type ActiveDraftExercise } from './src/lib/session';
import type { WorkoutPlan } from './src/lib/workout';
import TabIcon from './src/components/TabIcon';
import LangSwitcher from './src/components/LangSwitcher';
import { Gradient } from './src/components/Gradient';
import DashboardScreen from './src/screens/DashboardScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import DetailScreen from './src/screens/DetailScreen';
import SessionScreen from './src/screens/SessionScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import WorkoutBuilderScreen from './src/screens/WorkoutBuilderScreen';
import SessionStartScreen from './src/screens/SessionStartScreen';
import { loadFonts, MONT } from './src/lib/fonts';

type Tab = 'dashboard' | 'library' | 'session' | 'history' | 'profile';
const TABS: Tab[] = ['dashboard', 'library', 'session', 'history', 'profile'];
const ACTIVE_KEY = 'fittrack.active.v1';

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
  return (
    <ThemeProvider active={active != null}>
      <Root active={active} persistActive={persistActive} />
    </ThemeProvider>
  );
}

function Root({ active, persistActive }: { active: ActiveSession | null; persistActive: (a: ActiveSession | null) => void }) {
  const { t } = useTranslation();
  const { p, GRADIENT } = useTheme();
  const wide = useWide();

  const [tab, setTab] = useState<Tab>('dashboard');
  // R-19: Montserrat se carga al montar; cuando está lista, la raíz aplica la
  // familia (se hereda a todo el texto en web).
  const [fontReady, setFontReady] = useState(false);
  useEffect(() => {
    loadFonts().then(() => setFontReady(true));
  }, []);
  // R-14: en la pestaña "Sesión", primero se elige el camino
  // (recomendado -> wizard, o manual -> sesión en blanco).
  const [building, setBuilding] = useState(false);
  const [lng, setLng] = useState<Lang>('es');
  const [exercises] = useState<Exercise[]>(() => loadExercises());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkRef[]>([]);
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
      sets: Array.from({ length: x.sets }, () => ({
        reps: x.reps,
        weight_kg: x.recommended_weight_kg,
      })),
      equipment_status: 'available' as const,
      rest_after: x.rest_sec,
    }));
    const a = newActiveSession({ type, equipment_mode: plan.equipment_mode, benchmarks }, todayISO, uid);
    a.draft = draft;
    setBuilding(false);
    persistActive(a);
  };

  // R-14: sesión en blanco (el usuario añade los ejercicios a mano).
  const startManualSession = () => {
    const a = newActiveSession({ type: 'training', equipment_mode: 'full_gym', benchmarks }, todayISO, uid);
    a.draft = [];
    setBuilding(false);
    persistActive(a);
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
  const bgColors = active || tab === 'profile' ? GRADIENT.bg : null;

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
      <View style={[styles.header, { backgroundColor: p.headerBg, borderBottomColor: p.border }]}>
        <View style={styles.wordmarkRow}>
          <Text style={[styles.wordmark, { color: p.text }]}>
            Fit<Text style={[styles.wordmarkAccent, { color: p.accent }]}>Track</Text>
          </Text>
          {wide ? (
            <Text style={[styles.tagline, { color: p.secondary }]} numberOfLines={1} adjustsFontSizeToFit>
              {t('tagline')}
            </Text>
          ) : null}
        </View>
        <LangSwitcher lng={lng} onPick={pickLang} />
      </View>

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
                onOpenExercise={openExercise}
                onOpenHistory={() => setTab('history')}
                onStartSession={() => setTab('session')}
                onStartWorkout={() => setTab('session')}
                onExport={handleExport}
                onClearAll={handleClearAll}
                onDataChanged={handleDataChanged}
              />
            ) : tab === 'library' ? (
              <LibraryScreen exercises={exercises} onOpenExercise={openExercise} />
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
              ) : building ? (
                <WorkoutBuilderScreen
                  exercises={exercises}
                  sessions={sessions}
                  benchmarks={benchmarks}
                  onStarted={startWorkout}
                  onBack={() => setBuilding(false)}
                />
              ) : (
                <SessionStartScreen
                  onRecommend={() => setBuilding(true)}
                  onManual={startManualSession}
                />
              )
            ) : tab === 'history' ? (
              <HistoryScreen
                sessions={sessions}
                exercises={exercises}
                onDeleted={handleDeleted}
                onOpenExercise={openExercise}
                onStartSession={() => setTab('session')}
              />
            ) : (
              <ProfileScreen sessions={sessions} onHeightLogged={() => {}} />
            )}
          </View>
        </View>
      </View>

      <View style={[styles.tabbar, { backgroundColor: p.tabBarBg, borderTopColor: p.border }]}>
        {TABS.map((tb) => {
          const isActive = tab === tb && !detail;
          return (
            <Pressable
              key={tb}
              style={[styles.tab, isActive && styles.tabActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={t(`nav_${tb === 'library' ? 'exercises' : tb}`)}
              onPress={() => {
                setDetailId(null);
                setTab(tb);
              }}
            >
              <View style={styles.tabIconWrap} accessibilityElementsHidden>
                <TabIcon name={tb} color={isActive ? p.accent : p.dim} />
                {tb === 'session' && active ? (
                  <View style={[styles.activeDot, { backgroundColor: '#30D158' }]} />
                ) : null}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? p.accent : p.dim },
                ]}
                numberOfLines={1}
              >
                {t(`nav_${tb === 'library' ? 'exercises' : tb}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    flex: 1,
    overflow: 'hidden',
  },
  wordmark: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.44,
  },
  wordmarkAccent: {},
  tagline: {
    fontSize: 11,
    flexShrink: 1,
  },
  appToast: {
    position: 'absolute',
    top: 10,
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
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: Platform.OS === 'ios' ? 0 : 4,
    height: 60,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  tabActive: {},
  tabIconWrap: {
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  activeDot: {
    position: 'absolute',
    top: -3,
    right: -5,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
});
