import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Banner from "../../../components/ui/banner";
import Button from "../../../components/ui/button";
import Card from "../../../components/ui/card";
import ConfirmDialog from "../../../components/ui/confirm-dialog";
import Screen from "../../../components/ui/screen";
import ScreenHeader from "../../../components/ui/screen-header";
import StatusBadge from "../../../components/ui/status-badge";
import { ErrorState, LoadingState } from "../../../components/ui/state-views";
import { Colors, Radius } from "../../../constants/theme";
import { useApp } from "../../../context/app-context";
import { useSimulatedLoading } from "../../../hooks/use-simulated-loading";
import { EventStatus } from "../../../types/models";
import {
  countActiveBookings,
  countCheckedIn,
  formatLongDate,
  STATUS_LABELS,
} from "../../../utils/event-helpers";

export default function ManageEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, currentUser, dispatch } = useApp();
  const isLoading = useSimulatedLoading(500);

  const [pendingStatus, setPendingStatus] = useState<EventStatus | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const event = state.events.find((e) => e.id === id);

  // Fake "update registration status" request
  useEffect(() => {
    if (!pendingStatus || !event) return;

    const timeoutId = setTimeout(() => {
      dispatch({
        type: "SET_EVENT_STATUS",
        payload: { eventId: event.id, status: pendingStatus },
      });
      setSuccessMessage(
        pendingStatus === "closed"
          ? "Registration closed. Attendees can no longer book."
          : "Registration is open. Attendees can book seats."
      );
      setPendingStatus(null);
    }, 800);

    return () => clearTimeout(timeoutId);
  // Runs only when pendingStatus changes (the organizer pressed the open/close
  // button). event and dispatch are left out on purpose, so a store update
  // doesn't restart the timer.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingStatus]);

  useEffect(() => {
    if (!successMessage) return;
    const timeoutId = setTimeout(() => setSuccessMessage(""), 3500);
    return () => clearTimeout(timeoutId);
  }, [successMessage]);

  if (isLoading) {
    return (
      <Screen>
        <LoadingState message="Loading event…" />
      </Screen>
    );
  }

  // Only the event owner can manage it
  if (!event || event.organizerId !== currentUser?.id) {
    return (
      <Screen>
        <ErrorState
          title="Event not available"
          message="This event doesn't exist or belongs to another organizer."
          actionLabel="Back to my events"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const registered = countActiveBookings(state.bookings, event.id);
  const checkedIn = countCheckedIn(state.bookings, event.id);
  const remaining = Math.max(0, event.seatLimit - registered);
  const fillPercent = Math.min(100, Math.round((registered / event.seatLimit) * 100));
  const isOpen = event.status === "published";
  const isDraft = event.status === "draft";

  const requestToggle = () => {
    if (isOpen) setShowConfirm(true); // closing needs confirmation
    else setPendingStatus("published");
  };

  return (
    <Screen scroll>
      <ScreenHeader title="Manage event" backLabel="Back to my events" />
      <Text style={styles.eventTitle}>{event.title}</Text>
      <Text style={styles.meta}>{formatLongDate(event)}</Text>
      <Text style={styles.meta}>{event.venue}</Text>

      {successMessage ? <Banner type="success" message={successMessage} /> : null}

      <Card style={styles.statsCard}>
        <Text style={styles.bigNumber}>{registered} registered</Text>
        <Text style={styles.meta}>
          {event.seatLimit} total seats · {remaining} remaining
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${fillPercent}%` }]} />
        </View>
        <View style={styles.statRow}>
          <Text style={styles.meta}>{checkedIn} checked in</Text>
          <StatusBadge
            label={isDraft ? "Draft" : isOpen ? "Open" : "Closed"}
            tone={isDraft ? "neutral" : isOpen ? "success" : "danger"}
          />
        </View>
      </Card>

      <Button
        title="Edit event"
        variant="secondary"
        onPress={() =>
          router.push({ pathname: "/events/edit/[id]", params: { id: event.id } })
        }
      />
      <Button
        title={`View attendees (${registered})`}
        variant="secondary"
        onPress={() =>
          router.push({ pathname: "/events/attendees/[id]", params: { id: event.id } })
        }
        style={styles.gap}
      />
      <Button
        title="Scan QR ticket"
        onPress={() =>
          router.push({ pathname: "/events/scan/[id]", params: { id: event.id } })
        }
        disabled={isDraft}
        style={styles.gap}
      />
      <Button
        title={isDraft ? "Publish event" : isOpen ? "Close registration" : "Reopen registration"}
        variant={isOpen ? "danger" : "secondary"}
        loading={pendingStatus !== null}
        onPress={requestToggle}
        style={styles.gap}
      />

      <Text style={styles.status}>Status: {STATUS_LABELS[event.status]}</Text>

      <ConfirmDialog
        visible={showConfirm}
        title="Close registration?"
        message="New attendees won't be able to book. Existing tickets stay valid."
        confirmLabel="Close"
        cancelLabel="Keep open"
        destructive
        onConfirm={() => {
          setShowConfirm(false);
          setPendingStatus("closed");
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  eventTitle: { fontSize: 18, fontWeight: "800", color: Colors.text },
  meta: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  statsCard: { marginTop: 16 },
  bigNumber: { fontSize: 26, fontWeight: "800", color: Colors.text },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.pill,
    marginTop: 14,
    overflow: "hidden",
  },
  progressFill: { height: 8, backgroundColor: Colors.primary },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  gap: { marginTop: 10 },
  status: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 18,
    textAlign: "center",
  },
});
