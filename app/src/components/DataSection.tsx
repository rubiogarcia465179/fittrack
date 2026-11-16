/** Bloque "Tus datos" en Perfil: copia de seguridad COMPLETA a un archivo
 *  (sesiones, perfil y fotos), restaurarla (con confirmación: sustituye
 *  todo) y borrar todo con confirmación explícita (Fase 16, R-124). El feedback de éxito es una línea en pantalla
 *  (Alert.alert no existe en react-native-web; esto funciona en todo). */
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RADII } from '../theme';
import { useTheme } from '../theme-context';
import { useScale, fs } from '../scale';
import { ConfirmDialog } from './ConfirmDialog';
import { parseBackup, type Backup } from '../store';
import { pickBackupFile } from '../lib/backupFile';
import { plural } from '../lib/plural';

export interface DataSectionProps {
  t: (k: string) => string;
  /** Guarda la copia (hoja de compartir / carpeta / descarga). */
  onBackup: () => Promise<boolean>;
  /** Sustituye todos los datos por la copia. */
  onRestore: (b: Backup) => Promise<number>;
  lng: string;
  onClear: () => Promise<void>;
  onDone: () => void; // recargar datos en pantalla
  /** Ajustes que van en la misma tarjeta, arriba (p. ej. el idioma). */
  children?: React.ReactNode;
}

export function DataSection({ t, onBackup, onRestore, lng, onClear, onDone, children }: DataSectionProps) {
  const { p, SHADOW } = useTheme();
  const scale = useScale();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState<'export' | 'restore' | 'clear' | null>(null);
  const [pending, setPending] = useState<Backup | null>(null);
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
      if (await onBackup()) setStatus(t('data_backup_done'));
    } finally {
      setBusy(null);
    }
  }

  async function pickRestore() {
    if (busy) return;
    setStatus('');
    const text = await pickBackupFile();
    if (text == null) return; // cancelado: nada
    const b = parseBackup(text);
    if (!b) {
      setStatus(t('data_restore_bad'));
      return;
    }
    setPending(b);
  }

  async function confirmRestore() {
    if (!pending || busy) return;
    setBusy('restore');
    try {
      await onRestore(pending);
      setPending(null);
      onDone();
      setStatus(t('data_restored'));
    } finally {
      setBusy(null);
    }
  }

  const pendingDate = (() => {
    if (!pending?.exported_at) return '';
    const d = new Date(pending.exported_at);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString(lng, { day: 'numeric', month: 'long', year: 'numeric' });
  })();

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
        {children ? <View>{children}</View> : null}
        {/* Mismo sistema de etiquetas que el resto de Perfil (CUERPO · SOBRE TI…). */}
        <View style={children ? [styles.split, { borderTopColor: p.border }] : null}>
          <Text style={[styles.label, { color: p.secondary }]}>{t('data_title')}</Text>
        </View>
        <Text style={[styles.note, { fontSize: fs(scale, 15), color: p.secondary, marginTop: 6 }]}>{t('data_note')}</Text>
        <View style={styles.row}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('data_backup')}
            disabled={busy != null}
            onPress={exportData}
            style={({ pressed }) => [
              styles.btn,
              {
                alignSelf: 'stretch',
                minHeight: 50,
                paddingHorizontal: 16,
                borderRadius: RADII.pill,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: p.border,
                opacity: pressed ? 0.6 : 1,
                transition: 'opacity 90ms ease',
              },
            ]}
          >
            {busy === 'export' ? (
              <ActivityIndicator size="small" color={p.text} />
            ) : (
              <Text style={[styles.btnText, { fontSize: fs(scale, 16), color: p.text }]}>{t('data_backup')}</Text>
            )}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('data_restore')}
            disabled={busy != null}
            onPress={pickRestore}
            style={({ pressed }) => [
              styles.btn,
              {
                alignSelf: 'stretch',
                minHeight: 50,
                paddingHorizontal: 16,
                borderRadius: RADII.pill,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: p.border,
                opacity: pressed ? 0.6 : 1,
                transition: 'opacity 90ms ease',
              },
            ]}
          >
            <Text style={[styles.btnText, { fontSize: fs(scale, 16), color: p.text }]}>{t('data_restore')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('data_clear')}
            disabled={busy != null}
            onPress={() => setConfirming(true)}
            style={({ pressed }) => [
              styles.btn,
              {
                alignSelf: 'stretch',
                minHeight: 50,
                paddingHorizontal: 16,
                borderRadius: RADII.pill,
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                borderColor: p.red,
                opacity: pressed ? 0.75 : 1,
                transition: 'opacity 90ms ease',
              },
            ]}
          >
            <Text style={[styles.btnText, { fontSize: fs(scale, 16), color: p.red }]}>{t('data_clear')}</Text>
          </Pressable>
        </View>
        {status ? (
          <Text style={[styles.status, { fontSize: fs(scale, 15), color: p.secondary }]} accessibilityLiveRegion="polite">{status}</Text>
        ) : null}
      </View>

      {/* Restaurar: sustituye todo, así que se confirma con lo que trae la copia. */}
      <ConfirmDialog
        visible={pending != null}
        title={t('data_restore_q')}
        message={t('data_restore_msg')
          .replace('{{date}}', pendingDate)
          .replace('{{sessions}}', plural(pending?.sessions.length ?? 0, t, 'data_sess_one', 'data_sess_many'))}
        confirmLabel={t('data_restore_btn')}
        cancelLabel={t('cancel')}
        loading={busy === 'restore'}
        onConfirm={confirmRestore}
        onCancel={() => setPending(null)}
      />

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
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  split: { marginTop: 14, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth },
  note: { lineHeight: 21 },
  row: {
    flexDirection: 'column',
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
