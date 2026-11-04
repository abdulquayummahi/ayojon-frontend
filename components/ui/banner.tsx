import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Radius } from "../../constants/theme";

type BannerType = "success" | "error" | "info";

interface BannerProps {
  type: BannerType;
  message: string;
}

const CONFIG = {
  success: {
    icon: "checkmark-circle" as const,
    color: Colors.success,
    background: Colors.successLight,
  },
  error: {
    icon: "alert-circle" as const,
    color: Colors.danger,
    background: Colors.dangerLight,
  },
  info: {
    icon: "information-circle" as const,
    color: Colors.primary,
    background: Colors.primaryLight,
  },
};

// Inline message used for form errors and success feedback.
export default function Banner({ type, message }: BannerProps) {
  const config = CONFIG[type];
  return (
    <View
      accessibilityRole="alert"
      style={[styles.banner, { backgroundColor: config.background }]}
    >
      <Ionicons name={config.icon} size={20} color={config.color} />
      <Text style={[styles.text, { color: config.color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: 16,
    gap: 8,
  },
  text: { flex: 1, fontSize: 14, fontWeight: "600" },
});
