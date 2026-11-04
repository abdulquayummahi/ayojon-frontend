import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, FontSize, Radius, Shadow } from "../../constants/theme";
import { AppEvent } from "../../types/models";
import { CATEGORY_ICONS, formatShortDate } from "../../utils/event-helpers";
import BannerImage from "../ui/banner-image";
import ProgressBar from "../ui/progress-bar";
import StatusBadge from "../ui/status-badge";
import DateBadge from "./date-badge";

interface EventCardProps {
  event: AppEvent;
  footerText: string; // e.g. "18 seats left" or "42 / 60 registered"
  actionLabel: string; // e.g. "View event", "Manage", "Edit draft"
  onPress: () => void;
  highlight?: "danger" | "muted"; // colours the footer text
  progress?: number; // 0–1 share of seats booked; shows a thin bar
  tag?: { label: string; tone: "success" | "danger" | "neutral" | "primary" };
  isSaved?: boolean;
  onToggleSave?: () => void; // shows a bookmark button on the banner
}

// Event summary card used by Explore, Saved Events and Organizer Events.
export default function EventCard({
  event,
  footerText,
  actionLabel,
  onPress,
  highlight,
  progress,
  tag,
  isSaved = false,
  onToggleSave,
}: EventCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${actionLabel}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <BannerImage banner={event.banner} style={styles.banner}>
        <View style={styles.overlay}>
          <DateBadge date={event.date} />
          {onToggleSave ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isSaved ? `Remove ${event.title} from saved` : `Save ${event.title}`}
              accessibilityState={{ selected: isSaved }}
              onPress={onToggleSave}
              hitSlop={8}
              style={styles.saveButton}
            >
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={19}
                color={Colors.primary}
              />
            </Pressable>
          ) : tag ? (
            <View style={styles.tagWrap}>
              <StatusBadge label={tag.label} tone={tag.tone} />
            </View>
          ) : null}
        </View>
      </BannerImage>

      <View style={styles.body}>
        <View style={styles.categoryRow}>
          <Ionicons name={CATEGORY_ICONS[event.category]} size={14} color={Colors.primary} />
          <Text style={styles.category}>{event.category}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.location}>{event.location}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={15} color={Colors.textMuted} />
          <Text style={styles.info}>{formatShortDate(event)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={15} color={Colors.textMuted} />
          <Text style={styles.info} numberOfLines={1}>
            {event.venue}
          </Text>
        </View>

        {progress !== undefined ? (
          <View style={styles.progress}>
            <ProgressBar value={progress} tone={highlight === "danger" ? "danger" : "primary"} />
          </View>
        ) : null}

        <View style={styles.footer}>
          <Text
            style={[styles.footerText, highlight === "danger" && styles.dangerText]}
          >
            {footerText}
          </Text>
          <View style={styles.action}>
            <Text style={styles.actionText}>{actionLabel}</Text>
            <Ionicons name="arrow-forward" size={15} color={Colors.primary} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginBottom: 18,
    ...Shadow.card,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  banner: {
    height: 156,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  overlay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 12,
  },
  saveButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.glass,
    alignItems: "center",
    justifyContent: "center",
  },
  tagWrap: { backgroundColor: Colors.surface, borderRadius: Radius.pill },
  body: { padding: 16, paddingTop: 14 },
  categoryRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  category: { fontSize: FontSize.caption, fontWeight: "800", color: Colors.primary },
  dot: { fontSize: FontSize.caption, color: Colors.textLight },
  location: { fontSize: FontSize.caption, fontWeight: "600", color: Colors.textMuted },
  title: {
    fontSize: FontSize.lead,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 },
  info: { flex: 1, fontSize: FontSize.small, color: Colors.textMuted },
  progress: { marginTop: 14 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  footerText: { fontSize: FontSize.small, color: Colors.text, fontWeight: "700" },
  dangerText: { color: Colors.danger },
  action: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionText: { fontSize: FontSize.small, fontWeight: "700", color: Colors.primary },
});
