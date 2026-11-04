import { StyleSheet, Text, View } from "react-native";
import { Colors, Radius, Shadow } from "../../constants/theme";
import { getDateParts } from "../../utils/event-helpers";

export default function DateBadge({ date }: { date: string }) {
  const { month, day } = getDateParts(date);
  return (
    <View style={styles.badge}>
      <Text style={styles.day}>{day}</Text>
      <Text style={styles.month}>{month}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 52,
    paddingVertical: 7,
    borderRadius: Radius.md,
    backgroundColor: Colors.glass,
    alignItems: "center",
    ...Shadow.card,
  },
  day: { fontSize: 19, fontWeight: "800", color: Colors.text, lineHeight: 22 },
  month: { fontSize: 11, fontWeight: "800", color: Colors.primary, letterSpacing: 0.6 },
});
