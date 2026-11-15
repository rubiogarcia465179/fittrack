/**
 * Hoja previa al entreno recomendado (Inicio → "Empezar sesión"):
 * tiempo · intensidad · energía de hoy · objetivo → "Continuar al entreno".
 * Valores por defecto: la última elección (o el Perfil). Con energía baja la
 * intensidad efectiva baja un nivel (se avisa en la propia hoja).
 */
import { Modal, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme-context';
import type { Goal, Intensity } from '../lib/types';

export type Energy = 'low' | 'normal' | 'high';
export interface QuickStartOptions {
  duration: number;
  intensity: Intensity;
  energy: Energy;
  goal: Goal;
}

const DURATIONS = [30, 45, 60, 75];
const INTENSITIES: Intensity[] = ['low', 'moderate', 'high'];
const ENERGIES: Energy[] = ['low', 'normal', 'high'];
const GOALS: Goal[] = ['build_muscle', 'lose_weight', 'strength', 'lose_fat', 'definition', 'endurance'];

export function QuickStartSheet({
  value,
  onChange,
  onCancel,
  onContinue,
}: {
  value: QuickStartOptions;
  onChange: (v: QuickStartOptions) => void;
  onCancel: () => void;
  onContinue: () => void;
}) {
  const { t } = useTranslation();
  const { p } = useTheme();
  const intLabel = (i: Intensity) => t(i === 'low' ? 'int_easy' : i === 'high' ? 'int_hard' : 'int_moderate');
  const enLabel = (e: Energy) => t(e === 'low' ? 'checkin_low' : e === 'high' ? 'checkin_high' : 'qs_normal');

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={[styles.back, { backgroundColor: p.overlay }]} onPress={onCancel} accessibilityLabel={t('cancel')} />
      <View style={[styles.sheet, { backgroundColor: p.bg, borderColor: p.border }]}>
        <View style={[styles.handle, { backgroundColor: p.border }]} />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: p.text }]} accessibilityRole="header">
            {t('qs_title')}
          </Text>

          <Group label={t('picker_duration')}>
            {DURATIONS.map((d) => (
              <Chip key={d} label={`${d} min`} on={value.duration === d} onPress={() => onChange({ ...value, duration: d })} />
            ))}
          </Group>
          <Group label={t('cardio_intensity')}>
            {INTENSITIES.map((i) => (
              <Chip key={i} label={intLabel(i)} on={value.intensity === i} onPress={() => onChange({ ...value, intensity: i })} />
            ))}
          </Group>
          <Group label={t('checkin_energy')}>
            {ENERGIES.map((e) => (
              <Chip key={e} label={enLabel(e)} on={value.energy === e} onPress={() => onChange({ ...value, energy: e })} />
            ))}
          </Group>
          {value.energy === 'low' && value.intensity !== 'low' ? (
            <Text style={[styles.hint, { color: p.secondary }]}>{t('qs_energy_hint')}</Text>
          ) : null}
          <Group label={t('profile_goal')}>
            {GOALS.map((g) => (
              <Chip key={g} label={t(`goal_${g}`)} on={value.goal === g} onPress={() => onChange({ ...value, goal: g })} />
            ))}
          </Group>

          <Pressable
            accessibilityRole="button"
            onPress={onContinue}
            style={({ pressed }) => [styles.cta, { backgroundColor: p.accent, opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={[styles.ctaText, { color: p.onAccent }]}>{t('qs_continue')}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  const { p } = useTheme();
  return (
    <View style={styles.group}>
      <Text style={[styles.groupLabel, { color: p.secondary }]}>{label}</Text>
      <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {children}
      </View>
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
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: on ? p.accent : 'transparent',
          borderColor: on ? p.accent : p.border,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      <Text style={[styles.chipText, { color: on ? p.onAccent : p.text }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: { flex: 1 },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    maxHeight: '88%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 8 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, marginBottom: 6 },
  group: { marginTop: 18, gap: 10 },
  groupLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 40, borderRadius: 20, borderWidth: 1, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontSize: 15, fontWeight: '600' },
  hint: { fontSize: 13, marginTop: 8 },
  cta: { marginTop: 26, minHeight: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontSize: 17, fontWeight: '700' },
});
