/** Bloque "Tus datos" en el Resumen: exporta todo a JSON y permite borrar
 *  todo el historial con confirmación explícita (acción peligrosa = dos
 *  pasos grandes y claros). El feedback de éxito es una línea en pantalla
 *  (Alert.alert no existe en react-native-web; esto funciona en todo). */
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Clipboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RADII } from '../theme';
import { useTheme } from '../theme-context';
import { useScale, fs } from '../scale';
import { ConfirmDialog } from './ConfirmDialog';

export interface DataSectionProps {
  t: (k: string) => string;
  onExport: () => Promise<string>;
  onClear: () => Promise<void>;
  onDone: () => void; // recargar datos en pantalla
}

export function DataSection({ t, onExport, onClear, onDone }: DataSectionProps) {
  const { p, SHADOW } = useTheme();
  const scale = useScale();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState<'export' | 'clear' | null>(null);
  const [status, setStatus] = useState('');

  // El estado de éxito se limpia solo pasados 4 s.
  useEffect(() => {
    if (!status) return;
    const t1 = setTimeout(() => setStatus(''), 4000);
    return () => clearTimeout(t1);
  }, [status]);

  async function exportData() {
    if (busy) return;
    setBusy('export');
    setStatus('');
    try {
      const json = await onExport();
      let copied = false;
      try {
        await Clipboard.setString(json);
        copied = true;
      } catch {
        copied = false;
      }
      setStatus(copied ? t('data_copied') : t('data_exported'));
    } catch {
      setStatus('');
    } finally {
      setBusy(null);
    }
  }

  async function confirmClear() {
    if (busy) return;
    setBusy('clear');
    try {
      await onClear();
      setConfirming(false);
      onDone();
      setStatus(t('data_cleared'));
    } finally {
      setBusy(null);
    }
  }

  return (
    <View>
      <View style={[styles.card, { borderRadius: RADII.tile, backgroundColor: p.card, borderColor: p.cardBorder, ...SHADOW.card }]}>
        <Text style={[styles.title, { fontSize: fs(scale, 19), color: p.text }]}>{t('data_title')}</Text>
        <Text style={[styles.note, { fontSize: fs(scale, 15), color: p.secondary, marginTop: 6 }]}>{t('data_note')}</Text>
        <View style={styles.row}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('data_export')}
            disabled={busy != null}
            onPress={exportData}
            style={({ pressed }) => [
              styles.btn,
              {
                flex: 1,
                height: 54,
                borderRadius: RADII.pill,
                backgroundColor: p.accent,
                opacity: pressed ? 0.85 : 1,
                transition: 'opacity 90ms ease',
              },
            ]}
          >
            {busy === 'export' ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[styles.btnText, { fontSize: fs(scale, 17), color: '#fff' }]}>{t('data_export')}</Text>
            )}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('data_clear')}
            disabled={busy != null}
            onPress={() => setConfirming(true)}
            style={({ pressed }) => [
              styles.btn,
              {
                flex: 1,
                height: 54,
                borderRadius: RADII.pill,
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                borderColor: p.red,
                opacity: pressed ? 0.75 : 1,
                transition: 'opacity 90ms ease',
              },
            ]}
          >
            <Text style={[styles.btnText, { fontSize: fs(scale, 17), color: p.red }]}>{t('data_clear')}</Text>
          </Pressable>
        </View>
        {status ? (
          <Text style={[styles.status, { fontSize: fs(scale, 15), color: p.green }]}>{status}</Text>
        ) : null}
      </View>

      {/* Confirmación de borrado total (Modal propio: funciona en web y nativa). */}
      <ConfirmDialog
        visible={confirming}
        title={t('data_clear')}
        message={t('data_clear_confirm')}
        confirmLabel={t('data_clear')}
        cancelLabel={t('cancel')}
        destructive
        loading={busy === 'clear'}
        onConfirm={confirmClear}
        onCancel={() => setConfirming(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
  },
  title: { fontWeight: '700' },
  note: { lineHeight: 21 },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { fontWeight: '700' },
  status: {
    marginTop: 12,
    fontWeight: '600',
  },
});
