import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import Banner from "../../../components/ui/banner";
import BannerImage from "../../../components/ui/banner-image";
import Button from "../../../components/ui/button";
import Card from "../../../components/ui/card";
import ChipRow from "../../../components/ui/chip-row";
import ConfirmDialog from "../../../components/ui/confirm-dialog";
import Screen from "../../../components/ui/screen";
import ScreenHeader from "../../../components/ui/screen-header";
import StatusBadge from "../../../components/ui/status-badge";
import { EmptyState, LoadingState } from "../../../components/ui/state-views";
import { Colors, FontSize, Radius } from "../../../constants/theme";
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
  // Runs only when cancellingId changes (the user confirmed a cancel).
  // dispatch never changes, so it is left out on purpose.
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
            const isCancelled = item.status === "cancelled";
            return (
              <Card style={styles.card}>
                <View style={styles.top}>
                  <BannerImage
                    banner={event.banner}
                    style={[styles.thumb, isCancelled && styles.faded]}
                  />
                  <View style={styles.topText}>
                    <Text style={styles.title} numberOfLines={2}>
                      {event.title}
                    </Text>
                    <View style={styles.metaRow}>
                      <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                      <Text style={styles.meta}>{formatShortDate(event)}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
                      <Text style={styles.meta} numberOfLines={1}>
                        {event.venue}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.idRow}>
                  <View style={styles.idBox}>
                    <Ionicons name="qr-code-outline" size={15} color={Colors.primary} />
                    <Text style={styles.ticketId}>{item.id}</Text>
                  </View>
                  {isCancelled ? (
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
                    icon="qr-code-outline"
                    variant="secondary"
                    size="sm"
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
                      icon="close-circle-outline"
                      variant="danger"
                      size="sm"
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
  list: { paddingBottom: 16, flexGrow: 1 },
  card: { padding: 12 },
  top: { flexDirection: "row", gap: 12 },
  thumb: { width: 86, height: 86, borderRadius: Radius.lg },
  faded: { opacity: 0.4 },
  topText: { flex: 1, justifyContent: "center" },
  title: { fontSize: FontSize.body, fontWeight: "800", color: Colors.text, marginBottom: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  meta: { flex: 1, fontSize: FontSize.caption, color: Colors.textMuted },
  idRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderStyle: "dashed",
  },
  idBox: { flexDirection: "row", alignItems: "center", gap: 6 },
  ticketId: { fontSize: FontSize.body, fontWeight: "800", color: Colors.text, letterSpacing: 1 },
  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
  flex: { flex: 1 },
});
