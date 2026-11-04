import { ScrollView, StyleSheet } from "react-native";
import Chip from "./chip";

interface ChipOption<T extends string> {
  value: T;
  label: string;
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
    >
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          selected={option.value === selected}
          onPress={() => onSelect(option.value)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Don't let the row grow to fill the screen's height
  scroll: { flexGrow: 0, flexShrink: 0 },
  row: { paddingVertical: 4, alignItems: "center" },
});
