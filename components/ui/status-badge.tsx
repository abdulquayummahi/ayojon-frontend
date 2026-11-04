import { StyleSheet, Text, View } from "react-native";
import { Colors, Radius } from "../../constants/theme";

type Tone = "success" | "danger" | "warning" | "primary" | "neutral";

interface StatusBadgeProps {
  label: string;
  tone: Tone;
}

const TONES: Record<Tone, { color: string; background: string }> = {
  success: { color: Colors.success, background: Colors.successLight },
  danger: { color: Colors.danger, background: Colors.dangerLight },
  warning: { color: Colors.warning, background: Colors.warningLight },
  primary: { color: Colors.primary, background: Colors.primaryLight },
  neutral: { color: Colors.textMuted, background: Colors.background },
};

export default function StatusBadge({ label, tone }: StatusBadgeProps) {
  const colors = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    alignSelf: "flex-start",
  },
  text: { fontSize: 12, fontWeight: "700" },
});
