import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import EventCard from "../../../components/events/event-card";
import Screen from "../../../components/ui/screen";
import ScreenHeader from "../../../components/ui/screen-header";
import { EmptyState, LoadingState } from "../../../components/ui/state-views";
import { Colors } from "../../../constants/theme";
import { useApp } from "../../../context/app-context";
import { useSimulatedLoading } from "../../../hooks/use-simulated-loading";
import { AppEvent } from "../../../types/models";
import { seatsLeft } from "../../../utils/event-helpers";

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
      <ScreenHeader title="Saved events" subtitle="Events you want to remember" />

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
              <View>
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
                  actionLabel="View event"
                  onPress={() =>
                    router.push({ pathname: "/saved/[id]", params: { id: item.id } })
                  }
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${item.title} from saved`}
                  onPress={() => removeSaved(item.id)}
                  style={styles.remove}
                  hitSlop={8}
                >
                  <Ionicons name="bookmark" size={22} color={Colors.primary} />
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="bookmark-outline"
              title="No saved events yet"
              message="Tap “Save event” on any event to keep it here."
              actionLabel="Explore events"
              onAction={() => router.navigate("/explore")}
            />
          }
          ListFooterComponent={
            savedEvents.length > 0 ? (
              <Text style={styles.hint}>Tap the bookmark to remove an event.</Text>
            ) : null
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 24, flexGrow: 1 },
  remove: { position: "absolute", top: 16, right: 16 },
  hint: { fontSize: 12, color: Colors.textLight, textAlign: "center" },
});
