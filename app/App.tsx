import { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANG_KEY, type Lang, setLanguage } from './src/i18n';
import { loadExercises, type Exercise } from './src/data';
import { store, type Session } from './src/store';
import { sortByDate } from './src/lib/gym';
import { COLORS } from './src/theme';
import { useWide } from './src/scale';
import TabIcon from './src/components/TabIcon';
import LangSwitcher from './src/components/LangSwitcher';
import DashboardScreen from './src/screens/DashboardScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import DetailScreen from './src/screens/DetailScreen';
import SessionScreen from './src/screens/SessionScreen';
import HistoryScreen from './src/screens/HistoryScreen';

type Tab = 'dashboard' | 'library' | 'session' | 'history';

const TABS: Tab[] = ['dashboard', 'library', 'session', 'history'];

export default function App() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [lng, setLng] = useState<Lang>('es');
  const [exercises] = useState<Exercise[]>(() => loadExercises());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  // Pantalla ancha (tablet / horizontal / PC): el contenido se centra con un
  // ancho máximo — la app conserva su maquetación de móvil, más cómoda de leer.
  const wide = useWide();

  // Carga inicial: sesiones + idioma persistido.
  useEffect(() => {
    (async () => {
      setSessions(sortByDate(await store.sessions()));
      const saved = await AsyncStorage.getItem(LANG_KEY);
      if (saved && ['nl', 'es', 'en', 'fr'].includes(saved)) {
        setLng(saved as Lang);
        setLanguage(saved as Lang);
      }
    })();
  }, []);

  const pickLang = (l: Lang) => {
    setLng(l);
    setLanguage(l);
    void AsyncStorage.setItem(LANG_KEY, l);
  };

  const openExercise = (id: string) => setDetailId(id);
  const detail = useMemo(
    () => (detailId ? exercises.find((e) => e.id === detailId) || null : null),
    [detailId, exercises],
  );

  const handleSaved = (s: Session) => setSessions((prev) => sortByDate([s, ...prev]));
  const handleDeleted = async (id: string) => {
    await store.deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };
  // Export / borrado total (pestaña Resumen).
  const handleExport = () => store.toJson();
  const handleClearAll = async () => {
    await store.clearAll();
    setSessions([]);
  };
  const handleDataChanged = () => {
    void store.sessions().then((x) => setSessions(sortByDate(x)));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {/* Header 48px, estilo nav de apple.com. En pantallas de móvil el
          tagline no cabe junto a wordmark + selector de idioma (medido:
          se recortaba en todos los iPhone), así que solo se muestra en
          anchos ≥ 480px (tablet/landscape). */}
      <View style={styles.header}>
        <View style={styles.wordmarkRow}>
          <Text style={styles.wordmark}>
            Fit<Text style={styles.wordmarkAccent}>Track</Text>
          </Text>
          {wide ? (
            <Text style={styles.tagline} numberOfLines={1} adjustsFontSizeToFit>
              {t('tagline')}
            </Text>
          ) : null}
        </View>
        <LangSwitcher lng={lng} onPick={pickLang} />
      </View>

      <View style={styles.body}>
        <View style={styles.wideWrap}>
          <View style={styles.wideInner}>
            {detail ? (
              <DetailScreen exercise={detail} onBack={() => setDetailId(null)} />
            ) : tab === 'dashboard' ? (
          <DashboardScreen
            exercises={exercises}
            sessions={sessions}
            onOpenExercise={openExercise}
            onOpenHistory={() => setTab('history')}
            onStartSession={() => setTab('session')}
            onExport={handleExport}
            onClearAll={handleClearAll}
            onDataChanged={handleDataChanged}
          />
        ) : tab === 'library' ? (
          <LibraryScreen exercises={exercises} onOpenExercise={openExercise} />
        ) : tab === 'session' ? (
          <SessionScreen exercises={exercises} sessions={sessions} onSaved={handleSaved} />
        ) : (
          <HistoryScreen
            sessions={sessions}
            exercises={exercises}
            onDeleted={handleDeleted}
            onOpenExercise={openExercise}
            onStartSession={() => setTab('session')}
          />
        )}
          </View>
        </View>
      </View>

      {/* Tabbar: SafeAreaView ya añade el inset inferior (home indicator);
          se reduce el padding extra en iOS para no tapar el indicador. */}
      <View style={styles.tabbar}>
        {TABS.map((tb) => {
          const active = tab === tb && !detail;
          return (
            <TouchableOpacity
              key={tb}
              style={[styles.tab, active && styles.tabActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              activeOpacity={0.5}
              onPress={() => {
                setDetailId(null);
                setTab(tb);
              }}
            >
              <TabIcon name={tb} color={active ? COLORS.blue : COLORS.dim} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {t(`nav_${tb === 'library' ? 'exercises' : tb}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    gap: 8,
    backgroundColor: 'rgba(251, 251, 253, 0.82)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
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
    color: COLORS.text,
  },
  wordmarkAccent: {
    color: COLORS.blue,
  },
  tagline: {
    fontSize: 11,
    color: COLORS.secondary,
    flexShrink: 1,
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
    backgroundColor: 'rgba(251, 251, 253, 0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 0 : 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingTop: 12,
  },
  tabActive: {},
  tabLabel: {
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 2,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: COLORS.blue,
    fontWeight: '600',
  },
});
