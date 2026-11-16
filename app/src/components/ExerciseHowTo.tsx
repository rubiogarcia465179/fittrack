/**
 * Hoja "¿Cómo se hace?" (durante la sesión): fotos (hasta 3, deslizables),
 * qué entrena (grupo principal + músculos secundarios) y los pasos.
 * - Fotos: `photosFor(id)` (app/src/exercisePhotos.ts, generado por
 *   scripts/make_photo_map.js desde data/images/photos/<id>-1..3.jpg). Sin
 *   fotos propias → imagen de ejemplo, marcada como tal (regla de oro).
 * - Pasos: howtoFor(id, idioma) — explicación sencilla en NL/ES/EN/FR
 *   (data/exercises/howto/, redactada por FitTrack; ver app/src/howto.ts).
 */
import { useState } from 'react';
import { Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme-context';
import { exName } from '../lib/names';
import { photosFor } from '../exercisePhotos';
import { howtoFor } from '../howto';
import type { ExerciseRow } from '../lib/gym';

export function ExerciseHowTo({ exercise, onClose }: { exercise: ExerciseRow; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const { p } = useTheme();
  const lang = i18n.language as string;
  const { images, placeholder, kind } = photosFor(exercise.id);
  const width = Math.min(Dimensions.get('window').width, 640) - 40;
  const [page, setPage] = useState(0);
  const secondary = exercise.secondary_muscles || [];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.back, { backgroundColor: p.overlay }]} onPress={onClose} accessibilityLabel={t('howto_close')} />
      <View style={[styles.sheet, { backgroundColor: p.bg, borderColor: p.border }]}>
        <View style={[styles.handle, { backgroundColor: p.border }]} />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: p.text }, styles.titleTight]} accessibilityRole="header">
            {exName(exercise, lang)}
          </Text>
          {/* Material y nivel (antes en la pantalla de detalle). */}
          <Text style={[styles.meta, { color: p.secondary }]}>
            {[exercise.equipment !== 'other' ? t(`equip_${exercise.equipment}`) : null, t(`level_${exercise.level}`)].filter(Boolean).join(' · ')}
          </Text>

          {/* Fotos */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
            onScroll={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
            scrollEventThrottle={64}
            style={[styles.photos, { width }]}
          >
            {images.map((src, i) => (
              <View key={i} style={{ width }}>
                {kind === 'drawing' ? (
                  // Dibujo de línea (fondo transparente): se tiñe con el color del
                  // texto, así es blanco en Noche y negro en Día.
                  <View style={[styles.photo, { width, borderColor: p.border, backgroundColor: p.card, alignItems: 'center', justifyContent: 'center' }]}>
                    <Image
                      source={src}
                      style={{ width: width - 24, height: '92%', tintColor: p.text }}
                      resizeMode="contain"
                      accessibilityLabel={`${exName(exercise, lang)}: ${t(i === 0 ? 'howto_pos_start' : 'howto_pos_end')}`}
                    />
                  </View>
                ) : (
                  <Image source={src} style={[styles.photo, { width, borderColor: p.border }]} resizeMode="cover" accessibilityLabel={`${exName(exercise, lang)} ${i + 1}/${images.length}`} />
                )}
                {placeholder ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{t('howto_sample_photo')}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>
          <View style={styles.dots} accessibilityElementsHidden>
            {images.map((_, i) => (
              <View key={i} style={[styles.dot, { backgroundColor: i === page ? p.text : p.border }]} />
            ))}
          </View>
          {kind === 'drawing' ? (
            // Atribución CC BY-SA junto a la obra (y en Licencias y créditos).
            <Text style={[styles.credit, { color: p.dim }]}>
              {`${t(page === 0 ? 'howto_pos_start' : 'howto_pos_end')} · ${t('howto_drawing_credit')}`}
            </Text>
          ) : null}

          {/* Qué entrena */}
          <Text style={[styles.section, { color: p.secondary }]}>{t('howto_trains')}</Text>
          {/* Texto, no fichas: no se pulsan y no deben competir con "Cerrar". */}
          <Text style={styles.trains}>
            <Text style={{ color: p.text, fontWeight: '700' }}>{t(`group_${exercise.muscle_group}`)}</Text>
            {secondary.map((m) => (
              <Text key={m} style={{ color: p.secondary }}>{` · ${t(`muscle_${m}`, { defaultValue: m })}`}</Text>
            ))}
          </Text>

          {/* Cómo se hace */}
          <Text style={[styles.section, { color: p.secondary }]}>{t('howto_steps')}</Text>
          {howtoFor(exercise.id, lang, exercise.instructions).map((line, i) => (
            <View key={i} style={styles.step}>
              <Text style={[styles.stepNum, { color: p.onAccent, backgroundColor: p.accent }]}>{i + 1}</Text>
              <Text style={[styles.stepText, { color: p.text }]}>{line}</Text>
            </View>
          ))}
          <Text style={[styles.note, { color: p.secondary }]}>{t('howto_lang_note')}</Text>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [styles.close, { backgroundColor: p.accent, opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={[styles.closeText, { color: p.onAccent }]}>{t('howto_close')}</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  back: { flex: 1 },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    maxHeight: '90%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 8 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, marginBottom: 14 },
  titleTight: { marginBottom: 4 },
  meta: { fontSize: 15, marginBottom: 14 },
  photos: { alignSelf: 'center' },
  photo: { height: 240, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  badge: {
    position: 'absolute',
    left: 10,
    top: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  credit: { fontSize: 12, textAlign: 'center', marginTop: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  section: { fontSize: 13, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 22, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  trains: { fontSize: 16, lineHeight: 22 },
  chip: { minHeight: 34, borderRadius: 17, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontSize: 14, fontWeight: '600' },
  step: { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'flex-start' },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 13,
    fontWeight: '800',
    overflow: 'hidden',
  },
  stepText: { flex: 1, fontSize: 15, lineHeight: 22 },
  note: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  close: { marginTop: 22, minHeight: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 16, fontWeight: '700' },
});
