import { Modal, StyleSheet, Text, View } from "react-native";
import { Colors, Radius } from "../../constants/theme";
import Button from "./button";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// A confirmation pop-up built with Modal so it looks the same on
// Android, iOS and web.
export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = "Go back",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Button
              title={cancelLabel}
              variant="secondary"
              onPress={onCancel}
              style={styles.button}
            />
            <Button
              title={confirmLabel}
              variant={destructive ? "danger" : "primary"}
              onPress={onConfirm}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 10, 30, 0.45)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: "800", color: Colors.text },
  message: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
    lineHeight: 20,
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 20 },
  button: { flex: 1 },
});
