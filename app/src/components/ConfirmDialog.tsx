/** Diálogo de confirmación que funciona en TODAS las plataformas (web y nativa).
 *  Nota: Alert.alert de react-native-web es un no-op en algunas versiones, así
 *  que la app usa este Modal propio para cualquier confirmación destructiva.
 *  Diseño: card centrada, título grande, mensaje, dos botones grandes. */
import { Modal, Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { RADII } from '../theme';
import { useTheme } from '../theme-context';
import { useScale, fs } from '../scale';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean; // pinta el botón de confirmación de rojo
  loading?: boolean; // muestra spinner y bloquea el confirmar
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { p, SHADOW } = useTheme();
  const scale = useScale();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={[styles.backdrop, { backgroundColor: p.overlay }]} onPress={onCancel}>
        <View style={[styles.card, { borderRadius: RADII.tile, backgroundColor: p.card, ...SHADOW.card }]}>
          <Text style={[styles.title, { fontSize: fs(scale, 21), color: p.text }]}>{title}</Text>
          {message ? (
            <Text style={[styles.message, { fontSize: fs(scale, 17), color: p.secondary, marginTop: 10 }]}>
              {message}
            </Text>
          ) : null}
          <View style={styles.row}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              disabled={loading}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.btn,
                {
                  flex: 1,
                  height: 54,
                  borderRadius: RADII.pill,
                  backgroundColor: p.fieldBg,
                  opacity: pressed ? 0.8 : 1,
                  transition: 'opacity 90ms ease',
                },
              ]}
            >
              <Text style={[styles.btnText, { fontSize: fs(scale, 17), color: p.text }]}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              disabled={loading}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.btn,
                {
                  flex: 1,
                  height: 54,
                  borderRadius: RADII.pill,
                  backgroundColor: destructive ? p.red : p.accent,
                  opacity: pressed ? 0.85 : 1,
                  transition: 'opacity 90ms ease',
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.btnText, { fontSize: fs(scale, 17), color: '#fff' }]}>{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
  },
  title: { fontWeight: '700' },
  message: { lineHeight: 23 },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { fontWeight: '700' },
});
