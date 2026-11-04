import { router } from "expo-router";
import { FlatList, StyleSheet } from "react-native";
import EventCard from "../../../components/events/event-card";
import Screen from "../../../components/ui/screen";
import ScreenHeader from "../../../components/ui/screen-header";
import { EmptyState, LoadingState } from "../../../components/ui/state-views";
import { useApp } from "../../../context/app-context";
import { useSimulatedLoading } from "../../../hooks/use-simulated-loading";
import { AppEvent } from "../../../types/models";
import { countActiveBookings, seatsLeft } from "../../../utils/event-helpers";

export default function SavedEventsScreen() {
  const { state, currentUser, dispatch } = useApp();
  const isLoading = useSimulatedLoading(500);

  if (!currentUser) return null;

  // Saved items come from the shared store, so saving on Event Details
  // shows up here immediately.
  const savedEvents = state.saved
    .filter((s) => s.userId === currentUser.id)
    .map((s) => state.events.find((e) => e.id === s.eventId))
    .filter((e): e is AppEvent => e !== undefined && e.status !== "draft");

  const removeSaved = (eventId: string) => {
    dispatch({
      type: "TOGGLE_SAVED",
      payload: { userId: currentUser.id, eventId },
    });
  };

  return (
    <Screen>
      <ScreenHeader
        title="Saved events"
        subtitle={
          savedEvents.length > 0
            ? `${savedEvents.length} saved · tap the bookmark to remove`
            : "Events you want to remember"
        }
      />

      {isLoading ? (
        <LoadingState message="Loading saved events…" />
      ) : (
        <FlatList
          data={savedEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const left = seatsLeft(item, state.bookings);
            return (
              <EventCard
                event={item}
                footerText={
                  item.status === "closed"
                    ? "Registration closed"
                    : left === 0
                      ? "Fully booked"
                      : `${left} seats left`
                }
                highlight={item.status === "closed" || left === 0 ? "danger" : undefined}
                progress={countActiveBookings(state.bookings, item.id) / item.seatLimit}
                actionLabel="View event"
                isSaved
                onToggleSave={() => removeSaved(item.id)}
                onPress={() =>
                  router.push({ pathname: "/saved/[id]", params: { id: item.id } })
                }
              />
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="bookmark-outline"
              title="No saved events yet"
              message="Tap the bookmark on any event to keep it here."
              actionLabel="Explore events"
              onAction={() => router.navigate("/explore")}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 16, flexGrow: 1 },
});
