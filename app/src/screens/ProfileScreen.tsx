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
import { View, Text, ScrollView, Pressable, StyleSheet, Switch, Modal } from 'react-native';
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
import { THEMES, THEME_IDS, type ThemeId } from '../theme';
import { COUNTRIES, COUNTRY_BY_CODE, countryName, type Country, type CountryCode } from '../theme-flags';
import type { Lang } from '../i18n';
import { Image } from 'react-native';
import { canPickPhoto, pickPhoto } from '../lib/pickPhoto';
import { loadHomePhoto, saveHomePhoto } from '../lib/homePhoto';
import { effectiveRecords } from '../lib/records';
import type { BenchmarkRef } from '../store';
import type { ExerciseRow } from '../lib/gym';
import { exName } from '../lib/names';
import { Chevron } from '../components/Chevron';

/** Temas a la vista; el resto, en "Más temas". */
const BASIC_THEMES: ThemeId[] = ['night', 'day'];

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
  themeId,
  onPickTheme,
  nationality,
  onPickNationality,
  useFlag,
  onToggleFlag,
  exercises,
  benchmarks,
  onStartBenchmark,
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
  /** Ejercicios (nombres) y marcas del test, para "Marcas personales". */
  exercises: ExerciseRow[];
  benchmarks: BenchmarkRef[];
  /** "Establecer marcas": arranca la sesión de test con los 5 clásicos. */
  onStartBenchmark: () => void;
  /** Tema visual (Noche, Día, Ámbar, Neón, Rubí). */
  themeId: ThemeId;
  onPickTheme: (id: ThemeId) => void;
  /** Nacionalidad (opcional) y, aparte, usar su bandera como tema. */
  nationality: CountryCode | null;
  onPickNationality: (c: CountryCode) => void;
  useFlag: boolean;
  onToggleFlag: (on: boolean) => void;
}) {
  const [natOpen, setNatOpen] = useState(false);
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
    void loadHomePhoto().then(setHomePhoto);
  }, []);

  // Calorías: explicación plegada. Temas: Noche/Día a la vista; el resto en
  // "Más temas" (abierto si ya usas uno de ellos o la bandera).
  const [energyOpen, setEnergyOpen] = useState(false);
  const [moreThemes, setMoreThemes] = useState(!BASIC_THEMES.includes(themeId) || useFlag);
  const renderTheme = (id: ThemeId) => {
    const th = THEMES[id];
    const on = themeId === id;
    return (
      <Pressable
        key={id}
        accessibilityRole="radio"
        accessibilityLabel={t(`theme_${id}`)}
        accessibilityState={{ checked: on }}
        onPress={() => onPickTheme(id)}
        style={({ pressed }) => [styles.themeItem, { opacity: pressed ? 0.75 : 1 }]}
      >
        <View style={[styles.themeRing, { borderColor: on ? p.text : 'transparent' }]}>
          <View style={[styles.themeSwatch, { borderColor: p.border }]}>
            <View style={{ flex: 1, backgroundColor: th.bg }} />
            <View style={{ flex: 1, backgroundColor: th.accent }} />
          </View>
        </View>
        <Text style={[styles.themeName, { color: on ? p.text : p.secondary, fontWeight: on ? '700' : '500' }]} numberOfLines={1}>
          {t(`theme_${id}`)}
        </Text>
      </Pressable>
    );
  };

  // Foto de Inicio (opcional; sin foto, Inicio abre con "Hoy toca").
  const [homePhoto, setHomePhoto] = useState<string | null>(null);
  const changeHomePhoto = async () => {
    const uri = await pickPhoto();
    if (!uri) return;
    setHomePhoto(uri);
    await saveHomePhoto(uri);
  };
  const resetHomePhoto = () => {
    setHomePhoto(null);
    void saveHomePhoto(null);
  };

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

  // Marcas personales: test de marcas + mejores series (gana el mayor).
  const exById = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const records = useMemo(
    () =>
      [...effectiveRecords(sessions, benchmarks, (id) => exById.get(id)?.muscle_group === 'cardio').values()]
        .filter((r) => r.kg > 0 && exById.has(r.exercise_id))
        .sort((a, b) => b.kg - a.kg)
        .slice(0, 5),
    [sessions, benchmarks, exById],
  );

  const card = { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card };
  const year = new Date().getFullYear();

  return (
    <ScrollView contentContainerStyle={[styles.body, { backgroundColor: 'transparent' }]}>
      <Text style={[styles.title, { fontSize: fs(scale, 34), color: p.text }]} numberOfLines={1} accessibilityRole="header">
        {t('profile_title')}
      </Text>
      <Text style={[styles.sub, { color: p.secondary }]}>{t('profile_sub')}</Text>

      {/* ---- 1. Cuerpo: peso y altura en una tarjeta ---- */}
      <View style={[styles.card, card]}>
        <Text style={[styles.cardLabel, { color: p.secondary }]}>{t('profile_body')}</Text>
        <View style={styles.bodyRow}>
          <View style={styles.bodyCol}>
            <Text style={[styles.bodyLabel, { color: p.secondary }]}>{t('profile_bodyweight')}</Text>
            <Text style={[styles.bodyValue, { color: p.text }]} numberOfLines={1}>
              {weight ? `${fmtNum(weight)} kg` : '—'}
            </Text>
            <LogButton label={t('profile_log')} a11y={t('profile_pick_weight')} onPress={() => setPick('weight')} />
          </View>
          <View style={[styles.vRule, { backgroundColor: p.cardBorder }]} />
          <View style={styles.bodyCol}>
            <Text style={[styles.bodyLabel, { color: p.secondary }]}>{t('profile_height')}</Text>
            <Text style={[styles.bodyValue, { color: p.text }]} numberOfLines={1}>
              {height ? `${fmtNum(height)} cm` : '—'}
            </Text>
            <LogButton label={t('profile_log')} a11y={t('profile_pick_height')} onPress={() => setPick('height')} />
          </View>
        </View>
        {bmi ? (
          <Text style={[styles.energyNote, { color: p.secondary }]}>
            {t('profile_bmi')} ≈ {fmtNum(Math.round(bmi * 10) / 10)}
          </Text>
        ) : null}
        {weightTrend.length >= 2 ? <TrendCard title={t('profile_trend')} data={weightTrend} unit="kg" p={p} /> : null}
      </View>

      {/* ---- Marcas personales: salen de los datos (sesiones o test) ---- */}
      <View style={[styles.card, card]}>
        <Text style={[styles.cardLabel, { color: p.secondary }]}>{t('home_prs')}</Text>
        {records.length ? (
          <View style={{ marginTop: 6 }}>
            {records.map((r) => (
              <View key={r.exercise_id} style={[styles.recRow, { borderBottomColor: p.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.recName, { color: p.text }]} numberOfLines={1}>
                    {exName(exById.get(r.exercise_id), lang)}
                  </Text>
                  <Text style={[styles.flagSub, { color: p.secondary }]} numberOfLines={1}>
                    {r.source === 'sessions' && r.best_date
                      ? t('records_from_sessions', { date: fmtDay(r.best_date, lang) })
                      : t('records_from_test')}
                  </Text>
                </View>
                <Text style={[styles.recVal, { color: p.text }]}>
                  {fmtNum(r.kg)} <Text style={{ color: p.secondary, fontWeight: '600' }}>kg</Text>
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.energyNote, { color: p.secondary }]}>{t('records_empty')}</Text>
        )}
        <Pressable
          accessibilityRole="button"
          onPress={onStartBenchmark}
          style={({ pressed }) => [styles.photoBtn, styles.recBtn, { borderColor: p.border, opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={[styles.photoBtnText, { color: p.text }]}>{t('records_test_btn')}</Text>
        </Pressable>
        <Text style={[styles.flagSub, { color: p.secondary, marginTop: 8 }]}>{t('records_test_sub')}</Text>
      </View>

      {/* ---- 2. Calorías: un número; la explicación, plegada ---- */}
      <View style={[styles.card, card]}>
        <Text style={[styles.cardLabel, { color: p.secondary }]}>{t('energy_title')}</Text>
        {energy ? (
          <>
            <Text style={[styles.energyBig, { color: p.text }]}>
              {energy.tdee.toLocaleString(lang)}
              <Text style={[styles.energyUnit, { color: p.secondary }]}> {t('energy_kcal_day')}</Text>
            </Text>
            <Text style={[styles.energyLabel, { color: p.secondary, textAlign: 'left' }]}>{t('energy_tdee')}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: energyOpen }}
              onPress={() => setEnergyOpen((o) => !o)}
              style={({ pressed }) => [styles.disclose, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Text style={[styles.discloseText, { color: p.text }]}>{t('energy_what')}</Text>
              <Chevron dir={energyOpen ? 'up' : 'down'} color={p.text} size={7} />
            </Pressable>
            {energyOpen ? (
              <View style={[styles.explain, { borderTopColor: p.border }]}>
                <Text style={[styles.explainText, { color: p.text }]}>
                  <Text style={{ fontWeight: '700' }}>{t('energy_bmr')}: </Text>
                  {energy.bmr.toLocaleString(lang)} {t('energy_kcal_day')}. {t('energy_bmr_explain')}
                </Text>
                <Text style={[styles.explainText, { color: p.text }]}>
                  <Text style={{ fontWeight: '700' }}>{t('energy_tdee')}: </Text>
                  {t('energy_tdee_explain')}
                </Text>
                <Text style={[styles.energyNote, { color: p.secondary }]}>
                  {t('energy_activity', { level: t(`act_${energy.activity.key}`), f: energy.activity.factor.toLocaleString(lang) })}
                </Text>
                {energy.sexApprox ? <Text style={[styles.energyNote, { color: p.secondary }]}>{t('energy_sex_note')}</Text> : null}
                <Text style={[styles.energyNote, { color: p.secondary }]}>{t('energy_method')}</Text>
              </View>
            ) : null}
          </>
        ) : (
          <Text style={[styles.energyNote, { color: p.secondary }]}>
            {t('energy_missing', { fields: missing.join(', ').toLowerCase() })}
          </Text>
        )}
      </View>

      {/* ---- 3. Sobre ti ---- */}
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
        <Field label={t('profile_nationality')}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t('profile_nationality')}: ${nationality ? countryName(COUNTRY_BY_CODE.get(nationality)!, lang) : '—'}`}
            onPress={() => setNatOpen(true)}
            style={({ pressed }) => [styles.valueBtn, styles.natBtn, { backgroundColor: p.fieldBg, borderColor: p.border, opacity: pressed ? 0.8 : 1 }]}
          >
            {nationality ? <FlagSwatch c={COUNTRY_BY_CODE.get(nationality)!} /> : null}
            <Text style={[styles.valueBtnText, { color: nationality ? p.text : p.secondary }]}>
              {nationality ? countryName(COUNTRY_BY_CODE.get(nationality)!, lang) : t('profile_pick_country')}
            </Text>
          </Pressable>
        </Field>
      </View>

      {/* ---- 4. Apariencia: tema (Noche/Día + Más temas) y foto de Inicio ---- */}
      <View style={[styles.card, card]}>
        <Text style={[styles.cardLabel, { color: p.secondary, marginBottom: 6 }]}>{t('profile_appearance')}</Text>
        <View style={[styles.themeRow, useFlag && nationality ? { opacity: 0.35 } : null]} accessibilityRole="radiogroup" accessibilityLabel={t('profile_theme')}>
          {(moreThemes ? THEME_IDS : BASIC_THEMES).map((id) => renderTheme(id))}
          {moreThemes ? null : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('theme_more')}
              onPress={() => setMoreThemes(true)}
              style={({ pressed }) => [styles.themeItem, { opacity: pressed ? 0.75 : 1 }]}
            >
              <View style={[styles.themeRing, { borderColor: 'transparent' }]}>
                <View style={[styles.themeSwatch, styles.moreSwatch, { borderColor: p.border }]}>
                  {[0, 1, 2].map((i) => (
                    <View key={i} style={[styles.moreDot, { backgroundColor: p.text }]} />
                  ))}
                </View>
              </View>
              <Text style={[styles.themeName, { color: p.secondary }]} numberOfLines={1}>{t('theme_more')}</Text>
            </Pressable>
          )}
        </View>
        {moreThemes ? (
          <View style={[styles.flagRow, { borderTopColor: p.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.flagTitle, { color: nationality ? p.text : p.secondary }]}>{t('profile_flag_theme')}</Text>
              <Text style={[styles.flagSub, { color: p.secondary }]}>
                {nationality ? countryName(COUNTRY_BY_CODE.get(nationality)!, lang) : t('profile_flag_needs_country')}
              </Text>
            </View>
            <Switch
              accessibilityLabel={t('profile_flag_theme')}
              value={useFlag && !!nationality}
              disabled={!nationality}
              onValueChange={onToggleFlag}
              trackColor={{ false: p.border, true: p.accent }}
              thumbColor={useFlag && nationality ? p.onAccent : '#FFFFFF'}
            />
          </View>
        ) : null}
        {canPickPhoto ? (
          <View style={[styles.photoRow, { borderTopColor: p.border }]}>
            {homePhoto ? (
              <Image source={{ uri: homePhoto }} style={[styles.photoThumb, { borderColor: p.border }]} resizeMode="cover" accessibilityLabel={t('profile_home_photo')} />
            ) : (
              <View style={[styles.photoThumb, styles.photoEmpty, { borderColor: p.border }]} />
            )}
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={[styles.flagTitle, { color: p.text }]}>{t('profile_home_photo')}</Text>
              <Text style={[styles.flagSub, { color: p.secondary }]}>{t('profile_home_photo_sub')}</Text>
              <View style={styles.photoActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={changeHomePhoto}
                  style={({ pressed }) => [styles.photoBtn, { borderColor: p.border, opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={[styles.photoBtnText, { color: p.text }]}>{homePhoto ? t('home_photo_change') : t('home_photo_pick')}</Text>
                </Pressable>
                {homePhoto ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={resetHomePhoto}
                    hitSlop={8}
                    style={({ pressed }) => [styles.photoReset, { opacity: pressed ? 0.6 : 1 }]}
                  >
                    <Text style={[styles.photoBtnText, { color: p.secondary }]}>{t('home_photo_remove')}</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>
        ) : null}
      </View>

      {/* ---- Ajustes: idioma (instantáneo, sin red) + tus datos ---- */}
      <View style={[styles.card, card]}>
        <Text style={[styles.cardLabel, { color: p.secondary, marginBottom: 2 }]}>{t('profile_language')}</Text>
        <LangSwitcher lng={lng} onPick={onPickLang} full />
      </View>
      <DataSection t={t} onExport={onExport} onClear={onClearAll} onDone={onDataChanged} />

      {natOpen ? (
        <Modal visible transparent animationType="slide" onRequestClose={() => setNatOpen(false)}>
          <Pressable style={[styles.sheetBack, { backgroundColor: p.overlay }]} onPress={() => setNatOpen(false)} accessibilityLabel={t('cancel')} />
          <View style={[styles.sheet, { backgroundColor: p.bg, borderColor: p.border }]}>
            <View style={[styles.sheetHandle, { backgroundColor: p.border }]} />
            <Text style={[styles.sheetTitle, { color: p.text }]} accessibilityRole="header">{t('profile_nationality')}</Text>
            <ScrollView style={{ maxHeight: 460 }}>
              {COUNTRIES.map((c) => {
                const on = nationality === c.code;
                return (
                  <Pressable
                    key={c.code}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    onPress={() => {
                      onPickNationality(c.code);
                      setNatOpen(false);
                    }}
                    style={({ pressed }) => [styles.natRow, { borderBottomColor: p.border, backgroundColor: pressed ? p.card : 'transparent' }]}
                  >
                    <FlagSwatch c={c} />
                    <Text style={[styles.natName, { color: p.text, fontWeight: on ? '700' : '500' }]}>{countryName(c, lang)}</Text>
                    {on ? <View style={[styles.natCheck, { backgroundColor: p.accent }]} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Modal>
      ) : null}

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

/** Mini-bandera con las franjas de color del país (sin emblemas). */
function FlagSwatch({ c }: { c: Country }) {
  return (
    <View style={[styles.flag, { flexDirection: c.vertical ? 'row' : 'column' }]} accessibilityElementsHidden>
      {c.stripes.map((col, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: col }} />
      ))}
    </View>
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
            <Text style={[styles.segText, { color: on ? p.onAccent : p.text }]} numberOfLines={1}>
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
      <Text style={[styles.logBtnText, { color: p.onAccent }]}>+ {label}</Text>
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
    paddingBottom: 32,
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
    color: '#000000',
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
  explain: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    marginTop: 4,
    gap: 8,
  },
  explainText: {
    fontSize: 14,
    lineHeight: 20,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeItem: {
    alignItems: 'center',
    gap: 6,
    minWidth: 56,
  },
  themeRing: {
    padding: 3,
    borderRadius: 30,
    borderWidth: 2,
  },
  themeSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    transform: [{ rotate: '45deg' }],
  },
  themeName: {
    fontSize: 12,
  },
  natBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flag: {
    width: 28,
    height: 20,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(128,128,128,0.5)',
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    marginTop: 12,
  },
  flagTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 14, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth },
  photoEmpty: { borderStyle: 'dashed', borderWidth: 1 },
  recRow: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  recName: { fontSize: 15, fontWeight: '600' },
  recVal: { fontSize: 17, fontWeight: '800', fontVariant: ['tabular-nums'] },
  recBtn: { alignSelf: 'flex-start', marginTop: 14 },
  bodyRow: { flexDirection: 'row', alignItems: 'stretch', marginTop: 10, marginBottom: 4 },
  bodyCol: { flex: 1, alignItems: 'flex-start', gap: 6, paddingHorizontal: 4 },
  bodyLabel: { fontSize: 13, fontWeight: '600' },
  bodyValue: { fontSize: 28, fontWeight: '800', letterSpacing: -0.4, fontVariant: ['tabular-nums'] },
  energyBig: { fontSize: 36, fontWeight: '800', letterSpacing: -0.6, marginTop: 8, fontVariant: ['tabular-nums'] },
  energyUnit: { fontSize: 15, fontWeight: '600', letterSpacing: 0 },
  disclose: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', marginTop: 4 },
  discloseText: { fontSize: 15, fontWeight: '600' },
  moreSwatch: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, transform: [{ rotate: '0deg' }] },
  moreDot: { width: 4, height: 4, borderRadius: 2 },
  photoThumb: { width: 96, height: 72, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  photoActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  photoBtn: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoReset: { minHeight: 44, justifyContent: 'center' },
  photoBtnText: { fontSize: 15, fontWeight: '600' },
  flagSub: {
    fontSize: 13,
    marginTop: 2,
  },
  sheetBack: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  natRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 52,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  natName: {
    flex: 1,
    fontSize: 16,
  },
  natCheck: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
