import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Avatar from "../../../../components/ui/avatar";
import Button from "../../../../components/ui/button";
import ChipRow from "../../../../components/ui/chip-row";
import Screen from "../../../../components/ui/screen";
import ScreenHeader from "../../../../components/ui/screen-header";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../../../components/ui/state-views";
import StatusBadge from "../../../../components/ui/status-badge";
import { Colors, FontSize, Radius, Shadow } from "../../../../constants/theme";
import { useApp } from "../../../../context/app-context";
import { useSimulatedLoading } from "../../../../hooks/use-simulated-loading";

type AttendeeFilter = "all" | "checked" | "pending";

export default function AttendeesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, currentUser } = useApp();
  const isLoading = useSimulatedLoading(600);

  // Search and filter are local to this screen
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<AttendeeFilter>("all");

  const event = state.events.find((e) => e.id === id);

  if (!event || event.organizerId !== currentUser?.id) {
    return (
      <Screen>
        <ErrorState
          title="Attendees not available"
          message="Only the event owner can view this attendee list."
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  // Active bookings only — cancelled tickets are not attendees
  const attendees = state.bookings.filter(
    (b) => b.eventId === event.id && b.status === "booked"
  );
  const checkedInCount = attendees.filter((b) => b.checkedInAt !== null).length;

  const search = query.trim().toLowerCase();
  const visible = attendees
    .filter(
      (b) =>
        search.length === 0 ||
        b.attendeeName.toLowerCase().includes(search) ||
        b.id.toLowerCase().includes(search)
    )
    .filter((b) =>
      filter === "all"
        ? true
        : filter === "checked"
          ? b.checkedInAt !== null
          : b.checkedInAt === null
    )
    .sort((a, b) => a.attendeeName.localeCompare(b.attendeeName));

  const filterOptions = [
    { value: "all" as AttendeeFilter, label: `All (${attendees.length})`, icon: "people-outline" as const },
    {
      value: "checked" as AttendeeFilter,
      label: `Checked in (${checkedInCount})`,
      icon: "checkmark-done-outline" as const,
    },
    {
      value: "pending" as AttendeeFilter,
      label: `Pending (${attendees.length - checkedInCount})`,
      icon: "time-outline" as const,
    },
  ];

  return (
    <Screen
      footer={
        <Button
          title="Scan QR ticket"
          icon="qr-code-outline"
          onPress={() =>
            router.push({ pathname: "/events/scan/[id]", params: { id: event.id } })
          }
          disabled={event.status === "draft"}
        />
      }
    >
      <ScreenHeader title="Attendees" subtitle={event.title} backLabel="Back to event" />

      <View style={styles.searchBox}>
        <Ionicons name="search" size={19} color={Colors.textLight} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search name or ticket ID"
          placeholderTextColor={Colors.textLight}
          autoCapitalize="none"
          style={styles.searchInput}
          accessibilityLabel="Search attendees"
        />
        {query.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => setQuery("")}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={19} color={Colors.textLight} />
          </Pressable>
        ) : null}
      </View>

      <ChipRow options={filterOptions} selected={filter} onSelect={setFilter} />

      {isLoading ? (
        <LoadingState message="Loading attendees…" />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          style={styles.listBox}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View style={[styles.row, index > 0 && styles.rowBorder]}>
              <Avatar name={item.attendeeName} size={42} />
              <View style={styles.rowText}>
                <Text style={styles.name}>{item.attendeeName}</Text>
                <Text style={styles.ticket}>{item.id}</Text>
              </View>
              {item.checkedInAt ? (
                <StatusBadge label="Checked in" tone="success" />
              ) : (
                <StatusBadge label="Pending" tone="warning" />
              )}
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title={attendees.length === 0 ? "No attendees yet" : "No matches"}
              message={
                attendees.length === 0
                  ? "Bookings for this event will appear here."
                  : "No attendee matches this search and filter."
              }
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    marginBottom: 14,
    ...Shadow.card,
  },
  searchInput: { flex: 1, fontSize: FontSize.body, color: Colors.text },
  listBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    ...Shadow.card,
  },
  list: { paddingHorizontal: 14, flexGrow: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  rowText: { flex: 1 },
  name: { fontSize: FontSize.body, fontWeight: "700", color: Colors.text },
  ticket: { fontSize: FontSize.caption, color: Colors.textMuted, marginTop: 2, letterSpacing: 0.5 },
});
