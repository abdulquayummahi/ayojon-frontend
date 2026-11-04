import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";
import { CATEGORIES } from "../../data/mock-events";
import { EventCategory } from "../../types/models";
import Banner from "../ui/banner";
import Button from "../ui/button";
import Chip from "../ui/chip";
import FormField from "../ui/form-field";
import Screen from "../ui/screen";
import ScreenHeader from "../ui/screen-header";

// Values collected in step 1 and handed to step 2 as route params
export interface EventInfo {
  title: string;
  category: EventCategory | "";
  description: string;
  organizerName: string;
}

interface EventInfoErrors {
  title?: string;
  category?: string;
  description?: string;
  organizerName?: string;
}

function validateInfo(data: EventInfo): EventInfoErrors {
  const errors: EventInfoErrors = {};
  const title = data.title.trim();
  if (title.length === 0) errors.title = "Event title is required.";
  else if (title.length < 5) errors.title = "Title must be at least 5 characters.";
  if (data.category === "") errors.category = "Choose a category.";
  if (data.description.trim().length > 500) {
    errors.description = "Keep the description under 500 characters.";
  }
  if (data.organizerName.trim().length === 0) {
    errors.organizerName = "Organizer name is required.";
  }
  return errors;
}

interface EventInfoFormProps {
  heading: string;
  subtitle: string;
  initialValues: EventInfo;
  successMessage?: string;
  backLabel?: string;
  onNext: (values: EventInfo) => void;
}

// Create Event — step 1 of 2 (event information).
export default function EventInfoForm({
  heading,
  subtitle,
  initialValues,
  successMessage,
  backLabel,
  onNext,
}: EventInfoFormProps) {
  const [formData, setFormData] = useState<EventInfo>(initialValues);
  const [errors, setErrors] = useState<EventInfoErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    setErrors(validateInfo(formData));
  }, [formData]);

  const updateField = (field: keyof EventInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const markTouched = (field: keyof EventInfo) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field: keyof EventInfoErrors) =>
    touched[field] || submitAttempted ? errors[field] : undefined;

  const handleNext = () => {
    setSubmitAttempted(true);
    if (Object.keys(errors).length === 0) {
      onNext({
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        organizerName: formData.organizerName.trim(),
      });
    }
  };

  return (
    <Screen scroll>
      <ScreenHeader
        title={heading}
        subtitle={backLabel ? undefined : subtitle}
        backLabel={backLabel}
      />
      {backLabel ? <Text style={styles.step}>{subtitle}</Text> : null}

      {successMessage ? <Banner type="success" message={successMessage} /> : null}

      <FormField
        label="Event title"
        value={formData.title}
        onChangeText={(text) => updateField("title", text)}
        onBlur={() => markTouched("title")}
        placeholder="e.g. Design Thinking Workshop"
        error={getFieldError("title")}
      />

      <Text style={styles.label}>Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chips}
      >
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={c}
            selected={formData.category === c}
            onPress={() => updateField("category", c)}
          />
        ))}
      </ScrollView>
      {getFieldError("category") ? (
        <Text style={styles.error}>{getFieldError("category")}</Text>
      ) : null}
      <View style={styles.spacer} />

      <FormField
        label="Description (optional)"
        value={formData.description}
        onChangeText={(text) => updateField("description", text)}
        onBlur={() => markTouched("description")}
        placeholder="What will attendees do or learn?"
        multiline
        hint={`${formData.description.trim().length}/500`}
        error={getFieldError("description")}
      />

      <FormField
        label="Organizer"
        value={formData.organizerName}
        onChangeText={(text) => updateField("organizerName", text)}
        onBlur={() => markTouched("organizerName")}
        placeholder="Club or group name"
        error={getFieldError("organizerName")}
      />

      <Button title="Next: Schedule & seats" onPress={handleNext} style={styles.next} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { fontSize: 14, color: Colors.textMuted, marginTop: -10, marginBottom: 18 },
  label: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 8,
    fontWeight: "500",
  },
  error: { color: Colors.danger, fontSize: 12, marginTop: 6 },
  chips: { flexGrow: 0 },
  spacer: { height: 14 },
  next: { marginTop: 12 },
});
