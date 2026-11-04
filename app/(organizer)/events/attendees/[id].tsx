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
import Button from "../../../../components/ui/button";
import ChipRow from "../../../../components/ui/chip-row";
import Screen from "../../../../components/ui/screen";
import ScreenHeader from "../../../../components/ui/screen-header";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../../../components/ui/state-views";
import { Colors, Radius } from "../../../../constants/theme";
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
    { value: "all" as AttendeeFilter, label: `All (${attendees.length})` },
    { value: "checked" as AttendeeFilter, label: `Checked in (${checkedInCount})` },
    {
      value: "pending" as AttendeeFilter,
      label: `Pending (${attendees.length - checkedInCount})`,
    },
  ];

  return (
    <Screen>
      <ScreenHeader title="Attendees" subtitle={event.title} />

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={Colors.textLight} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search name or ticket ID"
          placeholderTextColor={Colors.textLight}
          autoCapitalize="none"
          style={styles.searchInput}
        />
        {query.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => setQuery("")}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={18} color={Colors.textLight} />
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
              <View style={styles.rowText}>
                <Text style={styles.name}>{item.attendeeName}</Text>
                <Text style={styles.ticket}>{item.id}</Text>
              </View>
              <Text
                style={[
                  styles.status,
                  item.checkedInAt ? styles.checked : styles.pending,
                ]}
              >
                {item.checkedInAt ? "Checked in" : "Pending"}
              </Text>
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

      <Button
        title="Scan QR ticket"
        onPress={() =>
          router.push({ pathname: "/events/scan/[id]", params: { id: event.id } })
        }
        disabled={event.status === "draft"}
        style={styles.scan}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: Colors.text },
  listBox: {
    flex: 1,
    marginTop: 10,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  list: { paddingHorizontal: 16, flexGrow: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  rowText: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700", color: Colors.text },
  ticket: { fontSize: 13, color: Colors.textMuted, marginTop: 3 },
  status: { fontSize: 13, fontWeight: "600" },
  checked: { color: Colors.success },
  pending: { color: Colors.primary },
  scan: { marginTop: 14 },
});
