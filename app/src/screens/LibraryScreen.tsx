import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '../data';
import { searchExercises, GROUPS, EQUIPMENT } from '../lib/gym';
import { GROUP_COLORS, RADII } from '../theme';
import { useTheme } from '../theme-context';
import { useScale, fs, useWide } from '../scale';

function Chips<T extends string>({
  title,
  options,
  value,
  onChange,
  colorOf,
}: {
  title?: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  colorOf?: (id: T) => string | undefined;
}) {
  const { p } = useTheme();
  const scale = useScale();
  return (
    <View>
      {title ? <Text style={[styles.filterTitle, { fontSize: fs(scale, 13), color: p.secondary }]}>{title}</Text> : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {options.map((o) => {
          const active = value === o.id;
          const color = colorOf?.(o.id);
          return (
            <Pressable
              key={o.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(o.id)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: active ? color || p.accent : p.card,
                  borderColor: active ? color || p.accent : p.border,
                  transform: [{ scale: pressed ? 0.94 : 1 }],
                  transition: 'transform 80ms ease, background-color 120ms ease',
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { fontSize: fs(scale, 14), color: active ? '#ffffff' : p.text },
                ]}
              >
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default function LibraryScreen({
  exercises,
  onOpenExercise,
}: {
  exercises: Exercise[];
  onOpenExercise: (id: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const { p, SHADOW } = useTheme();
  const scale = useScale();
  const wide = useWide();
  const [q, setQ] = useState('');
  const [group, setGroup] = useState<string>('all');
  const [equip, setEquip] = useState<string>('all');

  const results = useMemo(
    () => searchExercises(exercises, q, group, equip),
    [exercises, q, group, equip],
  );

  const lang = i18n.language as string;
  const nameOf = (e: { name_en: string; name_nl: string }) =>
    lang === 'nl' ? e.name_nl || e.name_en : e.name_en;

  return (
    <View style={[styles.root, { backgroundColor: p.bg }]}>
      {/* Búsqueda pegajosa: siempre visible al hacer scroll. */}
      <View style={[styles.searchBox, { backgroundColor: p.headerBg, borderBottomColor: p.border }]}>
        <TextInput
          style={[styles.search, { backgroundColor: p.fieldBg, borderColor: p.border, color: p.text, fontSize: fs(scale, 16) }]}
          placeholder={t('ex_search_ph')}
          placeholderTextColor={p.dim}
          value={q}
          onChangeText={setQ}
          autoCorrect={false}
          accessibilityLabel={t('ex_search_ph')}
        />
      </View>

      <ScrollView contentContainerStyle={[styles.body, { backgroundColor: p.bg }]}>
        <Text style={[styles.title, { fontSize: fs(scale, 32), color: p.text }]} numberOfLines={1}>
          {t('ex_title')}
        </Text>
        <Text style={[styles.sub, { color: p.secondary }]}>{t('ex_sub')}</Text>

        <Chips
          title={t('ex_filter_group')}
          options={[
            { id: 'all' as string, label: t('ex_filter_all') },
            ...GROUPS.map((g) => ({ id: g as string, label: t(`group_${g}`) })),
          ]}
          value={group}
          onChange={setGroup}
          colorOf={(id) => GROUP_COLORS[id]}
        />
        <Chips
          title={t('ex_filter_equipment')}
          options={[
            { id: 'all' as string, label: t('ex_filter_all') },
            ...EQUIPMENT.map((e) => ({ id: e as string, label: t(`equip_${e}`) })),
          ]}
          value={equip}
          onChange={setEquip}
        />

        <Text style={[styles.count, { color: p.dim }]}>{results.length} {t('ex_found')}</Text>

        <View style={wide ? styles.rowsWide : undefined}>
          {results.map((e) => (
            <Pressable
              key={e.id}
              style={({ pressed }) => [
                styles.row,
                wide && styles.rowWide,
                {
                  backgroundColor: p.card,
                  borderColor: p.cardBorder,
                  ...SHADOW.card,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  transition: 'transform 90ms ease',
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={nameOf(e)}
              onPress={() => onOpenExercise(e.id)}
            >
              <Image source={e.imageAsset} style={[styles.thumb, { backgroundColor: p.section }]} resizeMode="cover" />
              <View style={styles.rowText}>
                <Text style={[styles.rowName, { color: p.text }]} numberOfLines={1}>
                  {nameOf(e)}
                </Text>
                <Text style={[styles.rowMeta, { color: p.secondary }]} numberOfLines={1}>
                  {t(`group_${e.muscle_group}`)} · {t(`equip_${e.equipment}`)} · {t(`level_${e.level}`)}
                </Text>
              </View>
              <View
                style={[styles.dot, { backgroundColor: GROUP_COLORS[e.muscle_group] || p.dim }]}
                accessibilityElementsHidden
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  searchBox: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  search: {
    borderRadius: RADII.field,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  body: {
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  sub: {
    fontSize: 15,
    marginTop: 4,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  chips: {
    gap: 8,
    paddingVertical: 2,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 980,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  count: {
    fontSize: 13,
    marginBottom: 12,
  },
  rowsWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  rowWide: {
    flexBasis: '48%',
    flexGrow: 1,
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  rowText: {
    flex: 1,
    marginLeft: 12,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
});
