import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Colors, FontSize, Radius } from "../../constants/theme";

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
// (Named "Banner" before event banner images existed — it is a message strip.)
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
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: Radius.lg,
    marginBottom: 14,
  },
  text: { flex: 1, fontSize: FontSize.small, fontWeight: "600", lineHeight: 19 },
});
