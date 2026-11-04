import { StyleSheet, View } from "react-native";
import { Colors } from "../../constants/theme";

interface ProgressBarProps {
  value: number; // 0 to 1
  tone?: "primary" | "danger" | "success";
  height?: number;
}

const FILL = {
  primary: Colors.primary,
  danger: Colors.danger,
  success: Colors.success,
};

// Thin bar used for "seats booked" on cards and the Manage Event screen
export default function ProgressBar({ value, tone = "primary", height = 6 }: ProgressBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          { width: `${percent}%`, backgroundColor: FILL[tone], borderRadius: height / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: Colors.primaryLight, overflow: "hidden" },
  fill: { height: "100%" },
});
