import { StyleSheet, Text, View } from "react-native";
import { Colors, FontSize } from "../../constants/theme";

interface StepProgressProps {
  step: number; // current step, starting at 1
  total: number;
  label: string;
}

// "Step 1 of 2 · Event information" with a segmented progress bar
export default function StepProgress({ step, total, label }: StepProgressProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.bars}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.bar, i < step && styles.barDone]} />
        ))}
      </View>
      <Text style={styles.text}>
        <Text style={styles.step}>
          Step {step} of {total}
        </Text>
        {"  ·  "}
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 18 },
  bars: { flexDirection: "row", gap: 6, marginBottom: 8 },
  bar: { flex: 1, height: 5, borderRadius: 3, backgroundColor: Colors.primaryLight },
  barDone: { backgroundColor: Colors.primary },
  text: { fontSize: FontSize.small, color: Colors.textMuted },
  step: { color: Colors.primary, fontWeight: "800" },
});
