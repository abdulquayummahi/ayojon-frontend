import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Colors, FontSize, Radius } from "../../constants/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: IconName;
}

export default function Chip({ label, selected, onPress, icon }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={15}
          color={selected ? Colors.white : Colors.textMuted}
        />
      ) : null}
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 38,
    paddingHorizontal: 15,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginRight: 8,
  },
  selected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  text: { fontSize: FontSize.small, color: Colors.textMuted, fontWeight: "600" },
  selectedText: { color: Colors.white },
});
