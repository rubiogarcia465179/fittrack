/** Hoja inferior para elegir un número con una RUEDA, como la alarma del
 *  iPhone: se desliza, el valor centrado es el elegido y el botón blanco lo
 *  muestra y lo confirma (sin botón "Usar"). Para valores exactos o grandes,
 *  "Escribir" abre el teclado numérico. Altura: unidad cm / m (`altUnit`).
 *  La API (props) es la de la hoja anterior, así los llamadores no cambian. */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { RADII } from '../theme';
import { useTheme } from '../theme-context';
import { useScale, fs } from '../scale';
import { XGlyph } from './TabIcon';

export interface PickerSheetProps {
  open: boolean;
  title: string; // 'Elegir peso'
  unit?: string; // 'kg' | '' | 'min'
  values: number[]; // valores de la rueda (si no hay `custom`)
  value: number; // valor actual
  onSelect: (v: number) => void; // se mantiene por compatibilidad
  onConfirm: (v: number) => void; // aplica y cierra
  custom?: { min: number; max: number; step: number }; // rango de la rueda + escritura libre
  labelCustom?: string; // 'Escribir'
  labelUse?: string; // (sin uso: ya no hay botón "Usar")
  /** Unidad alternativa solo para mostrar (p. ej. altura en m: factor 0,01). */
  altUnit?: { unit: string; factor: number; decimals: number };
}

/** Formatea 12.5 -> '12,5' (local, sin punto decimal). */
export function fmtNum(v: number): string {
  if (Number.isInteger(v)) return String(v);
  const s = v.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return s.replace('.', ',');
}

const ITEM = 46; // alto de cada fila de la rueda
const VISIBLE = 5; // filas visibles (la central es la elegida)
const MAX_ITEMS = 600; // la rueda nunca pinta más filas que esto

/** Valores de la rueda: el rango `custom` (con paso agrandado si saldrían
 *  demasiadas filas) o la lista `values`. Siempre incluye el valor actual. */
function wheelValues(values: number[], custom: PickerSheetProps['custom'], current: number): number[] {
  let out: number[];
  if (custom) {
    let step = custom.step;
    const n = (custom.max - custom.min) / step;
    if (n > MAX_ITEMS) step = step * Math.ceil(n / MAX_ITEMS);
    out = [];
    for (let v = custom.min; v <= custom.max + 1e-9; v += step) out.push(Math.round(v * 100) / 100);
  } else {
    out = [...values];
  }
  if (current > 0 && !out.some((v) => Math.abs(v - current) < 1e-9)) {
    out.push(current);
    out.sort((a, b) => a - b);
  }
  return out;
}

