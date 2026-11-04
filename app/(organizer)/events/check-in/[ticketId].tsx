import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Button from "../../../../components/ui/button";
import Avatar from "../../../../components/ui/avatar";
import Card from "../../../../components/ui/card";
import Screen from "../../../../components/ui/screen";
import ScreenHeader from "../../../../components/ui/screen-header";
import { Colors, FontSize, Radius } from "../../../../constants/theme";
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
    icon: "checkmark" as const,
    color: Colors.success,
    background: Colors.successLight,
  },
  already: {
    badge: "Already used",
    title: "Already checked in",
    icon: "time-outline" as const,
    color: Colors.warning,
    background: Colors.warningLight,
  },
  invalid: {
    badge: "Invalid",
    title: "Ticket not accepted",
    icon: "close" as const,
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
    <Screen
      scroll
      footer={
        <View style={styles.footer}>
          <Button
            title="Attendees"
            icon="people-outline"
            variant="secondary"
            onPress={() =>
              router.replace({
                pathname: "/events/attendees/[id]",
                params: { id: eventId },
              })
            }
            style={styles.flex}
          />
          <Button
            title="Scan next"
            icon="qr-code-outline"
            onPress={() => router.back()}
            style={styles.flex}
          />
        </View>
      }
    >
      <ScreenHeader title="Check-in result" subtitle={event?.title} />

      <Card style={styles.card}>
        <View style={[styles.iconOuter, { backgroundColor: ui.background }]}>
          <View style={[styles.iconInner, { backgroundColor: ui.color }]}>
            <Ionicons name={ui.icon} size={44} color={Colors.white} />
          </View>
        </View>
        <Text style={[styles.badgeText, { color: ui.color }]}>{ui.badge.toUpperCase()}</Text>
        <Text style={styles.title}>{ui.title}</Text>
        <Text style={styles.reason}>{reason}</Text>

        <View style={styles.ticketBox}>
          {booking && outcome !== "invalid" ? (
            <Avatar name={booking.attendeeName} size={44} />
          ) : (
            <View style={styles.unknown}>
              <Ionicons name="help" size={22} color={Colors.textLight} />
            </View>
          )}
          <View style={styles.flex}>
            <Text style={styles.attendee}>
              {booking && outcome !== "invalid" ? booking.attendeeName : "Unknown ticket"}
            </Text>
            <Text style={styles.ticket}>{ticketId}</Text>
          </View>
        </View>

        {outcome === "already" && booking?.checkedInAt ? (
          <Text style={styles.firstTime}>
            First checked in on {formatCheckInTime(booking.checkedInAt)}.
          </Text>
        ) : null}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  footer: { flexDirection: "row", gap: 10 },
  card: { alignItems: "center", paddingVertical: 28 },
  iconOuter: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: FontSize.caption, fontWeight: "800", letterSpacing: 1.2, marginTop: 16 },
  title: { fontSize: FontSize.heading, fontWeight: "800", color: Colors.text, marginTop: 4, textAlign: "center" },
  reason: { fontSize: FontSize.body, color: Colors.textMuted, marginTop: 6, textAlign: "center" },
  ticketBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    alignSelf: "stretch",
    marginTop: 22,
    padding: 12,
    borderRadius: Radius.lg,
    backgroundColor: Colors.background,
  },
  unknown: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  attendee: { fontSize: FontSize.body, fontWeight: "800", color: Colors.text },
  ticket: { fontSize: FontSize.small, color: Colors.primary, fontWeight: "700", marginTop: 2, letterSpacing: 1 },
  firstTime: { fontSize: FontSize.small, color: Colors.textMuted, marginTop: 14, textAlign: "center" },
});
