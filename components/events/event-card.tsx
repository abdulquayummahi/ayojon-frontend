import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, Radius } from "../../constants/theme";
import { AppEvent } from "../../types/models";
import DateBadge from "./date-badge";

interface EventCardProps {
  event: AppEvent;
  footerText: string; // e.g. "18 seats left" or "42 / 60 registered"
  actionLabel: string; // e.g. "View event", "Manage", "Edit draft"
  onPress: () => void;
  highlight?: "danger" | "muted"; // colours the footer text
}

// Event summary card used by Explore, Saved Events and Organizer Events.
export default function EventCard({
  event,
  footerText,
  actionLabel,
  onPress,
  highlight,
}: EventCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${actionLabel}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <DateBadge date={event.date} />
        <View style={styles.topText}>
          <Text style={styles.category}>{event.category.toUpperCase()}</Text>
          <Text style={styles.location}>{event.location}</Text>
        </View>
      </View>

      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.venue}>{event.venue}</Text>

      <View style={styles.footer}>
        <Text
          style={[
            styles.footerText,
            highlight === "danger" && styles.dangerText,
          ]}
        >
          {footerText}
        </Text>
        <Text style={styles.action}>{actionLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 14,
  },
  pressed: { opacity: 0.85 },
  top: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  topText: { marginLeft: 12 },
  category: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  location: { fontSize: 14, fontWeight: "600", color: Colors.text, marginTop: 2 },
  title: { fontSize: 17, fontWeight: "800", color: Colors.text },
  venue: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  footerText: { fontSize: 13, color: Colors.textMuted },
  dangerText: { color: Colors.danger, fontWeight: "600" },
  action: { fontSize: 13, color: Colors.primary, fontWeight: "700" },
});
