/**
 * Pestaña "Perfil" — tus datos y los ajustes.
 *  - Sobre ti (Fase 12): sexo, año de nacimiento, nivel y objetivo. El
 *    asistente de entreno arranca con tu nivel y objetivo.
 *  - Peso corporal (registrable aquí o en la sesión) y altura, con tendencia.
 *  - Calorías diarias: metabolismo basal (Mifflin-St Jeor) × actividad real
 *    de las últimas 4 semanas (`lib/energy.ts`).
 *  - Ajustes: idioma y "Tus datos" (exportar / borrar).
 * Todo es opcional: si no se rellena, la pantalla no fuerza nada.
 */
import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Session } from '../store';
import { store, type Profile, type ProfileEntry, type Sex } from '../store';
import { todayISO, sessionCardioMinutes } from '../lib/gym';
import type { Experience, Goal } from '../lib/types';
import { estimateEnergy, missingForEnergy } from '../lib/energy';
import { useTheme } from '../theme-context';
import { useScale, fs } from '../scale';
import { fmtDay } from './SessionScreen';
import { PickerSheet, fmtNum } from '../components/PickerSheet';
import LangSwitcher from '../components/LangSwitcher';
import { DataSection } from '../components/DataSection';
import type { Lang } from '../i18n';

/** Máximo nº de barras de tendencia (los últimos registros). */
const TREND_MAX = 8;
const SEXES: Sex[] = ['male', 'female', 'other'];
const LEVELS: Experience[] = ['beginner', 'intermediate', 'advanced'];
const GOALS: Goal[] = ['build_muscle', 'strength', 'lose_fat', 'lose_weight', 'definition', 'endurance'];

