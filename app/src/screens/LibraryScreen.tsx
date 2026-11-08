import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '../data';
import { searchExercises, GROUPS, EQUIPMENT } from '../lib/gym';
import { COLORS, GROUP_COLORS, RADII, SHADOW } from '../theme';
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
  return (
    <View>
      {title ? <Text style={styles.filterTitle}>{title}</Text> : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {options.map((o) => {
          const active = value === o.id;
          const color = colorOf?.(o.id);
          return (
            <TouchableOpacity
              key={o.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[
                styles.chip,
                active && {
                  backgroundColor: color || COLORS.blue,
                  borderColor: color || COLORS.blue,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => onChange(o.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  active && { color: '#ffffff' },
                ]}
              >
                {o.label}
              </Text>
            </TouchableOpacity>
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
    <View style={styles.root}>
      {/* Búsqueda pegajosa: siempre visible al hacer scroll. */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.search}
          placeholder={t('ex_search_ph')}
          placeholderTextColor={COLORS.dim}
          value={q}
          onChangeText={setQ}
          autoCorrect={false}
          accessibilityLabel={t('ex_search_ph')}
        />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[styles.title, { fontSize: fs(scale, 32) }]} numberOfLines={1}>
          {t('ex_title')}
        </Text>
        <Text style={styles.sub}>{t('ex_sub')}</Text>

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

        <Text style={styles.count}>
          {results.length} {t('ex_found')}
        </Text>

        <View style={wide ? styles.rowsWide : undefined}>
          {results.map((e) => (
            <TouchableOpacity
              key={e.id}
              style={[styles.row, wide && styles.rowWide]}
              accessibilityRole="button"
              accessibilityLabel={nameOf(e)}
              onPress={() => onOpenExercise(e.id)}
              activeOpacity={0.7}
            >
              <Image source={e.imageAsset} style={styles.thumb} resizeMode="cover" />
              <View style={styles.rowText}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {nameOf(e)}
                </Text>
                <Text style={styles.rowMeta} numberOfLines={1}>
                  {t(`group_${e.muscle_group}`)} · {t(`equip_${e.equipment}`)} · {t(`level_${e.level}`)}
                </Text>
              </View>
              <View
                style={[styles.dot, { backgroundColor: GROUP_COLORS[e.muscle_group] || COLORS.dim }]}
                accessibilityElementsHidden
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  searchBox: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  search: {
    backgroundColor: COLORS.fieldBg,
    borderRadius: RADII.field,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  body: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: COLORS.bg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: COLORS.text,
  },
  sub: {
    fontSize: 15,
    color: COLORS.secondary,
    marginTop: 4,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
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
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  count: {
    fontSize: 13,
    color: COLORS.dim,
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
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 12,
    marginBottom: 10,
    ...SHADOW.card,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: COLORS.section,
  },
  rowText: {
    flex: 1,
    marginLeft: 12,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  rowMeta: {
    fontSize: 13,
    color: COLORS.secondary,
    marginTop: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
});
