/**
 * Cómo cargar el peso (R-163), bajo el peso de la serie:
 * - Barra: los discos de UN lado dibujados (alto según el peso) + "por lado"
 *   y el total con la barra de 20 kg.
 * - Mancuernas: "2 × 12 kg · 24 kg en total".
 * Máquina, polea o sin peso: nada (no hay nada que montar).
 */
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme-context';
import { fmtKg, loadFor } from '../lib/plates';

export function LoadLine({ equipment, kg, name_en, center = true }: { equipment?: string; kg: number; name_en?: string; center?: boolean }) {
  const { t, i18n } = useTranslation();
  const { p } = useTheme();
  const lang = i18n.language;
  const load = loadFor(equipment, kg, name_en);
  if (!load) return null;
  const f = (v: number) => fmtKg(v, lang);
  if (load.kind === 'dumbbell') {
    const text = t('load_dumbbells', { hand: f(load.perHand), total: f(load.total) });
    return (
      <Text style={[styles.text, { color: p.secondary, textAlign: center ? 'center' : 'left' }]} accessibilityLabel={text}>
        {text}
      </Text>
    );
  }
  const side = load.perSide;
  const text = side.length
    ? t('load_barbell', { side: side.map(f).join(' + '), bar: f(load.bar), total: f(load.total) })
    : t('load_bar_only', { bar: f(load.bar) });
  return (
    <View style={[styles.wrap, center && { alignItems: 'center' }]} accessible accessibilityLabel={text}>
      {side.length ? (
        // La barra entera: discos a los dos lados (los grandes por dentro), como se carga.
        <View style={styles.plates} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={[styles.sleeveEnd, { backgroundColor: p.secondary }]} />
          {[...side].reverse().map((w, i) => <Plate key={`l${i}`} w={w} />)}
          <View style={[styles.bar, { backgroundColor: p.secondary }]} />
          {side.map((w, i) => <Plate key={`r${i}`} w={w} />)}
          <View style={[styles.sleeveEnd, { backgroundColor: p.secondary }]} />
        </View>
      ) : null}
      <Text style={[styles.text, { color: p.secondary, textAlign: center ? 'center' : 'left' }]} numberOfLines={1} adjustsFontSizeToFit>{text}</Text>
    </View>
  );
}

/** Un disco: alto según el peso; los de 10 kg o más, rellenos. */
function Plate({ w }: { w: number }) {
  const { p } = useTheme();
  return <View style={[styles.plate, { height: 14 + Math.round((w / 25) * 30), borderColor: p.text, backgroundColor: w >= 10 ? p.text : 'transparent' }]} />;
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  plates: { flexDirection: 'row', alignItems: 'center', height: 46 },
  bar: { width: 56, height: 4, borderRadius: 2 },
  sleeveEnd: { width: 10, height: 4, borderRadius: 2 },
  plate: { width: 9, borderRadius: 2, borderWidth: 1.5, marginHorizontal: 1 },
  text: { fontSize: 14, lineHeight: 20, fontVariant: ['tabular-nums'] },
});
