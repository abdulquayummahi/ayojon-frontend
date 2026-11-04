import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ComponentProps, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Banner from "../../../components/ui/banner";
import BannerImage from "../../../components/ui/banner-image";
import Button from "../../../components/ui/button";
import ConfirmDialog from "../../../components/ui/confirm-dialog";
import ProgressBar from "../../../components/ui/progress-bar";
import Screen from "../../../components/ui/screen";
import { BackButton } from "../../../components/ui/screen-header";
import StatusBadge from "../../../components/ui/status-badge";
import { ErrorState, LoadingState } from "../../../components/ui/state-views";
import { Colors, FontSize, Radius, Shadow } from "../../../constants/theme";
import { useApp } from "../../../context/app-context";
import { useSimulatedLoading } from "../../../hooks/use-simulated-loading";
import { EventStatus } from "../../../types/models";
import {
  CATEGORY_ICONS,
  countActiveBookings,
  countCheckedIn,
  formatLongDate,
  STATUS_LABELS,
} from "../../../utils/event-helpers";

type IconName = ComponentProps<typeof Ionicons>["name"];

// One tappable row in the "Actions" list
function ActionRow({
  icon,
  title,
  subtitle,
  onPress,
  disabled = false,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.actionRow, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
    </Pressable>
  );
}

