import { StyleSheet, View } from "react-native";
import { Colors } from "../../constants/theme";

const SIZE = 21; // a QR "version 1" grid is 21 × 21 modules
const MODULE = 7; // pixel size of one module

// Turns the ticket ID into a repeatable number so every ticket
// draws its own (but always the same) pattern.
function hashText(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// True for the three big corner squares (finder patterns)
function finderModule(row: number, col: number): boolean | null {
  const corners = [
    [0, 0],
    [0, SIZE - 7],
    [SIZE - 7, 0],
  ];
  for (const [r0, c0] of corners) {
    const r = row - r0;
    const c = col - c0;
    if (r >= -1 && r <= 7 && c >= -1 && c <= 7) {
      if (r < 0 || r > 6 || c < 0 || c > 6) return false; // white separator
      const ring = Math.min(r, c, 6 - r, 6 - c);
      return ring !== 1; // dark outer ring, white ring, dark centre
    }
  }
  return null;
}

// A QR-style pattern drawn with plain Views. This is a SAMPLE only —
// a real, scannable QR code is generated in the final term.
export default function SampleQr({ value }: { value: string }) {
  let seed = hashText(value);
  const nextBit = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return (seed >>> 16) % 2 === 0;
  };

  const rows = [];
  for (let r = 0; r < SIZE; r++) {
    const cells = [];
    for (let c = 0; c < SIZE; c++) {
      const finder = finderModule(r, c);
      const dark = finder === null ? nextBit() : finder;
      cells.push(
        <View key={c} style={[styles.module, dark && styles.dark]} />
      );
    }
    rows.push(
      <View key={r} style={styles.row}>
        {cells}
      </View>
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={`Sample QR code for ticket ${value}`}
      style={styles.container}
    >
      {rows}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    alignSelf: "center",
  },
  row: { flexDirection: "row" },
  module: { width: MODULE, height: MODULE },
  dark: { backgroundColor: Colors.text },
});
