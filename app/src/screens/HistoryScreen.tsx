import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '../data';
import type { Session } from '../store';
import { sessionVolume, sessionSets, sortByDate } from '../lib/gym';
import { RADII } from '../theme';
import { useTheme } from '../theme-context';
import { useScale, fs } from '../scale';
import { EmptyMarkGlyph } from '../components/TabIcon';
import { plural } from '../lib/plural';
import { ConfirmDialog } from '../components/ConfirmDialog';

export default function HistoryScreen({
  sessions,
  exercises,
  onDeleted,
  onOpenExercise,
  onStartSession,
}: {
  sessions: Session[];
  exercises: Exercise[];
  onDeleted: (id: string) => void;
  onOpenExercise: (id: string) => void;
  onStartSession: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { p, SHADOW } = useTheme();
  const scale = useScale();
  // Sesión pendiente de borrado (diálogo propio: Alert no funciona en web).
  const [toDelete, setToDelete] = useState<Session | null>(null);
  const list = sortByDate(sessions);
  const lang = i18n.language as string;
  const byId = new Map(exercises.map((e) => [e.id, e]));
  const nameOf = (e?: { name_en: string; name_nl: string }) =>
    e ? (lang === 'nl' ? e.name_nl || e.name_en : e.name_en) : '';

  const confirmDelete = (s: Session) => setToDelete(s);

  return (
    <>
      <ScrollView contentContainerStyle={[styles.body, { backgroundColor: p.bg }]}>
      <Text style={[styles.title, { fontSize: fs(scale, 32), color: p.text }]} numberOfLines={1}>
        {t('hist_title')}
      </Text>
      <Text style={[styles.sub, { color: p.secondary }]}>{t('hist_sub')}</Text>

      {list.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card }]}>
          <View style={[styles.emptyMark, { backgroundColor: p.section }]}>
            <EmptyMarkGlyph size={30} />
          </View>
          <Text style={[styles.emptyTitle, { color: p.dim }]}>{t('hist_empty')}</Text>
          <Pressable
            style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.85 : 1, transition: 'opacity 90ms ease' }]}
            accessibilityRole="button"
            onPress={onStartSession}
          >
            <View style={[styles.ctaInner, { backgroundColor: p.accent }]} >
              <Text style={styles.ctaText}>{t('hero_cta_session')}</Text>
            </View>
          </Pressable>
        </View>
      ) : (
        list.map((s) => (
          <View key={s.id} style={[styles.card, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card }]}>
            <View style={styles.cardHeader}>
              <View style={styles.dateWrap}>
                <Text style={[styles.cardDate, { color: p.text }]}>{s.date}</Text>
                {s.type === 'benchmark' ? (
                  <View style={[styles.typeBadge, { backgroundColor: p.accent }]}>
                    <Text style={styles.typeBadgeText}>{t('bench_badge')}</Text>
                  </View>
                ) : null}
              </View>
              <Pressable
                style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.6 : 1, transition: 'opacity 90ms ease' }]}
                accessibilityRole="button"
                accessibilityLabel={t('hist_delete')}
                onPress={() => confirmDelete(s)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.delete, { color: p.red }]}>{t('delete')}</Text>
              </Pressable>
            </View>
            <View style={styles.cardMeta}>
              <Text style={[styles.cardMetaText, { color: p.secondary }]}>
                {plural(s.exercises.length, t, 'hist_exercise', 'hist_exercises')} · {plural(sessionSets(s), t, 'hist_set', 'hist_sets_total')}
                {s.duration_min ? ` · ${s.duration_min} ${t('picker_minutes')}` : ''}
              </Text>
              <Text style={[styles.cardVolume, { color: p.accent }]}>
                {Math.round(sessionVolume(s)).toLocaleString(lang)} kg {t('hist_volume')}
              </Text>
            </View>
            {s.exercises.map((ex) => {
              const e = byId.get(ex.exercise_id);
              return (
                <Pressable
                  key={ex.exercise_id}
                  style={({ pressed }) => [styles.exRow, { borderTopColor: p.cardBorder, opacity: pressed ? 0.75 : 1, transition: 'opacity 90ms ease' }]}
                  accessibilityRole="button"
                  accessibilityLabel={nameOf(e)}
                  onPress={() => e && onOpenExercise(e.id)}
                >
                  {e ? (
                    <Image source={e.imageAsset} style={[styles.exThumb, { backgroundColor: p.section }]} resizeMode="cover" />
                  ) : null}
                  <Text style={[styles.exName, { color: p.text }]} numberOfLines={1}>
                    {nameOf(e) || ex.exercise_id}
                  </Text>
                  <Text style={[styles.exSets, { color: p.dim }]}>
                    {ex.sets.map((st) => `${st.reps}×${st.weight_kg}kg`).join(' · ')}
                  </Text>
                </Pressable>
              );
            })}
            {s.notes ? <Text style={[styles.notes, { color: p.secondary }]}>{s.notes}</Text> : null}
          </View>
        ))
      )}
      </ScrollView>
      {toDelete ? (
        <ConfirmDialog
          visible
          title={t('hist_delete')}
          message={`${toDelete.date} · ${plural(toDelete.exercises.length, t, 'hist_exercise', 'hist_exercises')}`}
          confirmLabel={t('delete')}
          cancelLabel={t('cancel')}
          destructive
          onConfirm={() => {
            onDeleted(toDelete.id);
            setToDelete(null);
          }}
          onCancel={() => setToDelete(null)}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: 20,
    paddingBottom: 40,
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
  emptyCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
  },
  emptyMark: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  cta: {
    marginTop: 18,
    borderRadius: RADII.tile,
    width: '100%',
  },
  ctaInner: {
    borderRadius: RADII.tile,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  card: {
    borderRadius: RADII.tile,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginLeft: 10,
  },
  cardDate: {
    fontSize: 17,
    fontWeight: '700',
  },
  delete: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 10,
  },
  cardMetaText: {
    fontSize: 12,
  },
  cardVolume: {
    fontSize: 12,
    fontWeight: '600',
  },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  exThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  exName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  exSets: {
    fontSize: 12,
    maxWidth: 120,
    textAlign: 'right',
  },
  notes: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
