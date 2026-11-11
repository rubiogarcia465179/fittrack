/**
 * Pestaña "Perfil" — datos que evolucionan lentamente en el tiempo
 * (peso corporal y altura). El usuario los registra SI QUIERE:
 * - Peso: se anota al iniciar/guardar una sesión (y aquí se ve la tendencia).
 * - Altura: se registra desde aquí (y opcionalmente en la sesión).
 * Si no los usa, la pestaña simplemente queda vacía, sin forzar nada.
 */
import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Session } from '../store';
import { store, type ProfileEntry } from '../store';
import { latestWeight, todayISO } from '../lib/gym';
import { useTheme } from '../theme-context';
import { useScale, fs } from '../scale';
import { fmtDay } from './SessionScreen';
import { PickerSheet, fmtNum } from '../components/PickerSheet';

/** Máximo nº de barras de tendencia (los últimos registros). */
const TREND_MAX = 8;

export default function ProfileScreen({
  sessions,
  onHeightLogged,
}: {
  sessions: Session[]; // recientes primero
  onHeightLogged: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { p, SHADOW } = useTheme();
  const scale = useScale();
  const lang = i18n.language as string;

  const [heights, setHeights] = useState<ProfileEntry[]>([]);
  const [pickHeight, setPickHeight] = useState(false);

  useEffect(() => {
    void store.heightHistory().then(setHeights);
  }, []);

  const weight = latestWeight(sessions);
  const weightTrend = useMemo(
    () =>
      sessions
        .filter((s) => s.body_weight_kg != null && s.body_weight_kg > 0)
        .slice(0, TREND_MAX)
        .reverse()
        .map((s) => ({ label: fmtDay(s.date, lang), value: s.body_weight_kg as number })),
    [sessions, lang],
  );
  const heightTrend = useMemo(() => heights.slice(0, TREND_MAX).map((h) => ({ label: fmtDay(h.date, lang), value: h.value })), [heights]);

  const bmi = weight && heights.length > 0 ? weight / Math.pow(heights[0].value / 100, 2) : null;

  const confirmHeight = (v: number) => {
    setPickHeight(false);
    void store.logHeight(v, todayISO()).then(() => {
      setHeights((prev) =>
        [
          { date: todayISO(), value: v },
          ...prev.filter((h) => h.date !== todayISO()),
        ].sort((a, b) => (a.date < b.date ? 1 : -1)),
      );
      onHeightLogged();
    });
  };

  return (
    <ScrollView contentContainerStyle={[styles.body, { backgroundColor: 'transparent' }]}>
      <Text style={[styles.title, { fontSize: fs(scale, 30), color: p.text }]} numberOfLines={1}>
        {t('profile_title')}
      </Text>
      <Text style={[styles.sub, { color: p.secondary }]}>{t('profile_sub')}</Text>

      {/* ---- Peso corporal (de las sesiones) ---- */}
      <View style={[styles.card, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card }]}>
        <Text style={[styles.cardLabel, { color: p.secondary }]}>{t('profile_bodyweight')}</Text>
        <View style={styles.cardValueRow}>
          <Text style={[styles.bigValue, { color: p.text }]} numberOfLines={1}>
            {weight ? `${fmtNum(weight)} kg` : '—'}
          </Text>
          {bmi ? (
            <View style={[styles.bmiChip, { backgroundColor: p.section }]}>
              <Text style={[styles.bmiText, { color: p.secondary }]}>
                {t('profile_bmi')} ≈ {Math.round(bmi * 10) / 10}
              </Text>
            </View>
          ) : null}
        </View>
        {weightTrend.length >= 2 ? (
          <TrendCard title={t('profile_trend')} data={weightTrend} unit="kg" p={p} />
        ) : (
          <Text style={[styles.empty, { color: p.dim }]}>{t('profile_empty_weight')}</Text>
        )}
      </View>

      {/* ---- Altura (registrada desde aquí) ---- */}
      <View style={[styles.card, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, { color: p.secondary }]}>{t('profile_height')}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('profile_pick_height')}
            onPress={() => setPickHeight(true)}
            style={({ pressed }) => [
              styles.logBtn,
              {
                backgroundColor: p.accent,
                opacity: pressed ? 0.85 : 1,
                transition: 'opacity 90ms ease',
              },
            ]}
          >
            <Text style={styles.logBtnText}>+ {t('profile_log')}</Text>
          </Pressable>
        </View>
        <Text style={[styles.bigValue, { color: p.text }]} numberOfLines={1}>
          {heights.length > 0 ? `${fmtNum(heights[0].value)} cm` : '—'}
        </Text>
        {heightTrend.length >= 2 ? (
          <TrendCard title={t('profile_trend')} data={heightTrend} unit="cm" p={p} />
        ) : (
          <Text style={[styles.empty, { color: p.dim }]}>{t('profile_empty_height')}</Text>
        )}
      </View>

      {pickHeight ? (
        <PickerSheet
          open
          title={t('profile_pick_height')}
          unit="cm"
          values={[150, 155, 160, 165, 170, 175, 180, 185, 190]}
          value={heights[0]?.value ?? 0}
          custom={{ min: 100, max: 230, step: 1 }}
          labelCustom={t('other_value')}
          labelUse={t('use_value')}
          onSelect={() => undefined}
          onConfirm={confirmHeight}
        />
      ) : null}
    </ScrollView>
  );
}

/** Mini-tendencia: barras verticales (los últimos registros, de izquierda a
 *  derecha: pasado -> presente). */
function TrendCard({
  title,
  data,
  unit,
  p,
}: {
  title: string;
  data: { label: string; value: number }[];
  unit: string;
  p: import('../theme').Palette;
}) {
  const max = data.reduce((m, d) => Math.max(m, d.value), 0);
  const min = data.reduce((m, d) => Math.min(m, d.value), Infinity);
  const span = Math.max(1, max - min);
  return (
    <View style={styles.trendWrap}>
      <Text style={[styles.trendTitle, { color: p.dim }]}>{title}</Text>
      <View style={styles.trendRow}>
        {data.map((d, i) => {
          const pct = 0.25 + 0.75 * ((d.value - min) / span);
          const isLast = i === data.length - 1;
          return (
            <View key={i} style={styles.trendCol}>
              <View style={styles.trendBarTrack}>
                <View
                  style={[
                    styles.trendBar,
                    { height: `${Math.round(pct * 100)}%`, backgroundColor: isLast ? p.accent : p.border },
                  ]}
                  accessibilityElementsHidden
                />
              </View>
              <Text style={[styles.trendVal, { color: isLast ? p.text : p.dim }]} numberOfLines={1}>
                {fmtNum(d.value)}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={styles.trendDates}>
        {data.map((d, i) => (
          <Text key={i} style={[styles.trendDate, { color: p.dim }]} numberOfLines={1}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: 20,
    paddingBottom: 28,
    gap: 14,
  },
  title: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: -8,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bigValue: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  bmiChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bmiText: {
    fontSize: 12,
    fontWeight: '700',
  },
  empty: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 2,
  },
  logBtn: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  logBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  trendWrap: {
    marginTop: 8,
    gap: 4,
  },
  trendTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 72,
    gap: 6,
  },
  trendCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  trendBarTrack: {
    width: '100%',
    maxWidth: 18,
    height: 44,
    justifyContent: 'flex-end',
  },
  trendBar: {
    borderRadius: 6,
  },
  trendVal: {
    fontSize: 10,
    fontWeight: '700',
  },
  trendDates: {
    flexDirection: 'row',
    gap: 6,
  },
  trendDate: {
    flex: 1,
    textAlign: 'center',
    fontSize: 9,
  },
});
