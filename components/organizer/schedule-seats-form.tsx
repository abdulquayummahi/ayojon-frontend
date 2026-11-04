import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, Radius, Shadow } from "../../constants/theme";
import { useApp } from "../../context/app-context";
import { LOCATIONS } from "../../data/mock-events";
import { AppEvent, EventLocation, EventStatus } from "../../types/models";
import { CATEGORY_ICONS, countActiveBookings, isPastDate } from "../../utils/event-helpers";
import { validateDate, validateTime } from "../../utils/validation";
import Banner from "../ui/banner";
import BannerImage from "../ui/banner-image";
import Button from "../ui/button";
import ChipRow from "../ui/chip-row";
import FormField from "../ui/form-field";
import Screen from "../ui/screen";
import ScreenHeader from "../ui/screen-header";
import { EventInfo } from "./event-info-form";
import StepProgress from "./step-progress";

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

function validateSchedule(
  data: ScheduleForm,
  minSeats: number,
  originalDate?: string
): ScheduleErrors {
  const errors: ScheduleErrors = {};
  let dateError = validateDate(data.date);
  // New events can't be in the past. An existing event may keep the date it
  // already has, so an old event can still be edited.
  const date = data.date.trim();
  if (!dateError && date !== originalDate && isPastDate(date)) {
    dateError = "The date can't be in the past.";
  }
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

  const originalDate = existing?.date;

  useEffect(() => {
    setErrors(validateSchedule(formData, minSeats, originalDate));
  }, [formData, minSeats, originalDate]);

  // Fake save request
  useEffect(() => {
    if (!saveStatus || !currentUser || info.category === "") return;

    const timeoutId = setTimeout(() => {
      const event: AppEvent = {
        id: existing?.id ?? "e" + Date.now(),
        title: info.title,
        category: info.category as AppEvent["category"],
        banner: info.banner,
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
  // Runs only when saveStatus changes (Publish / Save pressed). formData, info
  // and existing are read inside but left out on purpose, so typing doesn't
  // restart the timer.
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
  const missingStep1 =
    info.title.length === 0 || info.category === "" || info.banner.length === 0;

  const footer = isDraftOrNew ? (
    <View style={styles.footerRow}>
      <Button
        title="Save draft"
        variant="secondary"
        icon="document-outline"
        onPress={() => save("draft")}
        loading={saveStatus === "draft"}
        disabled={isSaving || missingStep1}
        style={styles.flex}
      />
      <Button
        title="Publish"
        icon="rocket-outline"
        onPress={() => save("published")}
        loading={saveStatus === "published"}
        disabled={isSaving || missingStep1}
        style={styles.flex}
      />
    </View>
  ) : (
    <Button
      title="Save changes"
      icon="checkmark"
      onPress={() => save(existing.status)}
      loading={isSaving}
      disabled={missingStep1}
    />
  );

  return (
    <Screen scroll footer={footer}>
      <ScreenHeader title="Schedule & seats" backLabel="Back to event information" />
      <StepProgress step={2} total={2} label="When, where and how many" />

      {/* What was filled in on step 1 */}
      {!missingStep1 ? (
        <View style={styles.summary}>
          <BannerImage banner={info.banner} style={styles.summaryImage} />
          <View style={styles.summaryText}>
            <View style={styles.summaryCategory}>
              <Ionicons
                name={CATEGORY_ICONS[info.category as AppEvent["category"]]}
                size={13}
                color={Colors.primary}
              />
              <Text style={styles.summaryCategoryText}>{info.category}</Text>
            </View>
            <Text style={styles.summaryTitle} numberOfLines={2}>
              {info.title}
            </Text>
            <Text style={styles.summaryOrganizer} numberOfLines={1}>
              by {info.organizerName}
            </Text>
          </View>
        </View>
      ) : (
        <Banner type="error" message="Event details from step 1 are missing. Go back and fill them in." />
      )}
      {hasErrors ? (
        <Banner type="error" message="Please fix the highlighted fields before saving." />
      ) : null}

      <View style={styles.row}>
        <View style={styles.flex}>
          <FormField
            label="Date"
            icon="calendar-outline"
            value={formData.date}
            onChangeText={(text) => updateField("date", text)}
            onBlur={() => markTouched("date")}
            placeholder="2026-11-12"
            keyboardType="numbers-and-punctuation"
            error={getFieldError("date")}
          />
        </View>
        <View style={styles.flex}>
          <FormField
            label="Start time"
            icon="time-outline"
            value={formData.time}
            onChangeText={(text) => updateField("time", text)}
            onBlur={() => markTouched("time")}
            placeholder="10:00"
            keyboardType="numbers-and-punctuation"
            error={getFieldError("time")}
          />
        </View>
      </View>

      <FormField
        label="Venue"
        icon="business-outline"
        value={formData.venue}
        onChangeText={(text) => updateField("venue", text)}
        onBlur={() => markTouched("venue")}
        placeholder="e.g. AIUB · Room 4201"
        error={getFieldError("venue")}
      />

      <Text style={styles.label}>Location</Text>
      <ChipRow
        options={LOCATIONS.map((l) => ({
          value: l,
          label: l,
          icon: l === "Online" ? ("globe-outline" as const) : ("location-outline" as const),
        }))}
        selected={formData.location}
        onSelect={(value) => updateField("location", value)}
      />

      <FormField
        label="Seat limit"
        icon="people-outline"
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  flex: { flex: 1 },
  footerRow: { flexDirection: "row", gap: 10 },
  label: { fontSize: FontSize.small, color: Colors.text, marginBottom: 8, fontWeight: "600" },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    marginBottom: 18,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    ...Shadow.card,
  },
  summaryImage: { width: 92, height: 72, borderRadius: Radius.md },
  summaryText: { flex: 1 },
  summaryCategory: { flexDirection: "row", alignItems: "center", gap: 4 },
  summaryCategoryText: { fontSize: FontSize.caption, fontWeight: "800", color: Colors.primary },
  summaryTitle: { fontSize: FontSize.body, fontWeight: "800", color: Colors.text, marginTop: 3 },
  summaryOrganizer: { fontSize: FontSize.caption, color: Colors.textMuted, marginTop: 2 },
});
