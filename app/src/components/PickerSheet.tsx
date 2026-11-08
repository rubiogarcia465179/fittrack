/** Hoja inferior con lista grande de valores para elegir (peso, reps,
 *  duración…) — menos clicks y sin teclear: se toca el valor.
 *  Diseño tipo Apple: sheet redondeado, chips grandes, CTA a pantalla. */
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
import { COLORS, RADII, GRADIENT_STOPS } from '../theme';
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
  accent?: string; // color del chip seleccionado (por defecto azul)
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
  accent = COLORS.blue,
}: PickerSheetProps) {
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
  }, [open, value]);

  const chipW = (343 - 2 * 14 - 2 * 8) / 3; // 3 columnas, márgenes 14
  const customVal = parseFloat(txt.replace(',', '.'));

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={() => onConfirm(sel)}>
      <Pressable
        style={styles.backdrop}
        onPress={() => onConfirm(sel)}
        accessibilityLabel={title}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={[styles.title, { fontSize: fs(scale, 21), color: COLORS.text }]}>{title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={title}
              onPress={() => onConfirm(sel)}
              style={styles.closeBtn}
            >
              <XGlyph size={15} color={COLORS.secondary} />
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
                  style={[
                    styles.chip,
                    {
                      width: chipW,
                      borderRadius: RADII.field,
                      backgroundColor: isSel ? accent : COLORS.fieldBg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        fontSize: fs(scale, 18),
                        color: isSel ? '#ffffff' : COLORS.text,
                      },
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
              <Text style={[styles.customLabel, { fontSize: fs(scale, 16), color: COLORS.secondary }]}>
                {labelCustom}
              </Text>
              <View style={styles.customInputWrap}>
                <TextInput
                  value={txt}
                  onChangeText={setTxt}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={COLORS.dim}
                  style={[
                    styles.customInput,
                    {
                      fontSize: fs(scale, 18),
                      height: 46,
                      borderRadius: RADII.field,
                    },
                  ]}
                />
                {unit ? (
                  <Text style={[styles.customUnit, { fontSize: fs(scale, 15), color: COLORS.dim }]}>
                    {unit}
                  </Text>
                ) : null}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={labelCustom}
                onPress={() => {
                  if (!Number.isNaN(customVal) && customVal >= custom.min && customVal <= custom.max) setSel(customVal);
                }}
                style={[
                  styles.useBtn,
                  {
                    borderRadius: RADII.pill,
                    backgroundColor: !Number.isNaN(customVal) && sel === customVal ? accent : '#0071e3',
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
            style={[
              styles.confirm,
              {
                borderRadius: RADII.pill,
                background: `linear-gradient(180deg, ${GRADIENT_STOPS[0]} 0%, ${GRADIENT_STOPS[1]} 100%)`,
                backgroundColor: GRADIENT_STOPS[0],
                height: 56,
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
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
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
    backgroundColor: COLORS.fieldBg,
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
    backgroundColor: COLORS.fieldBg,
    borderRadius: RADII.field,
    paddingHorizontal: 14,
  },
  customInput: {
    flex: 1,
    color: COLORS.text,
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
