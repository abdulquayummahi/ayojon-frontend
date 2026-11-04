import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors, FontSize } from "../../constants/theme";
import { CATEGORIES } from "../../data/mock-events";
import { EventCategory } from "../../types/models";
import { CATEGORY_ICONS } from "../../utils/event-helpers";
import { validateBanner } from "../../utils/validation";
import Banner from "../ui/banner";
import Button from "../ui/button";
import Chip from "../ui/chip";
import FormField from "../ui/form-field";
import Screen from "../ui/screen";
import ScreenHeader from "../ui/screen-header";
import BannerPicker from "./banner-picker";
import StepProgress from "./step-progress";

// Values collected in step 1 and handed to step 2 as route params
export interface EventInfo {
  title: string;
  category: EventCategory | "";
  banner: string; // preset id or image link — required
  description: string;
  organizerName: string;
}

interface EventInfoErrors {
  title?: string;
  category?: string;
  banner?: string;
  description?: string;
  organizerName?: string;
}

function validateInfo(data: EventInfo): EventInfoErrors {
  const errors: EventInfoErrors = {};
  const title = data.title.trim();
  if (title.length === 0) errors.title = "Event title is required.";
  else if (title.length < 5) errors.title = "Title must be at least 5 characters.";
  if (data.category === "") errors.category = "Choose a category.";
  const bannerError = validateBanner(data.banner);
  if (bannerError) errors.banner = bannerError;
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

// Create Event — step 1 of 2 (banner and event information).
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
        banner: formData.banner.trim(),
        description: formData.description.trim(),
        organizerName: formData.organizerName.trim(),
      });
    }
  };

  const hasErrors = submitAttempted && Object.keys(errors).length > 0;

  return (
    <Screen
      scroll
      footer={
        <Button
          title="Next: Schedule & seats"
          icon="arrow-forward"
          onPress={handleNext}
        />
      }
    >
      <ScreenHeader title={heading} backLabel={backLabel} />
      <StepProgress step={1} total={2} label={subtitle} />

      {successMessage ? <Banner type="success" message={successMessage} /> : null}
      {hasErrors ? (
        <Banner type="error" message="Please fix the highlighted fields to continue." />
      ) : null}

      <FormField
        label="Event title"
        icon="create-outline"
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
        keyboardShouldPersistTaps="handled"
      >
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={c}
            icon={CATEGORY_ICONS[c]}
            selected={formData.category === c}
            onPress={() => updateField("category", c)}
          />
        ))}
      </ScrollView>
      {getFieldError("category") ? (
        <Text style={styles.error}>{getFieldError("category")}</Text>
      ) : null}
      <View style={styles.spacer} />

      <BannerPicker
        value={formData.banner}
        category={formData.category}
        onChange={(banner) => {
          updateField("banner", banner);
          markTouched("banner");
        }}
        error={getFieldError("banner")}
      />

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
        icon="people-outline"
        value={formData.organizerName}
        onChangeText={(text) => updateField("organizerName", text)}
        onBlur={() => markTouched("organizerName")}
        placeholder="Club or group name"
        error={getFieldError("organizerName")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: FontSize.small, color: Colors.text, marginBottom: 8, fontWeight: "600" },
  chips: { flexGrow: 0 },
  error: { fontSize: FontSize.caption, color: Colors.danger, marginTop: 6 },
  spacer: { height: 18 },
});
