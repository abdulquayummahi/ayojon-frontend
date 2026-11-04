import { Pressable, StyleSheet, Text } from "react-native";
import { Colors, Radius } from "../../constants/theme";

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginRight: 8,
  },
  selected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  text: { fontSize: 13, color: Colors.textMuted, fontWeight: "500" },
  selectedText: { color: Colors.primary, fontWeight: "700" },
});
