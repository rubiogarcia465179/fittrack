/**
 * Al terminar (R-170): un mensaje al azar inspirado en David Goggins (sus
 * libros "Can't Hurt Me", 2018, y "Never Finished", 2022). Regla de oro: no
 * son citas literales; se dice "inspirado en", nunca se ponen entre comillas
 * como frase suya.
 */
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme-context';
import { pickGoggins } from '../lib/restTips';

export function GogginsCard({ seed }: { seed?: number }) {
  const { t } = useTranslation();
  const { p } = useTheme();
  const [n] = useState(() => seed ?? pickGoggins());
  return (
    <View style={[styles.card, { borderLeftColor: p.text }]} accessible>
      <Text style={[styles.msg, { color: p.text }]}>{t(`gg_${n}`)}</Text>
      <Text style={[styles.by, { color: p.secondary }]}>{t('gg_by')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderLeftWidth: 3, paddingLeft: 16, paddingVertical: 4, marginTop: 20 },
  msg: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, lineHeight: 28 },
  by: { fontSize: 13, marginTop: 8 },
});
