/**
 * Hoja "Cambiar ejercicio" (R-176/R-177; app y web, mismo componente).
 * Un solo sitio para lo que pasa de verdad en el gimnasio:
 * 1. "Por uno parecido": 3 alternativas (mismo grupo, material parecido) →
 *    "Usar" lo sustituye; lo ya hecho del original se guarda.
 * 2. "Hacerlo más tarde": el ejercicio pasa al final (máquina ocupada).
 * 3. "Orden": los ejercicios pendientes con Subir / Bajar.
 * Sin arrastrar (frágil en táctil y sin dependencias): flechas de 44 pt.
 */
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme-context';
import { ExerciseThumb } from './ExerciseThumb';

export type ChangeAlt = { id: string; group: string; name: string; sub: string };
export type ChangeRow = { key: string; id: string; group: string; name: string; done: boolean; current: boolean };

function Arrow({ up, color }: { up: boolean; color: string }) {
  // Chevron dibujado (sin fuentes de iconos ni emoji).
  return (
    <View
      style={{
        width: 10,
        height: 10,
        borderLeftWidth: 2,
        borderTopWidth: 2,
        borderColor: color,
        transform: [{ rotate: up ? '45deg' : '225deg' }],
        marginTop: up ? 4 : -4,
      }}
    />
  );
}

