import { StyleSheet, Text, View } from "react-native";
import { Colors, Radius } from "../../constants/theme";
import { getDateParts } from "../../utils/event-helpers";

export default function DateBadge({ date }: { date: string }) {
  const { month, day } = getDateParts(date);
  return (
    <View style={styles.badge}>
      <Text style={styles.month}>{month}</Text>
      <Text style={styles.day}>{day}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 50,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  month: { fontSize: 11, fontWeight: "700", color: Colors.primary },
  day: { fontSize: 20, fontWeight: "800", color: Colors.primary },
});
