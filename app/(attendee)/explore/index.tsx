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
import ChipRow from "../../../components/ui/chip-row";
import Screen from "../../../components/ui/screen";
import ScreenHeader from "../../../components/ui/screen-header";
import { EmptyState, LoadingState } from "../../../components/ui/state-views";
import { Colors, Radius } from "../../../constants/theme";
import { useApp } from "../../../context/app-context";
import { CATEGORIES, LOCATIONS } from "../../../data/mock-events";
import { useSimulatedLoading } from "../../../hooks/use-simulated-loading";
import { EventCategory, EventLocation } from "../../../types/models";
import {
  DATE_FILTER_LABELS,
  DateFilter,
  matchesDateFilter,
  parseEventDate,
  seatsLeft,
} from "../../../utils/event-helpers";

type CategoryFilter = "All" | EventCategory;
type LocationFilter = "All" | EventLocation;

const CATEGORY_OPTIONS = [
  { value: "All" as CategoryFilter, label: "All" },
  ...CATEGORIES.map((c) => ({ value: c as CategoryFilter, label: c })),
];
const LOCATION_OPTIONS = [
  { value: "All" as LocationFilter, label: "All locations" },
  ...LOCATIONS.map((l) => ({ value: l as LocationFilter, label: l })),
];
const DATE_OPTIONS = (Object.keys(DATE_FILTER_LABELS) as DateFilter[]).map(
  (d) => ({ value: d, label: DATE_FILTER_LABELS[d] })
);

export default function ExploreScreen() {
  const { state } = useApp();

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

  return (
    <Screen>
      <ScreenHeader
        title="Find your next event"
        subtitle="Discover campus & community events"
      />

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={Colors.textLight} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search events, clubs or venues…"
          placeholderTextColor={Colors.textLight}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {query.length > 0 ? (
          <Pressable onPress={() => setQuery("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={Colors.textLight} />
          </Pressable>
        ) : null}
      </View>

      <ChipRow options={CATEGORY_OPTIONS} selected={category} onSelect={setCategory} />

      <Pressable
        accessibilityRole="button"
        onPress={() => setShowFilters((prev) => !prev)}
        style={styles.filterToggle}
      >
        <Text style={styles.filterSummary}>
          Date: {DATE_FILTER_LABELS[dateFilter]} · Location:{" "}
          {location === "All" ? "All" : location}
        </Text>
        <Text style={styles.filterLink}>
          {showFilters ? "Hide filters" : `Filters${activeFilterCount ? ` (${activeFilterCount})` : ""}`}
        </Text>
      </Pressable>

      {showFilters ? (
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>Date</Text>
          <ChipRow options={DATE_OPTIONS} selected={dateFilter} onSelect={setDateFilter} />
          <Text style={styles.filterLabel}>Location</Text>
          <ChipRow options={LOCATION_OPTIONS} selected={location} onSelect={setLocation} />
        </View>
      ) : null}

      {isLoading ? (
        <LoadingState message="Loading events…" />
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => setReloadKey((k) => k + 1)}
              tintColor={Colors.primary}
            />
          }
          ListHeaderComponent={
            <Text style={styles.count}>
              {filteredEvents.length} event{filteredEvents.length === 1 ? "" : "s"} found
            </Text>
          }
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
                actionLabel="View event"
                onPress={() =>
                  router.push({ pathname: "/explore/[id]", params: { id: item.id } })
                }
              />
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="No events match"
              message="Try another search word or clear the filters."
              actionLabel="Clear search & filters"
              onAction={clearFilters}
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: Colors.text },
  filterToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  filterSummary: { fontSize: 12, color: Colors.textMuted, flexShrink: 1 },
  filterLink: { fontSize: 13, color: Colors.primary, fontWeight: "700" },
  filterPanel: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textMuted,
    marginTop: 4,
  },
  list: { paddingTop: 8, paddingBottom: 24, flexGrow: 1 },
  count: { fontSize: 13, color: Colors.textMuted, marginBottom: 10 },
});