export function ChangeSheet({
  title,
  alts,
  rows,
  onSwap,
  onLater,
  onMove,
  onClose,
}: {
  /** Nombre del ejercicio que se cambia. */
  title: string;
  alts: ChangeAlt[];
  /** Todos los ejercicios en su orden (hechos incluidos, sin flechas). */
  rows: ChangeRow[];
  onSwap: (id: string) => void;
  /** null = ya es el último pendiente. */
  onLater: (() => void) | null;
  onMove: (from: number, to: number) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { p } = useTheme();
  const { width: winW } = useWindowDimensions();
  const wide = winW > 700;
  // Solo se mueve entre pendientes: lo hecho queda donde está.
  const movable = rows.map((r) => !r.done);
  const prevMovable = (i: number) => {
    for (let j = i - 1; j >= 0; j--) if (movable[j]) return j;
    return -1;
  };
  const nextMovable = (i: number) => {
    for (let j = i + 1; j < rows.length; j++) if (movable[j]) return j;
    return -1;
  };

  return (
    <Modal visible transparent animationType={wide ? 'fade' : 'slide'} onRequestClose={onClose}>
      <View style={[styles.frame, wide && styles.frameWide]}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: p.overlay }]} onPress={onClose} accessibilityLabel={t('howto_close')} />
        <View style={[styles.sheet, { backgroundColor: p.bg, borderColor: p.border }, wide && styles.sheetWide]} accessibilityViewIsModal>
          <View style={[styles.handle, { backgroundColor: p.border }]} />
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, { color: p.text }]} accessibilityRole="header">{t('chg_title')}</Text>
            <Text style={[styles.sub, { color: p.secondary }]} numberOfLines={2}>{title}</Text>

            <Text style={[styles.section, { color: p.secondary }]}>{t('chg_similar')}</Text>
            {alts.length === 0 ? <Text style={[styles.none, { color: p.secondary }]}>{t('chg_none')}</Text> : null}
            {alts.map((a) => (
              <View key={a.id} style={[styles.row, { borderBottomColor: p.border }]}>
                <View style={[styles.thumb, { borderColor: p.border }]}>
                  <ExerciseThumb id={a.id} group={a.group} size={40} color={p.text} />
                </View>
                <View style={styles.rowMain}>
                  <Text style={[styles.rowName, { color: p.text }]} numberOfLines={2}>{a.name}</Text>
                  {a.sub ? <Text style={[styles.rowSub, { color: p.secondary }]} numberOfLines={1}>{a.sub}</Text> : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${t('alt_use')} ${a.name}`}
                  onPress={() => onSwap(a.id)}
                  style={({ pressed }) => [styles.use, { borderColor: p.text, opacity: pressed ? 0.6 : 1 }]}
                >
                  <Text style={[styles.useText, { color: p.text }]}>{t('alt_use')}</Text>
                </Pressable>
              </View>
            ))}

            {onLater ? (
              <Pressable
                accessibilityRole="button"
                onPress={onLater}
                style={({ pressed }) => [styles.later, { borderColor: p.border, opacity: pressed ? 0.6 : 1 }]}
              >
                <Text style={[styles.laterText, { color: p.text }]}>{t('chg_later')}</Text>
              </Pressable>
            ) : null}

            {rows.filter((r) => !r.done).length > 1 ? (
              <>
                <Text style={[styles.section, { color: p.secondary }]}>{t('chg_order')}</Text>
                {rows.map((r, i) => {
                  const up = movable[i] ? prevMovable(i) : -1;
                  const down = movable[i] ? nextMovable(i) : -1;
                  return (
                    <View key={r.key} style={[styles.row, { borderBottomColor: p.border, opacity: r.done ? 0.45 : 1 }]}>
                      <Text style={[styles.num, { color: p.secondary }]}>{i + 1}</Text>
                      <View style={styles.rowMain}>
                        <Text style={[styles.rowName, { color: p.text, fontWeight: r.current ? '800' : '600' }]} numberOfLines={2}>{r.name}</Text>
                        {r.current ? <Text style={[styles.rowSub, { color: p.secondary }]}>{t('sess_now')}</Text> : null}
                      </View>
                      {r.done ? null : (
                        <View style={styles.arrows}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`${t('chg_up')}: ${r.name}`}
                            accessibilityState={{ disabled: up < 0 }}
                            disabled={up < 0}
                            onPress={() => onMove(i, up)}
                            style={({ pressed }) => [styles.arrow, { borderColor: p.border, opacity: up < 0 ? 0.25 : pressed ? 0.6 : 1 }]}
                          >
                            <Arrow up color={p.text} />
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`${t('chg_down')}: ${r.name}`}
                            accessibilityState={{ disabled: down < 0 }}
                            disabled={down < 0}
                            onPress={() => onMove(i, down)}
                            style={({ pressed }) => [styles.arrow, { borderColor: p.border, opacity: down < 0 ? 0.25 : pressed ? 0.6 : 1 }]}
                          >
                            <Arrow up={false} color={p.text} />
                          </Pressable>
                        </View>
                      )}
                    </View>
                  );
                })}
              </>
            ) : null}

            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [styles.close, { backgroundColor: p.text, opacity: pressed ? 0.85 : 1 }]}
            >
              <Text style={[styles.closeText, { color: p.bg }]}>{t('howto_close')}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1, justifyContent: 'flex-end' },
  frameWide: { justifyContent: 'center', paddingVertical: 24 },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: StyleSheet.hairlineWidth, borderBottomWidth: 0, maxHeight: '90%' },
  sheetWide: { width: 560, alignSelf: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderRadius: 20 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 8 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  sub: { fontSize: 15, marginTop: 4 },
  section: { fontSize: 13, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 22, marginBottom: 4 },
  none: { fontSize: 15, paddingVertical: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  thumb: { width: 48, height: 48, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  rowMain: { flex: 1 },
  rowName: { fontSize: 16, fontWeight: '600' },
  rowSub: { fontSize: 13, marginTop: 2 },
  use: { minHeight: 44, minWidth: 72, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  useText: { fontSize: 15, fontWeight: '700' },
  later: { marginTop: 16, minHeight: 48, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  laterText: { fontSize: 16, fontWeight: '700' },
  num: { width: 20, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  arrows: { flexDirection: 'row', gap: 8 },
  arrow: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  close: { marginTop: 24, minHeight: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 16, fontWeight: '700' },
});
