import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import DateBadge from "../../../../components/events/date-badge";
import Banner from "../../../../components/ui/banner";
import Button from "../../../../components/ui/button";
import Card from "../../../../components/ui/card";
import FormField from "../../../../components/ui/form-field";
import Screen from "../../../../components/ui/screen";
import ScreenHeader from "../../../../components/ui/screen-header";
import { ErrorState } from "../../../../components/ui/state-views";
import { Colors } from "../../../../constants/theme";
import { useApp } from "../../../../context/app-context";
import { Booking } from "../../../../types/models";
import {
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
    <Screen scroll>
      <ScreenHeader title="Confirm booking" backLabel="Back to event" />

      <Card>
        <View style={styles.eventTop}>
          <DateBadge date={event.date} />
          <View style={styles.eventTopText}>
            <Text style={styles.category}>{event.category.toUpperCase()}</Text>
            <Text style={styles.location}>{event.location}</Text>
          </View>
        </View>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.muted}>{event.venue}</Text>
        <View style={styles.eventFooter}>
          <Text style={[styles.muted, left === 0 && styles.danger]}>
            {left === 0 ? "No seats left" : `${left} seats left`}
          </Text>
          <Text style={styles.seat}>1 seat</Text>
        </View>
      </Card>

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
        label="Attendee"
        value={formData.name}
        onChangeText={(text) => updateField("name", text)}
        onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
        placeholder="Full name"
        error={getFieldError("name")}
      />
      <FormField
        label="Email"
        value={formData.email}
        onChangeText={(text) => updateField("email", text)}
        onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={getFieldError("email")}
      />
      <Text style={styles.note}>One seat per account. No payment required.</Text>

      <Button
        title="Confirm booking"
        onPress={handleConfirm}
        loading={isSubmitting}
        disabled={isBlocked}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  eventTop: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  eventTopText: { marginLeft: 12 },
  category: { fontSize: 11, fontWeight: "800", color: Colors.primary },
  location: { fontSize: 14, fontWeight: "600", color: Colors.text, marginTop: 2 },
  eventTitle: { fontSize: 17, fontWeight: "800", color: Colors.text },
  muted: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  danger: { color: Colors.danger, fontWeight: "600" },
  eventFooter: { flexDirection: "row", justifyContent: "space-between" },
  seat: { fontSize: 13, color: Colors.primary, fontWeight: "700", marginTop: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 8,
    marginBottom: 12,
  },
  note: { fontSize: 13, color: Colors.textMuted, marginBottom: 20 },
});
