/** Diálogo de confirmación que funciona en TODAS las plataformas (web y nativa).
 *  Nota: Alert.alert de react-native-web es un no-op en algunas versiones, así
 *  que la app usa este Modal propio para cualquier confirmación destructiva.
 *  Diseño Apple: card centrada, título grande, mensaje, dos botones grandes. */
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, RADII } from '../theme';
import { useScale, fs } from '../scale';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean; // pinta el botón de confirmación de rojo
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
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const scale = useScale();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <View style={[styles.card, { borderRadius: RADII.tile }]}>
          <Text style={[styles.title, { fontSize: fs(scale, 21), color: COLORS.text }]}>
            {title}
          </Text>
          {message ? (
            <Text style={[styles.message, { fontSize: fs(scale, 17), color: COLORS.secondary, marginTop: 10 }]}>
              {message}
            </Text>
          ) : null}
          <View style={styles.row}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              onPress={onCancel}
              style={[
                styles.btn,
                {
                  flex: 1,
                  height: 54,
                  borderRadius: RADII.pill,
                  backgroundColor: COLORS.fieldBg,
                },
              ]}
            >
              <Text style={[styles.btnText, { fontSize: fs(scale, 17), color: COLORS.text }]}>
                {cancelLabel}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              onPress={onConfirm}
              style={[
                styles.btn,
                {
                  flex: 1,
                  height: 54,
                  borderRadius: RADII.pill,
                  backgroundColor: destructive ? COLORS.red : COLORS.blue,
                },
              ]}
            >
              <Text style={[styles.btnText, { fontSize: fs(scale, 17), color: '#fff' }]}>
                {confirmLabel}
              </Text>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.card,
    padding: 20,
    shadowColor: '#1d1d1f',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
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
