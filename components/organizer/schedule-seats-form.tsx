import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";
import { useApp } from "../../context/app-context";
import { LOCATIONS } from "../../data/mock-events";
import { AppEvent, EventLocation, EventStatus } from "../../types/models";
import { countActiveBookings } from "../../utils/event-helpers";
import { validateDate, validateTime } from "../../utils/validation";
import Banner from "../ui/banner";
import Button from "../ui/button";
import ChipRow from "../ui/chip-row";
import FormField from "../ui/form-field";
import Screen from "../ui/screen";
import ScreenHeader from "../ui/screen-header";
import { EventInfo } from "./event-info-form";

interface ScheduleForm {
  date: string;
  time: string;
  venue: string;
  location: EventLocation;
  seatLimit: string; // kept as text while typing
}

interface ScheduleErrors {
  date?: string;
  time?: string;
  venue?: string;
  seatLimit?: string;
}

function validateSchedule(data: ScheduleForm, minSeats: number): ScheduleErrors {
  const errors: ScheduleErrors = {};
  const dateError = validateDate(data.date);
  const timeError = validateTime(data.time);
  if (dateError) errors.date = dateError;
  if (timeError) errors.time = timeError;
  if (data.venue.trim().length === 0) errors.venue = "Venue is required.";

  const seats = data.seatLimit.trim();
  if (seats.length === 0) {
    errors.seatLimit = "Seat limit is required.";
  } else if (!/^\d+$/.test(seats) || Number(seats) <= 0) {
    errors.seatLimit = "Seat limit must be a whole number greater than 0.";
  } else if (Number(seats) < minSeats) {
    errors.seatLimit = `${minSeats} people already booked — the limit can't be lower.`;
  }
  return errors;
}

interface ScheduleSeatsFormProps {
  info: EventInfo; // values from step 1
  eventId?: string; // set when editing an existing event
  onSaved: (event: AppEvent) => void;
}

// Create Event — step 2 of 2 (schedule, venue and seat limit).
export default function ScheduleSeatsForm({
  info,
  eventId,
  onSaved,
}: ScheduleSeatsFormProps) {
  const { state, currentUser, dispatch } = useApp();
  const existing = eventId ? state.events.find((e) => e.id === eventId) : undefined;
  const minSeats = existing ? countActiveBookings(state.bookings, existing.id) : 0;

  const [formData, setFormData] = useState<ScheduleForm>({
    date: existing?.date ?? "",
    time: existing?.time ?? "",
    venue: existing?.venue ?? "",
    location: existing?.location ?? "AIUB Campus",
    seatLimit: existing ? String(existing.seatLimit) : "",
  });
  const [errors, setErrors] = useState<ScheduleErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saveStatus, setSaveStatus] = useState<EventStatus | null>(null);

  useEffect(() => {
    setErrors(validateSchedule(formData, minSeats));
  }, [formData, minSeats]);

  // Fake save request
  useEffect(() => {
    if (!saveStatus || !currentUser || info.category === "") return;

    const timeoutId = setTimeout(() => {
      const event: AppEvent = {
        id: existing?.id ?? "e" + Date.now(),
        title: info.title,
        category: info.category as AppEvent["category"],
        description: info.description,
        organizerId: currentUser.id,
        organizerName: info.organizerName,
        date: formData.date.trim(),
        time: formData.time.trim(),
        venue: formData.venue.trim(),
        location: formData.location,
        seatLimit: Number(formData.seatLimit),
        status: saveStatus,
      };
      dispatch({ type: existing ? "UPDATE_EVENT" : "CREATE_EVENT", payload: event });
      setSaveStatus(null);
      onSaved(event);
    }, 1000);

    return () => clearTimeout(timeoutId);
  // Runs only when the trigger changes (Submit pressed), not on every
  // keystroke — so the other values are left out on purpose.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveStatus]);

  const updateField = (field: keyof ScheduleForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const markTouched = (field: keyof ScheduleForm) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field: keyof ScheduleErrors) =>
    touched[field] || submitAttempted ? errors[field] : undefined;

  const save = (status: EventStatus) => {
    setSubmitAttempted(true);
    if (Object.keys(errors).length === 0) setSaveStatus(status);
  };

  const isSaving = saveStatus !== null;
  const isDraftOrNew = !existing || existing.status === "draft";
  const hasErrors = submitAttempted && Object.keys(errors).length > 0;
  const missingStep1 = info.title.length === 0 || info.category === "";

  return (
    <Screen scroll>
      <ScreenHeader
        title="Schedule & seats"
        backLabel="Back to event information"
      />
      <Text style={styles.step}>Step 2 of 2 · When, where and how many</Text>

      {missingStep1 ? (
        <Banner type="error" message="Event details from step 1 are missing. Go back and fill them in." />
      ) : null}
      {hasErrors ? (
        <Banner type="error" message="Please fix the highlighted fields before saving." />
      ) : null}

      <View style={styles.row}>
        <View style={styles.flex}>
          <FormField
            label="Date"
            value={formData.date}
            onChangeText={(text) => updateField("date", text)}
            onBlur={() => markTouched("date")}
            placeholder="e.g. 2026-11-12"
            keyboardType="numbers-and-punctuation"
            error={getFieldError("date")}
          />
        </View>
        <View style={styles.flex}>
          <FormField
            label="Start time"
            value={formData.time}
            onChangeText={(text) => updateField("time", text)}
            onBlur={() => markTouched("time")}
            placeholder="e.g. 10:00"
            keyboardType="numbers-and-punctuation"
            error={getFieldError("time")}
          />
        </View>
      </View>

      <FormField
        label="Venue"
        value={formData.venue}
        onChangeText={(text) => updateField("venue", text)}
        onBlur={() => markTouched("venue")}
        placeholder="e.g. AIUB · Room 4201"
        error={getFieldError("venue")}
      />

      <Text style={styles.label}>Location</Text>
      <ChipRow
        options={LOCATIONS.map((l) => ({ value: l, label: l }))}
        selected={formData.location}
        onSelect={(value) => updateField("location", value)}
      />
      <View style={styles.spacer} />

      <FormField
        label="Seat limit"
        value={formData.seatLimit}
        onChangeText={(text) => updateField("seatLimit", text)}
        onBlur={() => markTouched("seatLimit")}
        placeholder="e.g. 60"
        keyboardType="number-pad"
        hint={
          existing
            ? `${minSeats} seats are already booked.`
            : "Registration closes automatically when every seat is booked."
        }
        error={getFieldError("seatLimit")}
      />

      {isDraftOrNew ? (
        <>
          <Button
            title="Publish event"
            onPress={() => save("published")}
            loading={saveStatus === "published"}
            disabled={isSaving || missingStep1}
          />
          <Button
            title="Save as draft"
            variant="secondary"
            onPress={() => save("draft")}
            loading={saveStatus === "draft"}
            disabled={isSaving || missingStep1}
            style={styles.gap}
          />
        </>
      ) : (
        <Button
          title="Save changes"
          onPress={() => save(existing.status)}
          loading={isSaving}
          disabled={missingStep1}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { fontSize: 14, color: Colors.textMuted, marginTop: -10, marginBottom: 18 },
  row: { flexDirection: "row", gap: 12 },
  flex: { flex: 1 },
  label: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 8,
    fontWeight: "500",
  },
  spacer: { height: 14 },
  gap: { marginTop: 10 },
});
