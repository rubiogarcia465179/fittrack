/** Hoja inferior con lista grande de valores para elegir (peso, reps,
 *  duración…) — menos clicks y sin teclear: se toca el valor.
 *  Sheet redondeado, chips grandes con feedback táctil, CTA a pantalla. */
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { RADII } from '../theme';
import { useTheme } from '../theme-context';
import { useScale, fs } from '../scale';
import { XGlyph } from './TabIcon';

export interface PickerSheetProps {
  open: boolean;
  title: string; // 'Elegir peso'
  unit?: string; // 'kg' | '' | 'min'
  values: number[]; // chips principales
  value: number; // valor actual (si no está en values, se muestra en la línea personalizada)
  onSelect: (v: number) => void; // cambia la selección local
  onConfirm: (v: number) => void; // aplica y cierra
  custom?: { min: number; max: number; step: number }; // permite valor personalizado
  labelCustom?: string; // 'Otro valor'
  labelUse?: string; // 'Usar'
}

/** Formatea 12.5 -> '12,5' (local, sin punto decimal). */
export function fmtNum(v: number): string {
  if (Number.isInteger(v)) return String(v);
  const s = v.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return s.replace('.', ',');
}

export function PickerSheet({
  open,
  title,
  unit = '',
  values,
  value,
  onSelect,
  onConfirm,
  custom,
  labelCustom = 'Otro valor',
  labelUse = 'Usar',
}: PickerSheetProps) {
  const { p, GRADIENT_STOPS } = useTheme();
  const scale = useScale();
  const [sel, setSel] = useState<number>(value);
  const [txt, setTxt] = useState<string>(
    Number.isInteger(value) ? String(value) : fmtNum(value).replace(',', '.'),
  );
  useEffect(() => {
    if (open) {
      setSel(value);
      setTxt(Number.isInteger(value) ? String(value) : fmtNum(value).replace(',', '.'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, value]);

  const chipW = (343 - 2 * 14 - 2 * 8) / 3; // 3 columnas, márgenes 14
  const customVal = parseFloat(txt.replace(',', '.'));

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={() => onConfirm(sel)}>
      <Pressable style={[styles.backdrop, { backgroundColor: p.overlay }]} onPress={() => onConfirm(sel)} accessibilityLabel={title}>
        <View style={[styles.sheet, { backgroundColor: p.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { fontSize: fs(scale, 21), color: p.text }]}>{title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={title}
              onPress={() => onConfirm(sel)}
              style={({ pressed }) => [
                styles.closeBtn,
                { backgroundColor: p.fieldBg, opacity: pressed ? 0.7 : 1, transition: 'opacity 90ms ease' },
              ]}
            >
              <XGlyph size={15} color={p.secondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.chipsScroll} contentContainerStyle={styles.chips} showsVerticalScrollIndicator={false}>
            {values.map((v) => {
              const isSel = sel === v;
              return (
                <Pressable
                  key={v}
                  accessibilityRole="button"
                  accessibilityLabel={`${fmtNum(v)}${unit ? ' ' + unit : ''}`}
                  accessibilityState={{ selected: isSel }}
                  onPress={() => setSel(v)}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      width: chipW,
                      borderRadius: RADII.field,
                      backgroundColor: isSel ? p.accent : p.chipOff,
                      transform: [{ scale: pressed ? 0.94 : 1 }],
                      transition: 'transform 80ms ease, background-color 120ms ease',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { fontSize: fs(scale, 18), color: isSel ? '#ffffff' : p.chipOffText },
                    ]}
                  >
                    {fmtNum(v)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {custom && (
            <View style={styles.customRow}>
              <Text style={[styles.customLabel, { fontSize: fs(scale, 16), color: p.secondary }]}>{labelCustom}</Text>
              <View style={[styles.customInputWrap, { backgroundColor: p.fieldBg }]}>
                <TextInput
                  value={txt}
                  onChangeText={setTxt}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={p.dim}
                  style={[styles.customInput, { fontSize: fs(scale, 18), height: 46, borderRadius: RADII.field, color: p.text }]}
                />
                {unit ? (
                  <Text style={[styles.customUnit, { fontSize: fs(scale, 15), color: p.dim }]}>{unit}</Text>
                ) : null}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={labelCustom}
                onPress={() => {
                  if (!Number.isNaN(customVal) && customVal >= custom.min && customVal <= custom.max) setSel(customVal);
                }}
                style={({ pressed }) => [
                  styles.useBtn,
                  {
                    borderRadius: RADII.pill,
                    backgroundColor: p.accent,
                    opacity: pressed ? 0.8 : 1,
                    transition: 'opacity 90ms ease',
                  },
                ]}
              >
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: fs(scale, 16) }}>{labelUse}</Text>
              </Pressable>
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${title}: ${fmtNum(sel)}`}
            onPress={() => onConfirm(sel)}
            style={({ pressed }) => [
              styles.confirm,
              {
                borderRadius: RADII.pill,
                background: `linear-gradient(180deg, ${GRADIENT_STOPS[0]} 0%, ${GRADIENT_STOPS[1]} 100%)`,
                backgroundColor: GRADIENT_STOPS[0],
                height: 56,
                opacity: pressed ? 0.9 : 1,
                transition: 'opacity 90ms ease',
              } as object,
            ]}
          >
            <Text style={[styles.confirmText, { fontSize: fs(scale, 19), color: '#fff' }]}>
              {unit ? `${fmtNum(sel)} ${unit}` : String(fmtNum(sel))}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 28,
    // La hoja nunca ocupa más que el 85% de la pantalla: si hay muchos
    // valores, la rejilla hace scroll (no se pisa la fila de valor propio).
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  title: { fontWeight: '700' },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsScroll: {
    flex: 1, // ocupa el resto de la hoja y hace scroll si hay muchos valores
    minHeight: 110,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontWeight: '600' },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  customLabel: { minWidth: 92 },
  customInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADII.field,
    paddingHorizontal: 14,
  },
  customInput: {
    flex: 1,
  },
  customUnit: { marginLeft: 6 },
  useBtn: {
    paddingHorizontal: 18,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirm: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: { fontWeight: '700' },
});
