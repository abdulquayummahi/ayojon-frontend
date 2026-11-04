import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";
import { useApp } from "../../context/app-context";
import { useSimulatedLoading } from "../../hooks/use-simulated-loading";
import { formatShortDate } from "../../utils/event-helpers";
import Banner from "../ui/banner";
import Button from "../ui/button";
import Card from "../ui/card";
import Screen from "../ui/screen";
import ScreenHeader from "../ui/screen-header";
import StatusBadge from "../ui/status-badge";
import { ErrorState, LoadingState } from "../ui/state-views";
import SampleQr from "./sample-qr";

interface TicketViewProps {
  ticketId: string;
  justBooked: boolean;
  primaryLabel: string;
  onPrimary: () => void;
}

// QR Ticket — shared by the Explore stack (after booking) and the Tickets stack.
export default function TicketView({
  ticketId,
  justBooked,
  primaryLabel,
  onPrimary,
}: TicketViewProps) {
  const { state, currentUser } = useApp();
  const isLoading = useSimulatedLoading(400);

  const booking = state.bookings.find((b) => b.id === ticketId);
  const event = booking
    ? state.events.find((e) => e.id === booking.eventId)
    : undefined;

  if (isLoading) {
    return (
      <Screen>
        <LoadingState message="Loading ticket…" />
      </Screen>
    );
  }

  if (!booking || !event || booking.userId !== currentUser?.id) {
    return (
      <Screen>
        <ErrorState
          title="Ticket not found"
          message="This ticket does not exist or belongs to another account."
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const isCancelled = booking.status === "cancelled";
  const isCheckedIn = booking.checkedInAt !== null;

  return (
    <Screen scroll>
      <ScreenHeader
        title="Your ticket"
        subtitle={isCancelled ? "Booking cancelled" : "Booking confirmed"}
      />

      {justBooked ? (
        <Banner type="success" message="Seat booked! Your ticket is ready." />
      ) : null}

      <Card style={styles.ticket}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.meta}>
          {formatShortDate(event)} · {event.venue}
        </Text>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{booking.attendeeName}</Text>
          {isCancelled ? (
            <StatusBadge label="Cancelled" tone="danger" />
          ) : isCheckedIn ? (
            <StatusBadge label="Checked in" tone="success" />
          ) : (
            <StatusBadge label="Valid" tone="primary" />
          )}
        </View>

        <View style={[styles.qrWrap, isCancelled && styles.faded]}>
          <SampleQr value={booking.id} />
          <Text style={styles.sample}>SAMPLE QR ONLY</Text>
        </View>

        <Text style={styles.ticketId}>Ticket ID: {booking.id}</Text>
        <Text style={styles.meta}>
          {isCancelled
            ? "This ticket can no longer be used for entry."
            : "Show your QR code at the entrance."}
        </Text>
      </Card>

      <Button title={primaryLabel} onPress={onPrimary} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  ticket: { padding: 20 },
  title: { fontSize: 20, fontWeight: "800", color: Colors.text },
  meta: { fontSize: 14, color: Colors.textMuted, marginTop: 6 },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  name: { fontSize: 17, fontWeight: "700", color: Colors.text },
  qrWrap: { alignItems: "center", marginVertical: 22 },
  faded: { opacity: 0.25 },
  sample: {
    fontSize: 11,
    letterSpacing: 1,
    color: Colors.textMuted,
    marginTop: 10,
  },
  ticketId: { fontSize: 15, color: Colors.text, fontWeight: "600" },
});
