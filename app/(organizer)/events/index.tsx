import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import EventCard from "../../../components/events/event-card";
import ChipRow from "../../../components/ui/chip-row";
import Screen from "../../../components/ui/screen";
import ScreenHeader from "../../../components/ui/screen-header";
import { EmptyState, LoadingState } from "../../../components/ui/state-views";
import { Colors, FontSize, Radius, Shadow } from "../../../constants/theme";
import { useApp } from "../../../context/app-context";
import { useSimulatedLoading } from "../../../hooks/use-simulated-loading";
import { EventStatus } from "../../../types/models";
import {
  countActiveBookings,
  parseEventDate,
} from "../../../utils/event-helpers";

const EMPTY_TEXT: Record<EventStatus, string> = {
  published: "You have no published events. Publish a draft or create a new event.",
  draft: "No drafts. Events you save without publishing appear here.",
  closed: "No closed events. Close registration from Manage Event.",
};

export default function OrganizerEventsScreen() {
  const { state, currentUser } = useApp();
  const isLoading = useSimulatedLoading(600);
  const [filter, setFilter] = useState<EventStatus>("published");

  if (!currentUser) return null;

  // Organizers only ever see their own events
  const myEvents = state.events.filter((e) => e.organizerId === currentUser.id);
  const countOf = (status: EventStatus) =>
    myEvents.filter((e) => e.status === status).length;
  const totalRegistrations = myEvents.reduce(
    (sum, e) => sum + countActiveBookings(state.bookings, e.id),
    0
  );

  const visibleEvents = myEvents
    .filter((e) => e.status === filter)
    .sort(
      (a, b) =>
        parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime()
    );

  const filterOptions = [
    { value: "published" as EventStatus, label: `Published (${countOf("published")})`, icon: "radio-outline" as const },
    { value: "draft" as EventStatus, label: `Drafts (${countOf("draft")})`, icon: "document-outline" as const },
    { value: "closed" as EventStatus, label: `Closed (${countOf("closed")})`, icon: "lock-closed-outline" as const },
  ];

  const summary = [
    { label: "Live events", value: countOf("published"), icon: "radio-outline" as const },
    { label: "Drafts", value: countOf("draft"), icon: "document-outline" as const },
    { label: "Registrations", value: totalRegistrations, icon: "people-outline" as const },
  ];

  const header = (
    <View>
      <View style={styles.summary}>
        {summary.map((item) => (
          <View key={item.label} style={styles.summaryTile}>
            <View style={styles.summaryIcon}>
              <Ionicons name={item.icon} size={17} color={Colors.primary} />
            </View>
            <Text style={styles.summaryValue}>{item.value}</Text>
            <Text style={styles.summaryLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
      <ChipRow options={filterOptions} selected={filter} onSelect={setFilter} />
    </View>
  );

  return (
    <Screen>
      <ScreenHeader
        title="My events"
        subtitle={`Organizer workspace · ${currentUser.name}`}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create event"
            onPress={() => router.navigate("/create")}
            style={styles.newButton}
          >
            <Ionicons name="add" size={24} color={Colors.white} />
          </Pressable>
        }
      />

      <FlatList
        data={isLoading ? [] : visibleEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        renderItem={({ item }) => {
          const registered = countActiveBookings(state.bookings, item.id);
          const isDraft = item.status === "draft";
          return (
            <EventCard
              event={item}
              footerText={
                isDraft
                  ? "Draft · not visible to attendees"
                  : `${registered} / ${item.seatLimit} registered`
              }
              progress={isDraft ? undefined : registered / item.seatLimit}
              tag={
                isDraft
                  ? { label: "Draft", tone: "neutral" }
                  : item.status === "closed"
                    ? { label: "Closed", tone: "danger" }
                    : { label: "Open", tone: "success" }
              }
              actionLabel={isDraft ? "Edit draft" : "Manage"}
              onPress={() =>
                isDraft
                  ? router.push({ pathname: "/events/edit/[id]", params: { id: item.id } })
                  : router.push({ pathname: "/events/[id]", params: { id: item.id } })
              }
            />
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <LoadingState message="Loading your events…" />
          ) : (
            <EmptyState
              icon="calendar-outline"
              title="Nothing here yet"
              message={EMPTY_TEXT[filter]}
              actionLabel="Create an event"
              onAction={() => router.navigate("/create")}
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 16 },
  newButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.raised,
  },
  summary: { flexDirection: "row", gap: 10, marginBottom: 16 },
  summaryTile: {
    flex: 1,
    padding: 12,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    ...Shadow.card,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryValue: { fontSize: FontSize.title, fontWeight: "800", color: Colors.text, marginTop: 8 },
  summaryLabel: { fontSize: FontSize.caption, color: Colors.textMuted, marginTop: 1 },
});
