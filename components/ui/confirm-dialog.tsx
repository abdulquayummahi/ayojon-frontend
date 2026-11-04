import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, View } from "react-native";
import { Colors, FontSize, Radius, Shadow } from "../../constants/theme";
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
          <View style={[styles.icon, destructive && styles.iconDanger]}>
            <Ionicons
              name={destructive ? "warning-outline" : "help-circle-outline"}
              size={26}
              color={destructive ? Colors.danger : Colors.primary}
            />
          </View>
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
    backgroundColor: Colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 22,
    alignItems: "center",
    ...Shadow.raised,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  iconDanger: { backgroundColor: Colors.dangerLight },
  title: {
    fontSize: FontSize.title,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
  },
  message: {
    fontSize: FontSize.body,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 21,
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 22, alignSelf: "stretch" },
  button: { flex: 1 },
});
