import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ComponentProps, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, FontSize, Radius, Shadow } from "../../constants/theme";
import { useApp } from "../../context/app-context";
import { useSimulatedLoading } from "../../hooks/use-simulated-loading";
import {
  CATEGORY_ICONS,
  countActiveBookings,
  formatLongDate,
  seatsLeft,
} from "../../utils/event-helpers";
import Avatar from "../ui/avatar";
import Banner from "../ui/banner";
import BannerImage from "../ui/banner-image";
import Button from "../ui/button";
import ProgressBar from "../ui/progress-bar";
import Screen from "../ui/screen";
import { BackButton } from "../ui/screen-header";
import StatusBadge from "../ui/status-badge";
import { ErrorState, LoadingState } from "../ui/state-views";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface EventDetailsViewProps {
  eventId: string;
  backLabel: string;
  onBook: () => void;
  onViewTicket: (ticketId: string) => void;
}

// One row of the "when / where" list
function InfoRow({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoText}>{text}</Text>
      </View>
    </View>
  );
}

// Event Details — shared by the Explore and Saved tab stacks.
export default function EventDetailsView({
  eventId,
  backLabel,
  onBook,
  onViewTicket,
}: EventDetailsViewProps) {
  const { state, currentUser, dispatch } = useApp();
  const isLoading = useSimulatedLoading(500);
  const insets = useSafeAreaInsets();
  const [savedMessage, setSavedMessage] = useState("");

  // Hide the "saved" feedback after a moment
  useEffect(() => {
    if (!savedMessage) return;
    const timeoutId = setTimeout(() => setSavedMessage(""), 2500);
    return () => clearTimeout(timeoutId);
  }, [savedMessage]);

  const event = state.events.find((e) => e.id === eventId);

  if (isLoading) {
    return (
      <Screen>
        <LoadingState message="Loading event…" />
      </Screen>
    );
  }

  if (!event || event.status === "draft" || !currentUser) {
    return (
      <Screen>
        <ErrorState
          title="Event not found"
          message="This event may have been removed or is not published yet."
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const left = seatsLeft(event, state.bookings);
  const booked = countActiveBookings(state.bookings, event.id);
  const isSaved = state.saved.some(
    (s) => s.userId === currentUser.id && s.eventId === event.id
  );
  const myBooking = state.bookings.find(
    (b) =>
      b.eventId === event.id &&
      b.userId === currentUser.id &&
      b.status === "booked"
  );

  const toggleSaved = () => {
    dispatch({
      type: "TOGGLE_SAVED",
      payload: { userId: currentUser.id, eventId: event.id },
    });
    setSavedMessage(isSaved ? "Removed from Saved." : "Saved! Find it in the Saved tab.");
  };

  // What the main button should do / say
  let bookingNotice = "";
  if (myBooking) bookingNotice = "You already have a ticket for this event.";
  else if (event.status === "closed") bookingNotice = "Registration is closed for this event.";
  else if (left === 0) bookingNotice = "This event is fully booked.";

  const footer = (
    <View style={styles.footer}>
      <View>
        <Text style={[styles.footerSeats, left === 0 && styles.full]}>
          {left === 0 ? "Fully booked" : `${left} seats left`}
        </Text>
        <Text style={styles.footerNote}>Free · 1 seat per account</Text>
      </View>
      {myBooking ? (
        <Button
          title="View my ticket"
          icon="qr-code-outline"
          onPress={() => onViewTicket(myBooking.id)}
          style={styles.footerButton}
        />
      ) : (
        <Button
          title="Book a seat"
          icon="ticket-outline"
          onPress={onBook}
          disabled={bookingNotice.length > 0}
          style={styles.footerButton}
        />
      )}
    </View>
  );

  return (
    <Screen scroll fullBleed footer={footer}>
      <BannerImage banner={event.banner} style={styles.hero}>
        <View style={[styles.heroBar, { paddingTop: insets.top + 10 }]}>
          <BackButton label={backLabel} light />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isSaved ? "Remove from saved" : "Save event"}
            accessibilityState={{ selected: isSaved }}
            onPress={toggleSaved}
            style={styles.saveButton}
          >
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={21}
              color={Colors.primary}
            />
          </Pressable>
        </View>
      </BannerImage>

      <View style={styles.sheet}>
        <View style={styles.tags}>
          <View style={styles.categoryPill}>
            <Ionicons name={CATEGORY_ICONS[event.category]} size={14} color={Colors.primary} />
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
          {event.status === "closed" ? (
            <StatusBadge label="Registration closed" tone="danger" />
          ) : left === 0 ? (
            <StatusBadge label="Fully booked" tone="danger" />
          ) : (
            <StatusBadge label="Open for booking" tone="success" />
          )}
        </View>

        <Text style={styles.title}>{event.title}</Text>

        <View style={styles.organizer}>
          <Avatar name={event.organizerName} size={38} />
          <View style={styles.flex}>
            <Text style={styles.organizerLabel}>Organized by</Text>
            <Text style={styles.organizerName}>{event.organizerName}</Text>
          </View>
        </View>

        {savedMessage ? <Banner type="success" message={savedMessage} /> : null}
        {bookingNotice ? (
          <Banner type={myBooking ? "info" : "error"} message={bookingNotice} />
        ) : null}

        <View style={styles.infoCard}>
          <InfoRow icon="calendar-outline" title="Date & time" text={formatLongDate(event)} />
          <View style={styles.divider} />
          <InfoRow icon="location-outline" title={event.location} text={event.venue} />
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="people-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.infoTitle}>
                {booked} of {event.seatLimit} seats booked
              </Text>
              <View style={styles.seatBar}>
                <ProgressBar value={booked / event.seatLimit} tone={left === 0 ? "danger" : "primary"} />
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>About this event</Text>
        <Text style={styles.description}>
          {event.description || "The organizer hasn't added a description yet."}
        </Text>

        <Button
          title={isSaved ? "Saved to your list" : "Save for later"}
          icon={isSaved ? "bookmark" : "bookmark-outline"}
          variant="secondary"
          onPress={toggleSaved}
          style={styles.saveLater}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { height: 300 },
  heroBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  saveButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.glass,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.card,
  },
  sheet: {
    marginTop: -28,
    paddingHorizontal: 20,
    paddingTop: 22,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: Colors.background,
  },
  tags: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primaryLight,
  },
  categoryText: { fontSize: 12, fontWeight: "800", color: Colors.primary },
  title: {
    fontSize: FontSize.heading,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 12,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  organizer: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14, marginBottom: 18 },
  organizerLabel: { fontSize: FontSize.caption, color: Colors.textMuted },
  organizerName: { fontSize: FontSize.body, fontWeight: "700", color: Colors.text },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 14,
    marginBottom: 22,
    ...Shadow.card,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTitle: { fontSize: FontSize.body, fontWeight: "700", color: Colors.text },
  infoText: { fontSize: FontSize.small, color: Colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12, marginLeft: 56 },
  seatBar: { marginTop: 8 },
  sectionTitle: { fontSize: FontSize.lead, fontWeight: "800", color: Colors.text, marginBottom: 8 },
  description: { fontSize: FontSize.body, color: Colors.textMuted, lineHeight: 23 },
  saveLater: { marginTop: 22 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  footerSeats: { fontSize: FontSize.lead, fontWeight: "800", color: Colors.text },
  full: { color: Colors.danger },
  footerNote: { fontSize: FontSize.caption, color: Colors.textMuted, marginTop: 2 },
  footerButton: { flex: 1, maxWidth: 200 },
});
