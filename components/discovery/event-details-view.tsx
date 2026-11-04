import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Radius } from "../../constants/theme";
import { useApp } from "../../context/app-context";
import { useSimulatedLoading } from "../../hooks/use-simulated-loading";
import { EventCategory } from "../../types/models";
import { formatLongDate, seatsLeft } from "../../utils/event-helpers";
import Banner from "../ui/banner";
import Button from "../ui/button";
import Screen from "../ui/screen";
import ScreenHeader from "../ui/screen-header";
import { ErrorState, LoadingState } from "../ui/state-views";

interface EventDetailsViewProps {
  eventId: string;
  backLabel: string;
  onBook: () => void;
  onViewTicket: (ticketId: string) => void;
}

const COVER_TEXT: Record<EventCategory, [string, string]> = {
  Workshop: ["LEARN. CONNECT.", "CREATE SOMETHING NEW."],
  Seminar: ["LISTEN. ASK.", "GROW YOUR CAREER."],
  Sports: ["PLAY. CHEER.", "BACK YOUR TEAM."],
  Concert: ["MUSIC. FRIENDS.", "ONE NIGHT TOGETHER."],
  Community: ["SHOW UP.", "MAKE A DIFFERENCE."],
};

// Event Details — shared by the Explore and Saved tab stacks.
export default function EventDetailsView({
  eventId,
  backLabel,
  onBook,
  onViewTicket,
}: EventDetailsViewProps) {
  const { state, currentUser, dispatch } = useApp();
  const isLoading = useSimulatedLoading(500);
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
  const isSaved = state.saved.some(
    (s) => s.userId === currentUser.id && s.eventId === event.id
  );
  const myBooking = state.bookings.find(
    (b) =>
      b.eventId === event.id &&
      b.userId === currentUser.id &&
      b.status === "booked"
  );
  const [coverLine1, coverLine2] = COVER_TEXT[event.category];

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

  return (
    <Screen scroll>
      <ScreenHeader title="Event details" backLabel={backLabel} />

      <View style={styles.cover}>
        <Text style={styles.coverCategory}>{event.category.toUpperCase()}</Text>
        <Text style={styles.coverLine1}>{coverLine1}</Text>
        <Text style={styles.coverLine2}>{coverLine2}</Text>
      </View>

      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.organizer}>By {event.organizerName}</Text>

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={18} color={Colors.textMuted} />
        <Text style={styles.infoText}>{formatLongDate(event)}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={18} color={Colors.textMuted} />
        <Text style={styles.infoText}>
          {event.venue} · {event.location}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="people-outline" size={18} color={Colors.primary} />
        <Text style={[styles.infoText, styles.seats, left === 0 && styles.full]}>
          {left} of {event.seatLimit} seats available
        </Text>
      </View>

      <Text style={styles.sectionTitle}>About this event</Text>
      <Text style={styles.description}>{event.description}</Text>

      {savedMessage ? <Banner type="success" message={savedMessage} /> : null}
      {bookingNotice ? (
        <Banner type={myBooking ? "info" : "error"} message={bookingNotice} />
      ) : null}

      <Button
        title={isSaved ? "Remove from saved" : "Save event"}
        variant="secondary"
        onPress={toggleSaved}
      />
      {myBooking ? (
        <Button
          title="View my ticket"
          onPress={() => onViewTicket(myBooking.id)}
          style={styles.mainButton}
        />
      ) : (
        <Button
          title="Book a seat"
          onPress={onBook}
          disabled={bookingNotice.length > 0}
          style={styles.mainButton}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cover: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.lg,
    padding: 20,
    marginBottom: 20,
  },
  coverCategory: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  coverLine1: { fontSize: 22, fontWeight: "800", color: Colors.primary },
  coverLine2: { fontSize: 15, fontWeight: "800", color: Colors.primary, marginTop: 6 },
  title: { fontSize: 22, fontWeight: "800", color: Colors.text },
  organizer: { fontSize: 14, color: Colors.textMuted, marginTop: 4, marginBottom: 16 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  infoText: { fontSize: 15, color: Colors.text, flexShrink: 1 },
  seats: { color: Colors.primary, fontWeight: "700" },
  full: { color: Colors.danger },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 14,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 21,
    marginBottom: 20,
  },
  mainButton: { marginTop: 10 },
});
