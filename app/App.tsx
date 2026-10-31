import { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANG_KEY, type Lang, setLanguage } from './src/i18n';
import { loadExercises, type Exercise } from './src/data';
import { store, type Session } from './src/store';
import { sortByDate } from './src/lib/gym';
import { COLORS } from './src/theme';
import LangSwitcher from './src/components/LangSwitcher';
import DashboardScreen from './src/screens/DashboardScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import DetailScreen from './src/screens/DetailScreen';
import SessionScreen from './src/screens/SessionScreen';
import HistoryScreen from './src/screens/HistoryScreen';

type Tab = 'dashboard' | 'library' | 'session' | 'history';

const TAB_ICONS: Record<Tab, string> = {
  dashboard: '📊',
  library: '🏋️',
  session: '➕',
  history: '🕘',
};

export default function App() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [lng, setLng] = useState<Lang>('es');
  const [exercises] = useState<Exercise[]>(() => loadExercises());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);

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

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('app_name')}</Text>
          <Text style={styles.tagline}>{t('tagline')}</Text>
        </View>
        <LangSwitcher lng={lng} onPick={pickLang} />
      </View>

      <View style={styles.body}>
        {detail ? (
          <DetailScreen exercise={detail} onBack={() => setDetailId(null)} />
        ) : tab === 'dashboard' ? (
          <DashboardScreen
            exercises={exercises}
            sessions={sessions}
            onOpenExercise={openExercise}
            onOpenHistory={() => setTab('history')}
          />
        ) : tab === 'library' ? (
          <LibraryScreen exercises={exercises} onOpenExercise={openExercise} />
        ) : tab === 'session' ? (
          <SessionScreen exercises={exercises} onSaved={handleSaved} />
        ) : (
          <HistoryScreen
            sessions={sessions}
            exercises={exercises}
            onDeleted={handleDeleted}
            onOpenExercise={openExercise}
          />
        )}
      </View>

      <View style={styles.tabbar}>
        {(Object.keys(TAB_ICONS) as Tab[]).map((tb) => (
          <TouchableOpacity
            key={tb}
            style={[styles.tab, tab === tb && !detail && styles.tabActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: tab === tb }}
            onPress={() => {
              setDetailId(null);
              setTab(tb);
            }}
          >
            <Text style={styles.tabIcon}>{TAB_ICONS[tb]}</Text>
            <Text style={[styles.tabLabel, tab === tb && styles.tabLabelActive]}>
              {t(`nav_${tb === 'library' ? 'exercises' : tb}`)}
            </Text>
          </TouchableOpacity>
        ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: COLORS.text,
  },
  tagline: {
    fontSize: 12,
    color: COLORS.dim,
    marginTop: 2,
  },
  body: {
    flex: 1,
  },
  tabbar: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 8 : 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabActive: {
    // resalto sutil del icono
  },
  tabIcon: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.dim,
    marginTop: 2,
  },
  tabLabelActive: {
    color: COLORS.blue,
    fontWeight: '600',
  },
});
