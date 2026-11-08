/** Barras verticales dibujadas con View (sin react-native-svg). */
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme-context';

export interface Bar {
  label: string;
  value: number;
  color?: string;
}

export default function BarChart({
  title,
  data,
  emptyText,
  height = 132,
}: {
  title: string;
  data: Bar[];
  emptyText: string;
  height?: number;
}) {
  const { p, SHADOW } = useTheme();
  const max = data.reduce((m, d) => Math.max(m, d.value), 0);
  // Altura disponible para las BARRAS: reservamos sitio para el valor (14px)
  // y la etiqueta (15px) de cada columna, para que nada se suba al título.
  const plot = Math.max(24, height - 40);
  return (
    <View style={[styles.card, { backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card }]} accessibilityLabel={title}>
      <Text style={[styles.title, { color: p.text }]}>{title}</Text>
      {max <= 0 ? (
        <Text style={[styles.empty, { color: p.dim }]}>{emptyText}</Text>
      ) : (
        <View style={[styles.bars, { height }]}>
          {data.map((d, i) => {
            const pct = max > 0 ? Math.max(0.04, d.value / max) : 0.04;
            return (
              <View key={d.label + i} style={styles.col}>
                <View style={[styles.barWrap, { height: plot }]}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.round(pct * plot),
                        backgroundColor: d.color || p.accent,
                      },
                    ]}
                    accessibilityElementsHidden
                  />
                </View>
                <Text style={[styles.value, { color: p.secondary }]} numberOfLines={1}>
                  {Math.round(d.value)}
                </Text>
                <Text style={[styles.label, { color: p.dim }]} numberOfLines={1}>
                  {d.label}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  empty: {
    fontSize: 13,
    paddingVertical: 16,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  barWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '62%',
    maxWidth: 34,
    borderRadius: 8,
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
    maxWidth: 60,
  },
});