export function PickerSheet({
  open,
  title,
  unit = '',
  values,
  value,
  onConfirm,
  custom,
  labelCustom = 'Escribir',
  altUnit,
}: PickerSheetProps) {
  const { p } = useTheme();
  const scale = useScale();
  const items = useMemo(() => wheelValues(values, custom, value), [values, custom, value]);
  const startIdx = () => {
    if (!items.length) return 0;
    let best = 0;
    items.forEach((v, i) => {
      if (Math.abs(v - value) < Math.abs(items[best] - value)) best = i;
    });
    return value > 0 ? best : Math.min(items.length - 1, Math.floor(items.length / 3));
  };
  const [idx, setIdx] = useState(startIdx);
  const [typing, setTyping] = useState(false);
  const [txt, setTxt] = useState('');
  const [useAlt, setUseAlt] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scrollRef = useRef<any>(null); // (mismo tipado que SessionScreen: RN 0.88)

  useEffect(() => {
    if (!open) return;
    const i = startIdx();
    setIdx(i);
    setTyping(false);
    setTxt(value > 0 ? fmtNum(value).replace(',', '.') : '');
    const t1 = setTimeout(() => scrollRef.current?.scrollTo({ y: i * ITEM, animated: false }), 0);
    return () => clearTimeout(t1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, value]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.max(0, Math.min(items.length - 1, Math.round(e.nativeEvent.contentOffset.y / ITEM)));
    if (i !== idx) setIdx(i);
  };

  // Valor mostrado (unidad alternativa solo cambia la etiqueta).
  const show = (v: number) => (useAlt && altUnit ? (v * altUnit.factor).toFixed(altUnit.decimals).replace('.', ',') : fmtNum(v));
  const shownUnit = useAlt && altUnit ? altUnit.unit : unit;

  const typed = (() => {
    const n = parseFloat(txt.replace(',', '.'));
    if (Number.isNaN(n)) return null;
    const v = useAlt && altUnit ? n / altUnit.factor : n;
    if (custom && (v < custom.min || v > custom.max)) return null;
    return Math.round(v * 100) / 100;
  })();
  const sel = typing ? typed : items[idx];
  const confirm = () => {
    if (sel != null) onConfirm(sel);
  };

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={confirm}>
      <Pressable style={[styles.backdrop, { backgroundColor: p.overlay }]} onPress={confirm} accessibilityLabel={title}>
        <Pressable style={[styles.sheet, { backgroundColor: p.card }]} onPress={() => undefined}>
          <View style={[styles.handle, { backgroundColor: p.border }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { fontSize: fs(scale, 21), color: p.text }]}>{title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={title}
              onPress={confirm}
              style={({ pressed }) => [styles.closeBtn, { backgroundColor: p.fieldBg, opacity: pressed ? 0.7 : 1 }]}
            >
              <XGlyph size={15} color={p.secondary} />
            </Pressable>
          </View>

          {altUnit ? (
            <View style={[styles.units, { borderColor: p.border }]} accessibilityRole="tablist">
              {[false, true].map((alt) => {
                const on = useAlt === alt;
                return (
                  <Pressable
                    key={String(alt)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: on }}
                    onPress={() => {
                      setUseAlt(alt);
                      if (typing && sel != null) setTxt(alt ? (sel * altUnit.factor).toFixed(altUnit.decimals) : fmtNum(sel).replace(',', '.'));
                    }}
                    style={[styles.unitBtn, { backgroundColor: on ? p.accent : 'transparent' }]}
                  >
                    <Text style={[styles.unitText, { color: on ? p.onAccent : p.text }]}>{alt ? altUnit.unit : unit}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {typing ? (
            <View style={[styles.typeRow, { backgroundColor: p.fieldBg }]}>
              <TextInput
                value={txt}
                onChangeText={setTxt}
                keyboardType="decimal-pad"
                autoFocus
                placeholder="0"
                placeholderTextColor={p.dim}
                style={[styles.typeInput, { color: p.text, fontSize: fs(scale, 32) }]}
                accessibilityLabel={title}
              />
              {shownUnit ? <Text style={[styles.typeUnit, { color: p.secondary }]}>{shownUnit}</Text> : null}
            </View>
          ) : (
            <View style={{ height: ITEM * VISIBLE }}>
              {/* Banda central: el valor elegido */}
              <View
                pointerEvents="none"
                style={[styles.band, { top: ITEM * 2, height: ITEM, backgroundColor: p.fieldBg, borderColor: p.border }]}
              />
              <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM}
                decelerationRate="fast"
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingVertical: ITEM * 2 }}
                accessibilityRole="adjustable"
                accessibilityLabel={`${title}: ${items[idx] != null ? show(items[idx]) : ''} ${shownUnit}`}
              >
                {items.map((v, i) => {
                  const d = Math.abs(i - idx);
                  return (
                    <Pressable
                      key={`${v}-${i}`}
                      onPress={() => scrollRef.current?.scrollTo({ y: i * ITEM, animated: true })}
                      style={styles.item}
                      accessibilityElementsHidden
                    >
                      <Text
                        style={{
                          color: d === 0 ? p.text : p.secondary,
                          fontSize: fs(scale, d === 0 ? 26 : 20),
                          fontWeight: d === 0 ? '700' : '500',
                          opacity: d === 0 ? 1 : d === 1 ? 0.75 : 0.4,
                          fontVariant: ['tabular-nums'],
                        }}
                      >
                        {show(v)}
                        {d === 0 && shownUnit ? <Text style={{ fontSize: fs(scale, 16), color: p.secondary }}>{`  ${shownUnit}`}</Text> : null}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {custom ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setTyping((x) => !x)}
              hitSlop={8}
              style={({ pressed }) => [styles.typeToggle, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Text style={[styles.typeToggleText, { color: p.secondary }]}>{typing ? '↺' : labelCustom}</Text>
            </Pressable>
          ) : null}

          {/* Botón blanco: muestra el valor y lo confirma (sin "Usar"). */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${title}: ${sel != null ? show(sel) : '—'} ${shownUnit}`}
            disabled={sel == null}
            onPress={confirm}
            style={({ pressed }) => [
              styles.confirm,
              { borderRadius: RADII.pill, backgroundColor: p.accent, opacity: sel == null ? 0.4 : pressed ? 0.9 : 1 },
            ]}
          >
            <Text style={[styles.confirmText, { fontSize: fs(scale, 19), color: p.onAccent }]}>
              {sel != null ? `${show(sel)}${shownUnit ? ' ' + shownUnit : ''}` : '—'}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
  },
  handle: { width: 42, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 2 },
  title: { fontWeight: '700' },
  closeBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  units: { flexDirection: 'row', alignSelf: 'center', borderWidth: 1, borderRadius: 20, padding: 3, marginBottom: 8 },
  unitBtn: { minWidth: 72, minHeight: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  unitText: { fontSize: 15, fontWeight: '600' },
  band: { position: 'absolute', left: 0, right: 0, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  item: { height: ITEM, alignItems: 'center', justifyContent: 'center' },
  typeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 16, height: ITEM * 2.4, paddingHorizontal: 16 },
  typeInput: { minWidth: 120, textAlign: 'center', fontWeight: '700' },
  typeUnit: { fontSize: 18, marginLeft: 8 },
  typeToggle: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 },
  typeToggleText: { fontSize: 15, fontWeight: '600' },
  confirm: { height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  confirmText: { fontWeight: '700' },
});
