import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  Dimensions,
} from 'react-native';
import { store, type SessionComment } from '../store';
import { pickPhoto } from '../lib/pickPhoto';
import { savePhoto, loadPhotos, deletePhotos } from '../lib/sessionPhotos';
import { exName } from '../lib/names';
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
import { ExerciseGlyph, fmtDate } from './SessionScreen';

/** Series iguales seguidas → una línea: "4 × 8 · 50 kg". */
type SetLite = { reps: number; weight_kg: number; duration_min?: number; distance_km?: number; intensity?: string };
function groupSets<T extends SetLite>(sets: T[]): { st: T; n: number }[] {
  const out: { st: T; n: number }[] = [];
  for (const st of sets) {
    const last = out[out.length - 1];
    if (last && !st.duration_min && !last.st.duration_min && last.st.reps === st.reps && last.st.weight_kg === st.weight_kg) last.n += 1;
    else out.push({ st, n: 1 });
  }
  return out;
}
const fmtKg = (v: number) => String(Math.round(v * 100) / 100).replace('.', ',');

export default function HistoryScreen({
  sessions,
  exercises,
  onDeleted,
  onUpdated,
  onOpenExercise,
  onStartSession,
  focusDate,
  onClearFocus,
}: {
  sessions: Session[];
  exercises: Exercise[];
  onDeleted: (id: string) => void;
  /** Fase 15: la sesión cambió (fotos / comentarios). */
  onUpdated?: (s: Session) => void;
  onOpenExercise: (id: string) => void;
  onStartSession: () => void;
  /** Abierto desde un día del calendario: solo las sesiones de ese día. */
  focusDate?: string | null;
  onClearFocus?: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { p, SHADOW } = useTheme();
  const scale = useScale();
  // Sesión pendiente de borrado (diálogo propio: Alert no funciona en web).
  const [toDelete, setToDelete] = useState<Session | null>(null);
  const all = sortByDate(sessions);
  const list = focusDate ? all.filter((s) => s.date === focusDate) : all;
  const lang = i18n.language as string;
  const byId = new Map(exercises.map((e) => [e.id, e]));
  const nameOf = (e?: { name_en: string; name_nl: string }) =>
    exName(e, lang);

  const confirmDelete = (s: Session) => setToDelete(s);

  // ---- Fase 15 (InstaGym): fotos y comentarios de cada sesión ----
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const photoIds = list.flatMap((s) => s.photos || []);
  const photoKey = photoIds.join(',');
  useEffect(() => {
    void loadPhotos(photoIds).then(setPhotos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoKey]);
  const [page, setPage] = useState<Record<string, number>>({});
  const [commenting, setCommenting] = useState<string | null>(null);
  /** Comentario pendiente de borrar (tocar un comentario → confirmar). */
  const [commentToDelete, setCommentToDelete] = useState<{ s: Session; id: string } | null>(null);
  const [draftText, setDraftText] = useState('');
  // Ancho útil de la tarjeta: pantalla − márgenes (2 × 20) − relleno (2 × 16) − borde.
  const photoW = Math.min(Dimensions.get('window').width, 640) - 40 - 32 - 2;

  const update = async (s: Session, patch: Partial<Pick<Session, 'photos' | 'comments'>>) => {
    const ns = await store.updateSession(s.id, patch);
    if (ns) onUpdated?.(ns);
  };
  const addPhoto = async (s: Session) => {
    const uri = await pickPhoto();
    if (!uri) return;
    const id = await savePhoto(uri);
    if (!id) return;
    setPhotos((m) => ({ ...m, [id]: uri }));
    await update(s, { photos: [...(s.photos || []), id] });
  };
  const removePhoto = async (s: Session) => {
    const ids = s.photos || [];
    const i = Math.min(page[s.id] ?? 0, ids.length - 1);
    if (i < 0) return;
    await deletePhotos([ids[i]]);
    setPage((m) => ({ ...m, [s.id]: 0 }));
    await update(s, { photos: ids.filter((_, k) => k !== i) });
  };
  const postComment = async (s: Session) => {
    const text = draftText.trim();
    if (!text) return;
    const c: SessionComment = { id: `${Date.now().toString(36)}`, text, at: new Date().toISOString() };
    setDraftText('');
    setCommenting(null);
    await update(s, { comments: [...(s.comments || []), c] });
  };

  return (
    <>
      <ScrollView contentContainerStyle={[styles.body, { backgroundColor: p.bg }]}>
      {/* Filtrado por un día: la fecha ya está en la tarjeta; "Ver todas" junto al título. */}
      <View style={focusDate ? styles.focusRow : undefined}>
      <Text style={[styles.title, { fontSize: fs(scale, 32), color: p.text }, focusDate ? { flex: 1, marginBottom: 0 } : null]} numberOfLines={1}>
        {t('hist_title')}
      </Text>
      {focusDate ? (
          <Pressable
            accessibilityRole="button"
            onPress={onClearFocus}
            hitSlop={8}
            style={({ pressed }) => [styles.focusAll, { borderColor: p.border, opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={[styles.focusAllText, { color: p.text }]}>{t('hist_show_all')}</Text>
          </Pressable>
      ) : null}
      </View>

      {list.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card }]}>
          <View style={[styles.emptyMark, { backgroundColor: p.section }]}>
            <EmptyMarkGlyph size={30} />
          </View>
          <Text style={[styles.emptyTitle, { color: p.dim }]}>{t('hist_empty')}</Text>
          <Pressable
            style={({ pressed }) => [styles.cta, { backgroundColor: p.accent, opacity: pressed ? 0.85 : 1, transition: 'opacity 90ms ease' }]}
            accessibilityRole="button"
            onPress={onStartSession}
          >
            <View style={[styles.ctaInner, { backgroundColor: p.accent }]} >
              <Text style={[styles.ctaText, { color: p.onAccent }]}>{t('hero_cta_session')}</Text>
            </View>
          </Pressable>
        </View>
      ) : (
        list.map((s) => (
          <View key={s.id} style={[styles.card, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card }]}>
            <View style={styles.cardHeader}>
              <View style={styles.dateWrap}>
                <Text style={[styles.cardDate, { color: p.text }]}>{fmtDate(s.date, i18n.language)}</Text>
                {s.type === 'benchmark' ? (
                  <View style={[styles.typeBadge, { backgroundColor: p.accent }]}>
                    <Text style={[styles.typeBadgeText, { color: p.onAccent }]}>{t('bench_badge')}</Text>
                  </View>
                ) : null}
              </View>
              <Pressable
                style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.6 : 1, transition: 'opacity 90ms ease' }]}
                accessibilityRole="button"
                accessibilityLabel={`${t('hist_delete')}, ${fmtDate(s.date, i18n.language)}`}
                onPress={() => confirmDelete(s)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.delete, { color: p.secondary }]}>{t('delete')}</Text>
              </Pressable>
            </View>
            <View style={styles.cardMeta}>
              <Text style={[styles.cardMetaText, { color: p.secondary }]}>
                {/* Sin "N ejercicios": la lista de debajo ya los muestra (R-120). */}
                {plural(sessionSets(s), t, 'hist_set', 'hist_sets_total')}
                {s.duration_min ? ` · ${s.duration_min} min` : ''}
              </Text>
            </View>
            {/* Fotos de la sesión (deslizables), como un post. */}
            {(s.photos || []).some((id) => photos[id]) ? (
              <View style={styles.photoWrap}>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={(e) => setPage((m) => ({ ...m, [s.id]: Math.round(e.nativeEvent.contentOffset.x / photoW) }))}
                  scrollEventThrottle={64}
                  style={{ width: photoW }}
                >
                  {(s.photos || []).filter((id) => photos[id]).map((id, i, arr) => (
                    <Image
                      key={id}
                      source={{ uri: photos[id] }}
                      style={[styles.photo, { width: photoW, borderColor: p.border }]}
                      resizeMode="cover"
                      accessibilityLabel={`${t('feed_photo')} ${i + 1}/${arr.length}`}
                    />
                  ))}
                </ScrollView>
                {(s.photos || []).length > 1 ? (
                  <View style={styles.dots} accessibilityElementsHidden>
                    {(s.photos || []).map((id, i) => (
                      <View key={id} style={[styles.dot, { backgroundColor: i === (page[s.id] ?? 0) ? p.text : p.border }]} />
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}
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
                    <View style={[styles.exThumb, { borderWidth: StyleSheet.hairlineWidth, borderColor: p.border, alignItems: 'center', justifyContent: 'center' }]} accessibilityElementsHidden>
                      <ExerciseGlyph label={e.muscle_group} size={20} color={p.text} />
                    </View>
                  ) : null}
                  <Text style={[styles.exName, { color: p.text }]} numberOfLines={2}>
                    {nameOf(e) || ex.exercise_id}
                  </Text>
                  <Text style={[styles.exSets, { color: p.dim }]}>
                    {groupSets(ex.sets)
                      .map(({ st, n }) =>
                        st.duration_min
                          ? `${st.duration_min} min${st.distance_km ? ` · ${st.distance_km} km` : ''}${st.intensity ? ` · ${t(`int_${st.intensity}`)}` : ''}`
                          : `${n > 1 ? `${n} × ` : ''}${st.reps}${st.weight_kg > 0 ? ` · ${fmtKg(st.weight_kg)} kg` : ' reps'}`,
                      )
                      .join('\n')}
                  </Text>
                </Pressable>
              );
            })}
            {s.energy || s.feeling ? (
              <Text style={[styles.notes, { color: p.secondary }]}>
                {[s.energy ? t('hist_energy', { n: s.energy }) : null, s.feeling ? t('hist_feeling', { n: s.feeling }) : null]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            ) : null}
            {s.notes ? <Text style={[styles.notes, { color: p.secondary }]}>{s.notes}</Text> : null}

            {/* Comentarios propios (diario). */}
            {(s.comments || []).map((c) => (
              <Pressable
                key={c.id}
                accessibilityRole="button"
                accessibilityHint={t('feed_comment_delete_q')}
                onPress={() => setCommentToDelete({ s, id: c.id })}
                style={({ pressed }) => [{ minHeight: 44, justifyContent: 'center', opacity: pressed ? 0.6 : 1 }]}
              >
                <Text style={[styles.comment, { color: p.text, marginTop: 0 }]}>{c.text}</Text>
              </Pressable>
            ))}
            {commenting === s.id ? (
              <View style={styles.commentRow}>
                <TextInput
                  value={draftText}
                  onChangeText={setDraftText}
                  placeholder={t('feed_comment_ph')}
                  placeholderTextColor={p.dim}
                  autoFocus
                  multiline
                  style={[styles.commentInput, { color: p.text, borderColor: p.border, backgroundColor: p.fieldBg }]}
                  accessibilityLabel={t('feed_comment')}
                />
                <Pressable
                  accessibilityRole="button"
                  disabled={!draftText.trim()}
                  onPress={() => void postComment(s)}
                  style={({ pressed }) => [styles.postBtn, { borderColor: p.text, opacity: !draftText.trim() ? 0.4 : pressed ? 0.6 : 1 }]}
                >
                  <Text style={[styles.actionText, { color: p.text }]}>{t('feed_post')}</Text>
                </Pressable>
              </View>
            ) : null}

            {/* Acciones del post: texto, sin rellenos (el único blanco es de otra pantalla). */}
            <View style={[styles.actions, { borderTopColor: p.cardBorder }]}>
              <Pressable accessibilityRole="button" onPress={() => void addPhoto(s)} style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}>
                <Text style={[styles.actionText, { color: p.text }]}>{t('feed_add_photo')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setDraftText('');
                  setCommenting(commenting === s.id ? null : s.id);
                }}
                style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Text style={[styles.actionText, { color: p.text }]}>{t('feed_comment')}</Text>
              </Pressable>
              {(s.photos || []).length > 0 ? (
                <Pressable accessibilityRole="button" onPress={() => void removePhoto(s)} style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}>
                  <Text style={[styles.actionText, { color: p.secondary }]}>{t('feed_remove_photo')}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ))
      )}
      </ScrollView>
      {commentToDelete ? (
        <ConfirmDialog
          visible
          title={t('feed_comment_delete_q')}
          message={(commentToDelete.s.comments || []).find((c) => c.id === commentToDelete.id)?.text || ''}
          confirmLabel={t('delete')}
          cancelLabel={t('cancel')}
          destructive
          onConfirm={() => {
            const { s, id } = commentToDelete;
            setCommentToDelete(null);
            void update(s, { comments: (s.comments || []).filter((c) => c.id !== id) });
          }}
          onCancel={() => setCommentToDelete(null)}
        />
      ) : null}
      {toDelete ? (
        <ConfirmDialog
          visible
          title={t('hist_delete')}
          message={`${fmtDate(toDelete.date, i18n.language)} · ${plural(toDelete.exercises.length, t, 'hist_exercise', 'hist_exercises')}`}
          confirmLabel={t('delete')}
          cancelLabel={t('cancel')}
          destructive
          onConfirm={() => {
            onDeleted(toDelete.id);
            setToDelete(null);
            // Era la última sesión de ese día: volver a la lista completa
            // (si no, saldría "aún no hay sesiones", que no es verdad).
            if (focusDate && list.length === 1) onClearFocus?.();
          }}
          onCancel={() => setToDelete(null)}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  focusRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  focusAll: { minHeight: 44, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, justifyContent: 'center' },
  focusAllText: { fontSize: 14, fontWeight: '600' },
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
    color: '#000000',
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
    color: '#000000',
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
    marginTop: 8,
  },
  photoWrap: { marginBottom: 10 },
  photo: { aspectRatio: 4 / 3, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  comment: { fontSize: 15, lineHeight: 21, marginTop: 8 },
  commentRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 10 },
  commentInput: { flex: 1, minHeight: 44, maxHeight: 120, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  postBtn: { minHeight: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1, justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 4, marginTop: 10, paddingTop: 4, borderTopWidth: StyleSheet.hairlineWidth },
  action: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  actionText: { fontSize: 15, fontWeight: '600' },
});
