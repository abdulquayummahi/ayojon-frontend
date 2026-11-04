import { router } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import EventCard from "../../../components/events/event-card";
import Button from "../../../components/ui/button";
import ChipRow from "../../../components/ui/chip-row";
import Screen from "../../../components/ui/screen";
import ScreenHeader from "../../../components/ui/screen-header";
import { EmptyState, LoadingState } from "../../../components/ui/state-views";
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

  const visibleEvents = myEvents
    .filter((e) => e.status === filter)
    .sort(
      (a, b) =>
        parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime()
    );

  const filterOptions = [
    { value: "published" as EventStatus, label: `Published (${countOf("published")})` },
    { value: "draft" as EventStatus, label: `Drafts (${countOf("draft")})` },
    { value: "closed" as EventStatus, label: `Closed (${countOf("closed")})` },
  ];

  return (
    <Screen>
      <ScreenHeader title="My events" subtitle="Organizer workspace" />

      <Button title="+ Create event" onPress={() => router.navigate("/create")} />

      <View style={styles.spacer} />
      <ChipRow options={filterOptions} selected={filter} onSelect={setFilter} />

      {isLoading ? (
        <LoadingState message="Loading your events…" />
      ) : (
        <FlatList
          data={visibleEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const registered = countActiveBookings(state.bookings, item.id);
            const isDraft = item.status === "draft";
            return (
              <EventCard
                event={item}
                footerText={isDraft ? "Draft · not visible to attendees" : `${registered} / ${item.seatLimit} registered`}
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
            <EmptyState
              icon="calendar-outline"
              title="Nothing here yet"
              message={EMPTY_TEXT[filter]}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  spacer: { height: 6 },
  list: { paddingTop: 12, paddingBottom: 24, flexGrow: 1 },
});