export default function ProfileScreen({
  sessions,
  onHeightLogged,
  lng,
  onPickLang,
  onExport,
  onClearAll,
  onDataChanged,
  onProfileChanged,
}: {
  sessions: Session[]; // recientes primero
  onHeightLogged: () => void;
  /** Ajustes (antes en la cabecera / el Resumen): idioma y datos. */
  lng: Lang;
  onPickLang: (l: Lang) => void;
  onExport: () => Promise<string>;
  onClearAll: () => Promise<void>;
  onDataChanged: () => void;
  onProfileChanged?: (p: Profile) => void;
}) {
  const { t, i18n } = useTranslation();
  const { p, SHADOW } = useTheme();
  const scale = useScale();
  const lang = i18n.language as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [heights, setHeights] = useState<ProfileEntry[]>([]);
  const [pick, setPick] = useState<'height' | 'weight' | 'birth' | null>(null);

  useEffect(() => {
    void store.profile().then(setProfile);
    void store.heightHistory().then(setHeights);
  }, []);

  const update = (patch: Partial<Profile>) => {
    void store.setProfile(patch).then((np) => {
      setProfile(np);
      onProfileChanged?.(np);
    });
  };

  // Peso: registros del Perfil + peso anotado en sesiones (el más reciente gana).
  const weights = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const s of sessions) if (s.body_weight_kg && s.body_weight_kg > 0) byDate.set(s.date, s.body_weight_kg);
    for (const w of profile?.weight_entries || []) byDate.set(w.date, w.value);
    return [...byDate.entries()].map(([date, value]) => ({ date, value })).sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [sessions, profile]);
  const weight = weights[0]?.value ?? null;
  const height = heights[0]?.value ?? null;
  const weightTrend = useMemo(
    () => weights.slice(0, TREND_MAX).reverse().map((w) => ({ label: fmtDay(w.date, lang), value: w.value })),
    [weights, lang],
  );
  const heightTrend = useMemo(
    () => heights.slice(0, TREND_MAX).reverse().map((h) => ({ label: fmtDay(h.date, lang), value: h.value })),
    [heights, lang],
  );
  const bmi = weight && height ? weight / Math.pow(height / 100, 2) : null;

  // Calorías: actividad real de las últimas 4 semanas.
  const since = todayISO(-27);
  const recent = sessions.filter((s) => s.date >= since);
  const energyInput = {
    weight_kg: weight,
    height_cm: height,
    birth_year: profile?.birth_year,
    sex: profile?.sex,
    sessions_28d: recent.length,
    cardio_min_28d: recent.reduce((a, s) => a + sessionCardioMinutes(s), 0),
  };
  const energy = estimateEnergy(energyInput);
  const missing = missingForEnergy(energyInput).map((m) =>
    m === 'weight' ? t('profile_bodyweight') : m === 'height' ? t('profile_height') : t('profile_birth_year'),
  );

  const confirmPick = (v: number) => {
    const kind = pick;
    setPick(null);
    if (kind === 'height') {
      void store.logHeight(v, todayISO()).then(() => {
        setHeights((prev) =>
          [{ date: todayISO(), value: v }, ...prev.filter((h) => h.date !== todayISO())].sort((a, b) => (a.date < b.date ? 1 : -1)),
        );
        onHeightLogged();
      });
    } else if (kind === 'weight') {
      void store.logWeight(v, todayISO()).then((np) => setProfile(np));
    } else if (kind === 'birth') {
      update({ birth_year: Math.round(v) });
    }
  };

  const card = { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card };
  const year = new Date().getFullYear();

  return (
    <ScrollView contentContainerStyle={[styles.body, { backgroundColor: 'transparent' }]}>
      <Text style={[styles.title, { fontSize: fs(scale, 34), color: p.text }]} numberOfLines={1} accessibilityRole="header">
        {t('profile_title')}
      </Text>
      <Text style={[styles.sub, { color: p.secondary }]}>{t('profile_sub')}</Text>

      {/* ---- Sobre ti ---- */}
      <View style={[styles.card, card]}>
        <Text style={[styles.cardLabel, { color: p.secondary }]}>{t('profile_about')}</Text>
        <Field label={t('profile_sex')}>
          <Seg options={SEXES} value={profile?.sex} labelOf={(s) => t(`sex_${s}`)} onPick={(s) => update({ sex: s })} />
        </Field>
        <Field label={t('profile_birth_year')}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t('profile_birth_year')}: ${profile?.birth_year ?? '—'}`}
            onPress={() => setPick('birth')}
            style={({ pressed }) => [styles.valueBtn, { backgroundColor: p.fieldBg, borderColor: p.border, opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={[styles.valueBtnText, { color: profile?.birth_year ? p.text : p.secondary }]}>
              {profile?.birth_year ? `${profile.birth_year} · ${year - profile.birth_year}` : '—'}
            </Text>
          </Pressable>
        </Field>
        <Field label={t('profile_level')}>
          <Seg options={LEVELS} value={profile?.experience} labelOf={(e) => t(`exp_${e}`)} onPick={(e) => update({ experience: e })} />
        </Field>
        <Field label={t('profile_goal')}>
          <Seg options={GOALS} value={profile?.goal} labelOf={(g) => t(`goal_${g}`)} onPick={(g) => update({ goal: g })} />
        </Field>
      </View>

      {/* ---- Peso corporal ---- */}
      <View style={[styles.card, card]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, { color: p.secondary }]}>{t('profile_bodyweight')}</Text>
          <LogButton label={t('profile_log')} a11y={t('profile_pick_weight')} onPress={() => setPick('weight')} />
        </View>
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
          <Text style={[styles.empty, { color: p.secondary }]}>{t('profile_empty_weight')}</Text>
        )}
      </View>

      {/* ---- Altura ---- */}
      <View style={[styles.card, card]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, { color: p.secondary }]}>{t('profile_height')}</Text>
          <LogButton label={t('profile_log')} a11y={t('profile_pick_height')} onPress={() => setPick('height')} />
        </View>
        <Text style={[styles.bigValue, { color: p.text }]} numberOfLines={1}>
          {height ? `${fmtNum(height)} cm` : '—'}
        </Text>
        {heightTrend.length >= 2 ? (
          <TrendCard title={t('profile_trend')} data={heightTrend} unit="cm" p={p} />
        ) : heights.length === 0 ? (
          <Text style={[styles.empty, { color: p.secondary }]}>{t('profile_empty_height')}</Text>
        ) : null}
      </View>

      {/* ---- Calorías diarias ---- */}
      <View style={[styles.card, card]}>
        <Text style={[styles.cardLabel, { color: p.secondary }]}>{t('energy_title')}</Text>
        {energy ? (
          <>
            <View style={styles.energyRow}>
              <View style={styles.energyCol}>
                <Text style={[styles.energyValue, { color: p.text }]}>{energy.tdee.toLocaleString(lang)}</Text>
                <Text style={[styles.energyLabel, { color: p.secondary }]}>
                  {t('energy_tdee')} ({t('energy_kcal_day')})
                </Text>
              </View>
              <View style={[styles.vRule, { backgroundColor: p.cardBorder }]} />
              <View style={styles.energyCol}>
                <Text style={[styles.energyValue, { color: p.text }]}>{energy.bmr.toLocaleString(lang)}</Text>
                <Text style={[styles.energyLabel, { color: p.secondary }]}>
                  {t('energy_bmr')} ({t('energy_kcal_day')})
                </Text>
              </View>
            </View>
            <Text style={[styles.energyNote, { color: p.text }]}>
              {t('energy_activity', { level: t(`act_${energy.activity.key}`), f: energy.activity.factor.toLocaleString(lang) })}
            </Text>
            {energy.sexApprox ? (
              <Text style={[styles.energyNote, { color: p.secondary }]}>{t('energy_sex_note')}</Text>
            ) : null}
            <Text style={[styles.energyNote, { color: p.secondary }]}>{t('energy_method')}</Text>
          </>
        ) : (
          <Text style={[styles.energyNote, { color: p.secondary }]}>
            {t('energy_missing', { fields: missing.join(', ').toLowerCase() })}
          </Text>
        )}
      </View>

      {/* ---- Ajustes: idioma (instantáneo, sin red) + tus datos ---- */}
      <View style={[styles.card, card]}>
        <Text style={[styles.cardLabel, { color: p.secondary, marginBottom: 2 }]}>{t('profile_language')}</Text>
        <LangSwitcher lng={lng} onPick={onPickLang} full />
      </View>
      <DataSection t={t} onExport={onExport} onClear={onClearAll} onDone={onDataChanged} />

      {pick ? (
        <PickerSheet
          open
          title={pick === 'height' ? t('profile_pick_height') : pick === 'weight' ? t('profile_pick_weight') : t('profile_birth_year')}
          unit={pick === 'height' ? 'cm' : pick === 'weight' ? 'kg' : ''}
          values={
            pick === 'height'
              ? [150, 155, 160, 165, 170, 175, 180, 185, 190]
              : pick === 'weight'
                ? [50, 55, 60, 65, 70, 75, 80, 85, 90, 100]
                : [1960, 1965, 1970, 1975, 1980, 1985, 1990, 1995, 2000, 2005]
          }
          value={pick === 'height' ? height ?? 0 : pick === 'weight' ? weight ?? 0 : profile?.birth_year ?? 0}
          custom={
            pick === 'height'
              ? { min: 100, max: 230, step: 1 }
              : pick === 'weight'
                ? { min: 30, max: 300, step: 0.5 }
                : { min: 1920, max: year - 14, step: 1 }
          }
          labelCustom={t('other_value')}
          labelUse={t('use_value')}
          onSelect={() => undefined}
          onConfirm={confirmPick}
        />
      ) : null}
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { p } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: p.text }]}>{label}</Text>
      {children}
    </View>
  );
}

/** Selector de una opción (chips que se ajustan a varias líneas). */
function Seg<T extends string>({
  options,
  value,
  labelOf,
  onPick,
}: {
  options: T[];
  value?: T;
  labelOf: (v: T) => string;
  onPick: (v: T) => void;
}) {
  const { p } = useTheme();
  return (
    <View style={styles.seg} accessibilityRole="radiogroup">
      {options.map((o) => {
        const on = value === o;
        return (
          <Pressable
            key={o}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            onPress={() => onPick(o)}
            style={({ pressed }) => [
              styles.segChip,
              { backgroundColor: on ? p.accent : p.chipOff, borderColor: on ? p.accent : p.border, transform: [{ scale: pressed ? 0.96 : 1 }] },
            ]}
          >
            <Text style={[styles.segText, { color: on ? '#fff' : p.text }]} numberOfLines={1}>
              {labelOf(o)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function LogButton({ label, a11y, onPress }: { label: string; a11y: string; onPress: () => void }) {
  const { p } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={({ pressed }) => [styles.logBtn, { backgroundColor: p.accent, opacity: pressed ? 0.85 : 1 }]}
    >
      <Text style={styles.logBtnText}>+ {label}</Text>
    </Pressable>
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
    marginTop: 2,
  },
  logBtn: {
    borderRadius: 999,
    paddingHorizontal: 14,
    minHeight: 36,
    justifyContent: 'center',
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
  field: {
    marginTop: 10,
    gap: 8,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  seg: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segChip: {
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segText: {
    fontSize: 14,
    fontWeight: '600',
  },
  valueBtn: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  valueBtnText: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  energyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  energyCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  energyValue: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.6,
    fontVariant: ['tabular-nums'],
  },
  energyLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  energyNote: {
    fontSize: 13,
    lineHeight: 18,
  },
  vRule: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
});
