import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { ScrollView, StyleSheet } from "react-native";
import Chip from "./chip";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface ChipOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

interface ChipRowProps<T extends string> {
  options: ChipOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

// A horizontally scrolling single-select group of chips.
export default function ChipRow<T extends string>({
  options,
  selected,
  onSelect,
}: ChipRowProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          icon={option.icon}
          selected={option.value === selected}
          onPress={() => onSelect(option.value)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, marginBottom: 14 },
  row: { paddingRight: 8 },
});
