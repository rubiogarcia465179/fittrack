/** Bloque "Tus datos" en el Resumen: exporta todo a JSON y permite borrar
 *  todo el historial con confirmación explícita (acción peligrosa = dos
 *  pasos grandes y claros). El feedback de éxito es una línea en pantalla
 *  (Alert.alert no existe en react-native-web; esto funciona en todo). */
import { useEffect, useState } from 'react';
import {
  Clipboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS, RADII } from '../theme';
import { useScale, fs } from '../scale';
import { ConfirmDialog } from './ConfirmDialog';

export interface DataSectionProps {
  t: (k: string) => string;
  onExport: () => Promise<string>;
  onClear: () => Promise<void>;
  onDone: () => void; // recargar datos en pantalla
}

export function DataSection({ t, onExport, onClear, onDone }: DataSectionProps) {
  const scale = useScale();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  // El estado de éxito se limpia solo pasados 4 s.
  useEffect(() => {
    if (!status) return;
    const t1 = setTimeout(() => setStatus(''), 4000);
    return () => clearTimeout(t1);
  }, [status]);

  async function exportData() {
    if (busy) return;
    setBusy(true);
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
      setBusy(false);
    }
  }

  async function confirmClear() {
    if (busy) return;
    setBusy(true);
    try {
      await onClear();
      setConfirming(false);
      onDone();
      setStatus(t('data_cleared'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View>
      <View style={[styles.card, { borderRadius: RADII.tile }]}>
        <Text style={[styles.title, { fontSize: fs(scale, 19), color: COLORS.text }]}>
          {t('data_title')}
        </Text>
        <Text style={[styles.note, { fontSize: fs(scale, 15), color: COLORS.secondary, marginTop: 6 }]}>
          {t('data_note')}
        </Text>
        <View style={styles.row}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('data_export')}
            disabled={busy}
            onPress={exportData}
            style={[
              styles.btn,
              {
                flex: 1,
                height: 54,
                borderRadius: RADII.pill,
                backgroundColor: COLORS.blue,
              },
            ]}
          >
            <Text style={[styles.btnText, { fontSize: fs(scale, 17), color: '#fff' }]}>
              {t('data_export')}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('data_clear')}
            disabled={busy}
            onPress={() => setConfirming(true)}
            style={[
              styles.btn,
              {
                flex: 1,
                height: 54,
                borderRadius: RADII.pill,
                backgroundColor: '#ffffff',
                borderWidth: 1.5,
                borderColor: COLORS.red,
              },
            ]}
          >
            <Text style={[styles.btnText, { fontSize: fs(scale, 17), color: COLORS.red }]}>
              {t('data_clear')}
            </Text>
          </Pressable>
        </View>
        {status ? (
          <Text style={[styles.status, { fontSize: fs(scale, 15), color: COLORS.green }]}>
            {status}
          </Text>
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
        onConfirm={confirmClear}
        onCancel={() => setConfirming(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    padding: 16,
    shadowColor: '#1d1d1f',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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
