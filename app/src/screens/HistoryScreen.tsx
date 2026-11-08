import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '../data';
import type { Session } from '../store';
import { sessionVolume, sessionSets, sortByDate } from '../lib/gym';
import { COLORS, RADII, SHADOW } from '../theme';
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
      <ScrollView contentContainerStyle={styles.body}>
      <Text style={[styles.title, { fontSize: fs(scale, 32) }]} numberOfLines={1}>
        {t('hist_title')}
      </Text>
      <Text style={styles.sub}>{t('hist_sub')}</Text>

      {list.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyMark}>
            <EmptyMarkGlyph size={30} />
          </View>
          <Text style={styles.emptyTitle}>{t('hist_empty')}</Text>
          <TouchableOpacity
            style={styles.cta}
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={onStartSession}
          >
            <View style={styles.ctaInner}>
              <Text style={styles.ctaText}>{t('hero_cta_session')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        list.map((s) => (
          <View key={s.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardDate}>{s.date}</Text>
              <TouchableOpacity
                style={styles.deleteBtn}
                accessibilityRole="button"
                accessibilityLabel={t('hist_delete')}
                onPress={() => confirmDelete(s)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.delete}>{t('delete')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardMeta}>
              <Text style={styles.cardMetaText}>
                {plural(s.exercises.length, t, 'hist_exercise', 'hist_exercises')} · {plural(sessionSets(s), t, 'hist_set', 'hist_sets_total')}
                {s.duration_min ? ` · ${s.duration_min} ${t('picker_minutes')}` : ''}
              </Text>
              <Text style={styles.cardVolume}>
                {Math.round(sessionVolume(s)).toLocaleString(lang)} kg {t('hist_volume')}
              </Text>
            </View>
            {s.exercises.map((ex) => {
              const e = byId.get(ex.exercise_id);
              return (
                <TouchableOpacity
                  key={ex.exercise_id}
                  style={styles.exRow}
                  accessibilityRole="button"
                  accessibilityLabel={nameOf(e)}
                  onPress={() => e && onOpenExercise(e.id)}
                  activeOpacity={0.7}
                >
                  {e ? (
                    <Image source={e.imageAsset} style={styles.exThumb} resizeMode="cover" />
                  ) : null}
                  <Text style={styles.exName} numberOfLines={1}>
                    {nameOf(e) || ex.exercise_id}
                  </Text>
                  <Text style={styles.exSets}>
                    {ex.sets.map((st) => `${st.reps}×${st.weight_kg}kg`).join(' · ')}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {s.notes ? <Text style={styles.notes}>{s.notes}</Text> : null}
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

const ctaBg = {
  backgroundColor: '#0a84ff',
  background: 'linear-gradient(180deg, #0a84ff 0%, #0055d4 100%)',
} as object;

const styles = StyleSheet.create({
  body: {
    padding: 20,
    paddingBottom: 40,
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
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 28,
    alignItems: 'center',
    ...SHADOW.card,
  },
  emptyMark: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.section,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    color: COLORS.dim,
    textAlign: 'center',
  },
  cta: {
    marginTop: 18,
    borderRadius: RADII.tile,
    shadowColor: 'rgba(0, 113, 227, 0.35)',
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    width: '100%',
  },
  ctaInner: {
    ...ctaBg,
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
    backgroundColor: COLORS.card,
    borderRadius: RADII.tile,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginBottom: 12,
    ...SHADOW.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginLeft: 10,
  },
  cardDate: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  delete: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.red,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 10,
  },
  cardMetaText: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  cardVolume: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.blue,
  },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.cardBorder,
  },
  exThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.section,
  },
  exName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 10,
  },
  exSets: {
    fontSize: 12,
    color: COLORS.dim,
    maxWidth: 120,
    textAlign: 'right',
  },
  notes: {
    fontSize: 13,
    color: COLORS.secondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
