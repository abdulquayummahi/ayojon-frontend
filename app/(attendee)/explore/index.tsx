import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import EventCard from "../../../components/events/event-card";
import Avatar from "../../../components/ui/avatar";
import ChipRow from "../../../components/ui/chip-row";
import Screen from "../../../components/ui/screen";
import { EmptyState, LoadingState } from "../../../components/ui/state-views";
import { Colors, FontSize, Radius, Shadow } from "../../../constants/theme";
import { useApp } from "../../../context/app-context";
import { CATEGORIES, LOCATIONS } from "../../../data/mock-events";
import { useSimulatedLoading } from "../../../hooks/use-simulated-loading";
import { EventCategory, EventLocation } from "../../../types/models";
import {
  CATEGORY_ICONS,
  countActiveBookings,
  DATE_FILTER_LABELS,
  DateFilter,
  matchesDateFilter,
  parseEventDate,
  seatsLeft,
} from "../../../utils/event-helpers";

type CategoryFilter = "All" | EventCategory;
type LocationFilter = "All" | EventLocation;

const CATEGORY_OPTIONS = [
  { value: "All" as CategoryFilter, label: "All", icon: "apps-outline" as const },
  ...CATEGORIES.map((c) => ({ value: c as CategoryFilter, label: c, icon: CATEGORY_ICONS[c] })),
];
const LOCATION_OPTIONS = [
  { value: "All" as LocationFilter, label: "All locations" },
  ...LOCATIONS.map((l) => ({ value: l as LocationFilter, label: l })),
];
const DATE_OPTIONS = (Object.keys(DATE_FILTER_LABELS) as DateFilter[]).map(
  (d) => ({ value: d, label: DATE_FILTER_LABELS[d] })
);

export default function ExploreScreen() {
  const { state, currentUser, dispatch } = useApp();

  // Search and filters are local UI state — only this screen needs them
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [dateFilter, setDateFilter] = useState<DateFilter>("any");
  const [location, setLocation] = useState<LocationFilter>("All");
  const [showFilters, setShowFilters] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const isLoading = useSimulatedLoading(700, reloadKey);

  const search = query.trim().toLowerCase();
  const filteredEvents = state.events
    .filter((e) => e.status !== "draft") // drafts are never public
    .filter(
      (e) =>
        search.length === 0 ||
        e.title.toLowerCase().includes(search) ||
        e.organizerName.toLowerCase().includes(search) ||
        e.venue.toLowerCase().includes(search)
    )
    .filter((e) => category === "All" || e.category === category)
    .filter((e) => location === "All" || e.location === location)
    .filter((e) => matchesDateFilter(e, dateFilter))
    .sort(
      (a, b) =>
        parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime() ||
        a.time.localeCompare(b.time)
    );

  const activeFilterCount =
    (dateFilter !== "any" ? 1 : 0) + (location !== "All" ? 1 : 0);

  const clearFilters = () => {
    setQuery("");
    setCategory("All");
    setDateFilter("any");
    setLocation("All");
  };

  const isSaved = (eventId: string) =>
    state.saved.some((s) => s.userId === currentUser?.id && s.eventId === eventId);

  const toggleSaved = (eventId: string) => {
    if (!currentUser) return;
    dispatch({ type: "TOGGLE_SAVED", payload: { userId: currentUser.id, eventId } });
  };

  const firstName = currentUser?.name.split(" ")[0] ?? "there";

  // Everything above the cards scrolls together with the list
  const header = (
    <View>
      <View style={styles.topRow}>
        <View style={styles.flex}>
          <Text style={styles.hello}>Hi, {firstName} 👋</Text>
          <Text style={styles.title}>Find your next event</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={() => router.navigate("/profile")}
        >
          <Avatar name={currentUser?.name ?? "?"} uri={currentUser?.avatarUrl} size={46} />
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={19} color={Colors.textLight} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search events, clubs or venues…"
            placeholderTextColor={Colors.textLight}
            style={styles.searchInput}
            returnKeyType="search"
            accessibilityLabel="Search events"
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={showFilters ? "Hide filters" : "Show date and location filters"}
          accessibilityState={{ expanded: showFilters }}
          onPress={() => setShowFilters((prev) => !prev)}
          style={[styles.filterButton, (showFilters || activeFilterCount > 0) && styles.filterButtonActive]}
        >
          <Ionicons
            name="options-outline"
            size={21}
            color={showFilters || activeFilterCount > 0 ? Colors.white : Colors.text}
          />
          {activeFilterCount > 0 ? (
            <View style={styles.filterCount}>
              <Text style={styles.filterCountText}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {showFilters ? (
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>Date</Text>
          <ChipRow options={DATE_OPTIONS} selected={dateFilter} onSelect={setDateFilter} />
          <Text style={styles.filterLabel}>Location</Text>
          <ChipRow options={LOCATION_OPTIONS} selected={location} onSelect={setLocation} />
        </View>
      ) : null}

      <ChipRow options={CATEGORY_OPTIONS} selected={category} onSelect={setCategory} />

      {!isLoading ? (
        <View style={styles.countRow}>
          <Text style={styles.count}>
            {filteredEvents.length} event{filteredEvents.length === 1 ? "" : "s"}
          </Text>
          <Text style={styles.sort}>Soonest first</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={isLoading ? [] : filteredEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => setReloadKey((k) => k + 1)}
            tintColor={Colors.primary}
          />
        }
        ListHeaderComponent={header}
        renderItem={({ item }) => {
          const left = seatsLeft(item, state.bookings);
          const footer =
            item.status === "closed"
              ? "Registration closed"
              : left === 0
                ? "Fully booked"
                : `${left} seats left`;
          return (
            <EventCard
              event={item}
              footerText={footer}
              highlight={item.status === "closed" || left === 0 ? "danger" : undefined}
              progress={countActiveBookings(state.bookings, item.id) / item.seatLimit}
              actionLabel="View event"
              isSaved={isSaved(item.id)}
              onToggleSave={() => toggleSaved(item.id)}
              onPress={() =>
                router.push({ pathname: "/explore/[id]", params: { id: item.id } })
              }
            />
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <LoadingState message="Loading events…" />
          ) : (
            <EmptyState
              icon="search-outline"
              title="No events match"
              message="Try another search word or clear the filters."
              actionLabel="Clear search & filters"
              onAction={clearFilters}
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingBottom: 16 },
  topRow: { flexDirection: "row", alignItems: "center", marginTop: 8, marginBottom: 18 },
  hello: { fontSize: FontSize.body, color: Colors.textMuted, fontWeight: "600" },
  title: {
    fontSize: FontSize.heading,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 2,
    letterSpacing: -0.5,
  },
  searchRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    ...Shadow.card,
  },
  searchInput: { flex: 1, fontSize: FontSize.body, color: Colors.text },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.card,
  },
  filterButtonActive: { backgroundColor: Colors.primary },
  filterCount: {
    position: "absolute",
    top: 8,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  filterCountText: { fontSize: 10, fontWeight: "800", color: Colors.primary },
  filterPanel: {
    padding: 14,
    paddingBottom: 0,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    marginBottom: 14,
    ...Shadow.card,
  },
  filterLabel: {
    fontSize: FontSize.caption,
    fontWeight: "800",
    color: Colors.textMuted,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  count: { fontSize: FontSize.lead, fontWeight: "800", color: Colors.text },
  sort: { fontSize: FontSize.caption, color: Colors.textMuted, fontWeight: "600" },
});
