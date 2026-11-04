import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Banner from "../../../../components/ui/banner";
import BannerImage from "../../../../components/ui/banner-image";
import Button from "../../../../components/ui/button";
import Card from "../../../../components/ui/card";
import FormField from "../../../../components/ui/form-field";
import Screen from "../../../../components/ui/screen";
import ScreenHeader from "../../../../components/ui/screen-header";
import { ErrorState } from "../../../../components/ui/state-views";
import { Colors, FontSize, Radius } from "../../../../constants/theme";
import { useApp } from "../../../../context/app-context";
import { Booking } from "../../../../types/models";
import {
  formatShortDate,
  generateTicketId,
  seatsLeft,
} from "../../../../utils/event-helpers";
import { validateEmail, validateName } from "../../../../utils/validation";

interface BookingForm {
  name: string;
  email: string;
}

interface BookingErrors {
  name?: string;
  email?: string;
}

function validateForm(data: BookingForm): BookingErrors {
  const errors: BookingErrors = {};
  const nameError = validateName(data.name);
  const emailError = validateEmail(data.email);
  if (nameError) errors.name = nameError;
  if (emailError) errors.email = emailError;
  return errors;
}

export default function ConfirmBookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, currentUser, dispatch } = useApp();

  // Prefill from the signed-in user — they can still edit it
  const [formData, setFormData] = useState<BookingForm>({
    name: currentUser?.name ?? "",
    email: currentUser?.email ?? "",
  });
  const [errors, setErrors] = useState<BookingErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitTrigger, setSubmitTrigger] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    setErrors(validateForm(formData));
  }, [formData]);

  const event = state.events.find((e) => e.id === id);

  // Fake booking request
  useEffect(() => {
    if (!submitTrigger || !event || !currentUser) return;

    const timeoutId = setTimeout(() => {
      setIsSubmitting(false);
      setSubmitTrigger(false);

      // Re-check right before booking (another user may have taken the seat)
      const alreadyBooked = state.bookings.some(
        (b) =>
          b.eventId === event.id &&
          b.userId === currentUser.id &&
          b.status === "booked"
      );
      if (alreadyBooked) {
        setBookingError("You already have a ticket for this event.");
        return;
      }
      if (event.status !== "published" || seatsLeft(event, state.bookings) === 0) {
        setBookingError("Sorry, no seats are left for this event.");
        return;
      }

      const booking: Booking = {
        id: generateTicketId(state.bookings),
        eventId: event.id,
        userId: currentUser.id,
        attendeeName: formData.name.trim(),
        attendeeEmail: formData.email.trim().toLowerCase(),
        status: "booked",
        bookedAt: new Date().toISOString(),
        checkedInAt: null,
      };
      dispatch({ type: "BOOK_SEAT", payload: booking });

      // Replace so "back" from the ticket returns to Event Details
      router.replace({
        pathname: "/explore/ticket/[ticketId]",
        params: { ticketId: booking.id, justBooked: "1" },
      });
    }, 1200);

    return () => clearTimeout(timeoutId);
  // Runs only when submitTrigger changes (Confirm booking pressed). formData
  // and state are read inside but left out on purpose, so typing doesn't
  // restart the timer.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitTrigger]);

  if (!event || !currentUser || event.status === "draft") {
    return (
      <Screen>
        <ErrorState
          title="Event not found"
          message="We couldn't find the event you are trying to book."
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const left = seatsLeft(event, state.bookings);
  const isBlocked = event.status !== "published" || left === 0;

  const updateField = (field: keyof BookingForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setBookingError("");
  };

  const getFieldError = (field: keyof BookingErrors) =>
    touched[field] || submitAttempted ? errors[field] : undefined;

  const handleConfirm = () => {
    setSubmitAttempted(true);
    if (Object.keys(errors).length === 0 && !isBlocked) {
      setIsSubmitting(true);
      setSubmitTrigger(true);
    }
  };

  return (
    <Screen
      scroll
      footer={
        <Button
          title="Confirm booking"
          icon="checkmark-circle-outline"
          onPress={handleConfirm}
          loading={isSubmitting}
          disabled={isBlocked}
        />
      }
    >
      <ScreenHeader title="Confirm booking" subtitle="Check the details below" backLabel="Back to event" />

      <Card style={styles.eventCard}>
        <BannerImage banner={event.banner} style={styles.eventImage} />
        <View style={styles.eventBody}>
          <Text style={styles.category}>{event.category.toUpperCase()}</Text>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.muted}>{formatShortDate(event)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.muted} numberOfLines={1}>
              {event.venue}
            </Text>
          </View>
        </View>
      </Card>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Seats</Text>
          <Text style={styles.summaryValue}>1</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Price</Text>
          <Text style={styles.summaryValue}>Free</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Left</Text>
          <Text style={[styles.summaryValue, left === 0 && styles.danger]}>{left}</Text>
        </View>
      </View>

      {isBlocked ? (
        <Banner
          type="error"
          message={
            event.status === "closed"
              ? "Registration is closed, so this event can't be booked."
              : "This event is fully booked. Booking is not possible."
          }
        />
      ) : null}
      {bookingError ? <Banner type="error" message={bookingError} /> : null}

      <Text style={styles.sectionTitle}>Your registration</Text>
      <FormField
        label="Attendee name"
        icon="person-outline"
        value={formData.name}
        onChangeText={(text) => updateField("name", text)}
        onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
        placeholder="Full name"
        error={getFieldError("name")}
      />
      <FormField
        label="Email"
        icon="mail-outline"
        value={formData.email}
        onChangeText={(text) => updateField("email", text)}
        onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={getFieldError("email")}
      />
      <View style={styles.noteRow}>
        <Ionicons name="shield-checkmark-outline" size={16} color={Colors.success} />
        <Text style={styles.note}>One seat per account. Your QR ticket opens right after booking.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eventCard: { flexDirection: "row", padding: 10, gap: 12, alignItems: "center" },
  eventImage: { width: 96, height: 96, borderRadius: Radius.lg },
  eventBody: { flex: 1 },
  category: { fontSize: 11, fontWeight: "800", color: Colors.primary, letterSpacing: 0.5 },
  eventTitle: { fontSize: FontSize.body, fontWeight: "800", color: Colors.text, marginTop: 3, marginBottom: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  muted: { flex: 1, fontSize: FontSize.caption, color: Colors.textMuted },
  danger: { color: Colors.danger },
  summary: {
    flexDirection: "row",
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.lg,
    paddingVertical: 12,
    marginBottom: 16,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryLabel: { fontSize: FontSize.caption, color: Colors.textMuted, fontWeight: "600" },
  summaryValue: { fontSize: FontSize.lead, color: Colors.text, fontWeight: "800", marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: Colors.primaryLight },
  sectionTitle: {
    fontSize: FontSize.lead,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 4,
    marginBottom: 12,
  },
  noteRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  note: { flex: 1, fontSize: FontSize.caption, color: Colors.textMuted },
});
