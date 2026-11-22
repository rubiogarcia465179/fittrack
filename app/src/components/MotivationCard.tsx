/**
 * Al terminar (R-170): un mensaje motivador al azar, redactado por FitTrack.
 * Sin nombre de ninguna persona real (R-182: pauta 5.2.1 de Apple) y sin sus
 * frases características; nunca entre comillas como cita.
 */
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme-context';
import { pickMotivation } from '../lib/restTips';

export function MotivationCard({ seed }: { seed?: number }) {
  const { t } = useTranslation();
  const { p } = useTheme();
  const [n] = useState(() => seed ?? pickMotivation());
  return (
    <View style={[styles.card, { borderLeftColor: p.text }]} accessible>
      <Text style={[styles.msg, { color: p.text }]}>{t(`gg_${n}`)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderLeftWidth: 3, paddingLeft: 16, paddingVertical: 4, marginTop: 20 },
  msg: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4, lineHeight: 28 },
});
