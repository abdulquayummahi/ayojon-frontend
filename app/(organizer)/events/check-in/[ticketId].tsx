import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Button from "../../../../components/ui/button";
import Card from "../../../../components/ui/card";
import Screen from "../../../../components/ui/screen";
import ScreenHeader from "../../../../components/ui/screen-header";
import { Colors } from "../../../../constants/theme";
import { useApp } from "../../../../context/app-context";
import { CheckInOutcome } from "../../../../types/models";
import { formatCheckInTime } from "../../../../utils/check-in";

type CheckInParams = {
  ticketId: string;
  eventId: string;
  outcome: CheckInOutcome;
  reason: string;
};

const OUTCOME_UI = {
  valid: {
    badge: "Valid",
    title: "Attendee checked in",
    icon: "checkmark-circle" as const,
    color: Colors.success,
    background: Colors.successLight,
  },
  already: {
    badge: "Already used",
    title: "Already checked in",
    icon: "time" as const,
    color: Colors.warning,
    background: Colors.warningLight,
  },
  invalid: {
    badge: "Invalid",
    title: "Ticket not accepted",
    icon: "close-circle" as const,
    color: Colors.danger,
    background: Colors.dangerLight,
  },
};

export default function CheckInResultScreen() {
  const { ticketId, eventId, outcome, reason } =
    useLocalSearchParams<CheckInParams>();
  const { state } = useApp();

  const ui = OUTCOME_UI[outcome] ?? OUTCOME_UI.invalid;
  const event = state.events.find((e) => e.id === eventId);
  const booking = state.bookings.find((b) => b.id === ticketId);

  return (
    <Screen scroll>
      <ScreenHeader title="Check-in result" subtitle={event?.title} />

      <Card style={styles.card}>
        <View style={[styles.badge, { backgroundColor: ui.background }]}>
          <Ionicons name={ui.icon} size={22} color={ui.color} />
          <Text style={[styles.badgeText, { color: ui.color }]}>{ui.badge}</Text>
        </View>
        <Text style={styles.title}>{ui.title}</Text>

        {booking && outcome !== "invalid" ? (
          <Text style={styles.attendee}>{booking.attendeeName}</Text>
        ) : null}
        <Text style={styles.ticket}>{ticketId}</Text>
        <Text style={styles.reason}>{reason}</Text>

        {outcome === "already" && booking?.checkedInAt ? (
          <Text style={styles.reason}>
            First checked in on {formatCheckInTime(booking.checkedInAt)}.
          </Text>
        ) : null}
      </Card>

      <Button title="Scan next ticket" onPress={() => router.back()} />
      <Button
        title="View attendees"
        variant="secondary"
        onPress={() =>
          router.replace({
            pathname: "/events/attendees/[id]",
            params: { id: eventId },
          })
        }
        style={styles.secondary}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: "center", paddingVertical: 28 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 14,
  },
  badgeText: { fontSize: 18, fontWeight: "800" },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
  },
  attendee: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 18,
  },
  ticket: { fontSize: 14, color: Colors.textMuted, marginTop: 6 },
  reason: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 12,
    textAlign: "center",
  },
  secondary: { marginTop: 10 },
});
