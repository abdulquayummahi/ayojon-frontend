import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import DateBadge from "../../../components/events/date-badge";
import Banner from "../../../components/ui/banner";
import Button from "../../../components/ui/button";
import Card from "../../../components/ui/card";
import ChipRow from "../../../components/ui/chip-row";
import ConfirmDialog from "../../../components/ui/confirm-dialog";
import Screen from "../../../components/ui/screen";
import ScreenHeader from "../../../components/ui/screen-header";
import StatusBadge from "../../../components/ui/status-badge";
import { EmptyState, LoadingState } from "../../../components/ui/state-views";
import { Colors } from "../../../constants/theme";
import { useApp } from "../../../context/app-context";
import { useSimulatedLoading } from "../../../hooks/use-simulated-loading";
import { Booking } from "../../../types/models";
import { formatShortDate } from "../../../utils/event-helpers";

type TicketFilter = "active" | "cancelled" | "all";

export default function MyTicketsScreen() {
  const { state, currentUser, dispatch } = useApp();
  const isLoading = useSimulatedLoading(600);

  const [filter, setFilter] = useState<TicketFilter>("active");
  const [ticketToCancel, setTicketToCancel] = useState<Booking | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fake cancel request
  useEffect(() => {
    if (!cancellingId) return;

    const timeoutId = setTimeout(() => {
      dispatch({ type: "CANCEL_BOOKING", payload: cancellingId });
      setSuccessMessage(`Booking ${cancellingId} cancelled. Your seat was released.`);
      setCancellingId(null);
    }, 900);

    return () => clearTimeout(timeoutId);
  // Runs only when the trigger changes (Submit pressed), not on every
  // keystroke — so the other values are left out on purpose.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancellingId]);

  useEffect(() => {
    if (!successMessage) return;
    const timeoutId = setTimeout(() => setSuccessMessage(""), 3500);
    return () => clearTimeout(timeoutId);
  }, [successMessage]);

  if (!currentUser) return null;

  const myBookings = state.bookings.filter((b) => b.userId === currentUser.id);
  const activeCount = myBookings.filter((b) => b.status === "booked").length;
  const cancelledCount = myBookings.length - activeCount;

  const visibleBookings = myBookings.filter((b) =>
    filter === "all"
      ? true
      : filter === "active"
        ? b.status === "booked"
        : b.status === "cancelled"
  );

  const filterOptions = [
    { value: "active" as TicketFilter, label: `Active (${activeCount})` },
    { value: "cancelled" as TicketFilter, label: `Cancelled (${cancelledCount})` },
    { value: "all" as TicketFilter, label: "All" },
  ];

  const confirmCancel = () => {
    if (!ticketToCancel) return;
    setCancellingId(ticketToCancel.id);
    setTicketToCancel(null);
  };

  return (
    <Screen>
      <ScreenHeader title="My tickets" subtitle="Your bookings and QR tickets" />

      {successMessage ? <Banner type="success" message={successMessage} /> : null}

      <ChipRow options={filterOptions} selected={filter} onSelect={setFilter} />

      {isLoading ? (
        <LoadingState message="Loading tickets…" />
      ) : (
        <FlatList
          data={visibleBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const event = state.events.find((e) => e.id === item.eventId);
            if (!event) return null;
            const canCancel = item.status === "booked" && item.checkedInAt === null;
            return (
              <Card>
                <View style={styles.top}>
                  <DateBadge date={event.date} />
                  <View style={styles.topText}>
                    <Text style={styles.title} numberOfLines={2}>
                      {event.title}
                    </Text>
                    <Text style={styles.meta}>{formatShortDate(event)}</Text>
                  </View>
                </View>
                <View style={styles.idRow}>
                  <Text style={styles.ticketId}>{item.id}</Text>
                  {item.status === "cancelled" ? (
                    <StatusBadge label="Cancelled" tone="danger" />
                  ) : item.checkedInAt ? (
                    <StatusBadge label="Checked in" tone="success" />
                  ) : (
                    <StatusBadge label="Booked" tone="primary" />
                  )}
                </View>
                <View style={styles.actions}>
                  <Button
                    title="View ticket"
                    variant="secondary"
                    onPress={() =>
                      router.push({
                        pathname: "/tickets/[ticketId]",
                        params: { ticketId: item.id },
                      })
                    }
                    style={styles.flex}
                  />
                  {canCancel ? (
                    <Button
                      title="Cancel"
                      variant="danger"
                      loading={cancellingId === item.id}
                      disabled={cancellingId !== null}
                      onPress={() => setTicketToCancel(item)}
                      style={styles.flex}
                    />
                  ) : null}
                </View>
              </Card>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="ticket-outline"
              title={filter === "cancelled" ? "No cancelled bookings" : "No tickets yet"}
              message={
                filter === "cancelled"
                  ? "Bookings you cancel will appear here."
                  : "Book a seat at an event and your QR ticket will show up here."
              }
              actionLabel={filter === "cancelled" ? undefined : "Explore events"}
              onAction={() => router.navigate("/explore")}
            />
          }
        />
      )}

      <ConfirmDialog
        visible={ticketToCancel !== null}
        title="Cancel this booking?"
        message={`Ticket ${ticketToCancel?.id ?? ""} will stop working and your seat will be given to someone else.`}
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        destructive
        onConfirm={confirmCancel}
        onCancel={() => setTicketToCancel(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingTop: 12, paddingBottom: 24, flexGrow: 1 },
  top: { flexDirection: "row", alignItems: "center" },
  topText: { marginLeft: 12, flex: 1 },
  title: { fontSize: 16, fontWeight: "800", color: Colors.text },
  meta: { fontSize: 13, color: Colors.textMuted, marginTop: 3 },
  idRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  ticketId: { fontSize: 14, fontWeight: "700", color: Colors.text },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
  flex: { flex: 1 },
});
