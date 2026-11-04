import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Colors, FontSize, Radius, Shadow } from "../../constants/theme";
import { useApp } from "../../context/app-context";
import { useSimulatedLoading } from "../../hooks/use-simulated-loading";
import { formatShortDate } from "../../utils/event-helpers";
import Banner from "../ui/banner";
import BannerImage from "../ui/banner-image";
import Button from "../ui/button";
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
    <Screen
      scroll
      footer={<Button title={primaryLabel} icon="ticket-outline" onPress={onPrimary} />}
    >
      <ScreenHeader
        title="Your ticket"
        subtitle={isCancelled ? "Booking cancelled" : "Booking confirmed"}
        backLabel="Go back"
      />

      {justBooked ? (
        <Banner type="success" message="Seat booked! Your ticket is ready." />
      ) : null}

      <View style={styles.ticket}>
        <BannerImage banner={event.banner} style={styles.banner}>
          <View style={styles.bannerTag}>
            {isCancelled ? (
              <StatusBadge label="Cancelled" tone="danger" />
            ) : isCheckedIn ? (
              <StatusBadge label="Checked in" tone="success" />
            ) : (
              <StatusBadge label="Valid ticket" tone="primary" />
            )}
          </View>
        </BannerImage>

        <View style={styles.top}>
          <Text style={styles.title}>{event.title}</Text>
          <View style={styles.grid}>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>Date & time</Text>
              <Text style={styles.cellValue}>{formatShortDate(event)}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>Attendee</Text>
              <Text style={styles.cellValue} numberOfLines={1}>
                {booking.attendeeName}
              </Text>
            </View>
            <View style={[styles.cell, styles.cellWide]}>
              <Text style={styles.cellLabel}>Venue</Text>
              <Text style={styles.cellValue}>
                {event.venue} · {event.location}
              </Text>
            </View>
          </View>
        </View>

        {/* Perforated edge between the details and the QR code */}
        <View style={styles.perforation}>
          <View style={[styles.notch, styles.notchLeft]} />
          <View style={styles.dashes} />
          <View style={[styles.notch, styles.notchRight]} />
        </View>

        <View style={styles.bottom}>
          <View style={[styles.qrWrap, isCancelled && styles.faded]}>
            <SampleQr value={booking.id} />
          </View>
          <Text style={styles.sample}>SAMPLE QR ONLY</Text>
          <Text style={styles.ticketId}>{booking.id}</Text>
          <View style={styles.hintRow}>
            <Ionicons
              name={isCancelled ? "close-circle-outline" : "scan-outline"}
              size={16}
              color={isCancelled ? Colors.danger : Colors.textMuted}
            />
            <Text style={styles.hint}>
              {isCancelled
                ? "This ticket can no longer be used for entry."
                : "Show this QR code at the entrance."}
            </Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const NOTCH = 24;

const styles = StyleSheet.create({
  ticket: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginBottom: 12,
    ...Shadow.raised,
  },
  banner: { height: 132, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl },
  bannerTag: {
    position: "absolute",
    left: 14,
    top: 14,
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
  },
  top: { padding: 18, paddingBottom: 10 },
  title: { fontSize: FontSize.title, fontWeight: "800", color: Colors.text, letterSpacing: -0.3 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
  cell: { width: "50%", marginTop: 8, paddingRight: 8 },
  cellWide: { width: "100%" },
  cellLabel: { fontSize: FontSize.caption, color: Colors.textLight, fontWeight: "600" },
  cellValue: { fontSize: FontSize.small, color: Colors.text, fontWeight: "700", marginTop: 2 },
  perforation: { flexDirection: "row", alignItems: "center", height: NOTCH },
  notch: {
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: Colors.background,
  },
  notchLeft: { marginLeft: -NOTCH / 2 },
  notchRight: { marginRight: -NOTCH / 2 },
  dashes: {
    flex: 1,
    borderTopWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.border,
    marginHorizontal: 6,
  },
  bottom: { alignItems: "center", padding: 18, paddingTop: 10 },
  qrWrap: { borderRadius: Radius.md },
  faded: { opacity: 0.25 },
  sample: { fontSize: 10, fontWeight: "800", color: Colors.textLight, marginTop: 8, letterSpacing: 1 },
  ticketId: {
    fontSize: FontSize.title,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: 2,
    marginTop: 6,
  },
  hintRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  hint: { fontSize: FontSize.small, color: Colors.textMuted },
});