export default function ManageEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, currentUser, dispatch } = useApp();
  const isLoading = useSimulatedLoading(500);
  const insets = useSafeAreaInsets();

  const [pendingStatus, setPendingStatus] = useState<EventStatus | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const event = state.events.find((e) => e.id === id);

  // Fake "update registration status" request
  useEffect(() => {
    if (!pendingStatus || !event) return;

    const timeoutId = setTimeout(() => {
      dispatch({
        type: "SET_EVENT_STATUS",
        payload: { eventId: event.id, status: pendingStatus },
      });
      setSuccessMessage(
        pendingStatus === "closed"
          ? "Registration closed. Attendees can no longer book."
          : "Registration is open. Attendees can book seats."
      );
      setPendingStatus(null);
    }, 800);

    return () => clearTimeout(timeoutId);
  // Runs only when pendingStatus changes (the organizer pressed the open/close
  // button). event and dispatch are left out on purpose, so a store update
  // doesn't restart the timer.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingStatus]);

  useEffect(() => {
    if (!successMessage) return;
    const timeoutId = setTimeout(() => setSuccessMessage(""), 3500);
    return () => clearTimeout(timeoutId);
  }, [successMessage]);

  if (isLoading) {
    return (
      <Screen>
        <LoadingState message="Loading event…" />
      </Screen>
    );
  }

  // Only the event owner can manage it
  if (!event || event.organizerId !== currentUser?.id) {
    return (
      <Screen>
        <ErrorState
          title="Event not available"
          message="This event doesn't exist or belongs to another organizer."
          actionLabel="Back to my events"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const registered = countActiveBookings(state.bookings, event.id);
  const checkedIn = countCheckedIn(state.bookings, event.id);
  const remaining = Math.max(0, event.seatLimit - registered);
  const isOpen = event.status === "published";
  const isDraft = event.status === "draft";

  const requestToggle = () => {
    if (isOpen) setShowConfirm(true); // closing needs confirmation
    else setPendingStatus("published");
  };

  const stats = [
    { label: "Registered", value: registered, icon: "people-outline" as const },
    { label: "Remaining", value: remaining, icon: "albums-outline" as const },
    { label: "Checked in", value: checkedIn, icon: "checkmark-done-outline" as const },
  ];

  return (
    <Screen
      scroll
      fullBleed
      footer={
        <Button
          title={isDraft ? "Publish event" : isOpen ? "Close registration" : "Reopen registration"}
          icon={isOpen ? "lock-closed-outline" : "lock-open-outline"}
          variant={isOpen ? "danger" : "primary"}
          loading={pendingStatus !== null}
          onPress={requestToggle}
        />
      }
    >
      <BannerImage banner={event.banner} style={styles.hero}>
        <View style={[styles.heroBar, { paddingTop: insets.top + 10 }]}>
          <BackButton label="Back to my events" light />
          <View style={styles.statusPill}>
            <StatusBadge
              label={isDraft ? "Draft" : isOpen ? "Registration open" : "Registration closed"}
              tone={isDraft ? "neutral" : isOpen ? "success" : "danger"}
            />
          </View>
        </View>
      </BannerImage>

      <View style={styles.sheet}>
        <View style={styles.categoryRow}>
          <Ionicons name={CATEGORY_ICONS[event.category]} size={14} color={Colors.primary} />
          <Text style={styles.category}>{event.category}</Text>
        </View>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={15} color={Colors.textMuted} />
          <Text style={styles.meta}>{formatLongDate(event)}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={15} color={Colors.textMuted} />
          <Text style={styles.meta}>
            {event.venue} · {event.location}
          </Text>
        </View>

        {successMessage ? (
          <View style={styles.gapTop}>
            <Banner type="success" message={successMessage} />
          </View>
        ) : null}

        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <View key={stat.label} style={styles.stat}>
                <Ionicons name={stat.icon} size={18} color={Colors.primary} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.capacityRow}>
            <Text style={styles.capacityText}>Capacity</Text>
            <Text style={styles.capacityText}>
              {registered} / {event.seatLimit} seats
            </Text>
          </View>
          <ProgressBar value={registered / event.seatLimit} height={8} />
        </View>

        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.actions}>
          <ActionRow
            icon="qr-code-outline"
            title="Scan QR ticket"
            subtitle={isDraft ? "Publish the event first" : "Check attendees in at the door"}
            disabled={isDraft}
            onPress={() =>
              router.push({ pathname: "/events/scan/[id]", params: { id: event.id } })
            }
          />
          <View style={styles.divider} />
          <ActionRow
            icon="people-outline"
            title={`View attendees (${registered})`}
            subtitle="Search by name or ticket ID"
            onPress={() =>
              router.push({ pathname: "/events/attendees/[id]", params: { id: event.id } })
            }
          />
          <View style={styles.divider} />
          <ActionRow
            icon="create-outline"
            title="Edit event"
            subtitle="Banner, details, schedule and seats"
            onPress={() =>
              router.push({ pathname: "/events/edit/[id]", params: { id: event.id } })
            }
          />
        </View>

        <Text style={styles.status}>Status: {STATUS_LABELS[event.status]}</Text>
      </View>

      <ConfirmDialog
        visible={showConfirm}
        title="Close registration?"
        message="New attendees won't be able to book. Existing tickets stay valid."
        confirmLabel="Close"
        cancelLabel="Keep open"
        destructive
        onConfirm={() => {
          setShowConfirm(false);
          setPendingStatus("closed");
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { height: 230 },
  heroBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  statusPill: { backgroundColor: Colors.surface, borderRadius: Radius.pill },
  sheet: {
    marginTop: -26,
    paddingHorizontal: 20,
    paddingTop: 22,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: Colors.background,
  },
  categoryRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  category: { fontSize: FontSize.caption, fontWeight: "800", color: Colors.primary },
  eventTitle: {
    fontSize: FontSize.heading,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 6,
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 },
  meta: { fontSize: FontSize.small, color: Colors.textMuted },
  gapTop: { marginTop: 14 },
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: 14,
    marginTop: 18,
    ...Shadow.card,
  },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  stat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primarySoft,
  },
  statValue: { fontSize: FontSize.title, fontWeight: "800", color: Colors.text, marginTop: 4 },
  statLabel: { fontSize: FontSize.caption, color: Colors.textMuted, marginTop: 1 },
  capacityRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  capacityText: { fontSize: FontSize.caption, color: Colors.textMuted, fontWeight: "700" },
  sectionTitle: {
    fontSize: FontSize.lead,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 22,
    marginBottom: 10,
  },
  actions: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: 12,
    ...Shadow.card,
  },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.45 },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: { fontSize: FontSize.body, fontWeight: "700", color: Colors.text },
  actionSubtitle: { fontSize: FontSize.caption, color: Colors.textMuted, marginTop: 1 },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 54 },
  status: { fontSize: FontSize.caption, color: Colors.textLight, textAlign: "center", marginTop: 16 },
});
