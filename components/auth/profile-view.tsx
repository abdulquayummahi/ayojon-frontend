import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";
import { useApp } from "../../context/app-context";
import { User } from "../../types/models";
import { countActiveBookings } from "../../utils/event-helpers";
import { validateName } from "../../utils/validation";
import Banner from "../ui/banner";
import Button from "../ui/button";
import Card from "../ui/card";
import ConfirmDialog from "../ui/confirm-dialog";
import FormField from "../ui/form-field";
import Screen from "../ui/screen";
import ScreenHeader from "../ui/screen-header";
import StatusBadge from "../ui/status-badge";

interface ProfileForm {
  name: string;
  phone: string;
  bio: string;
}

interface ProfileErrors {
  name?: string;
  phone?: string;
  bio?: string;
}

function validateForm(data: ProfileForm): ProfileErrors {
  const errors: ProfileErrors = {};
  const nameError = validateName(data.name);
  if (nameError) errors.name = nameError;
  const phone = data.phone.trim();
  if (phone.length > 0 && !/^01\d{3}-?\d{6}$/.test(phone)) {
    errors.phone = "Use a Bangladeshi mobile number, e.g. 01711-000111.";
  }
  if (data.bio.trim().length > 160) {
    errors.bio = "Bio must be 160 characters or fewer.";
  }
  return errors;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

// Profile screen shared by the attendee and organizer tab groups.
export default function ProfileView() {
  const { state, currentUser, dispatch } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileForm>({
    name: "",
    phone: "",
    bio: "",
  });
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [saveTrigger, setSaveTrigger] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    setErrors(validateForm(formData));
  }, [formData]);

  // Fake save request
  useEffect(() => {
    if (!saveTrigger || !currentUser) return;

    const timeoutId = setTimeout(() => {
      dispatch({
        type: "UPDATE_PROFILE",
        payload: {
          userId: currentUser.id,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          bio: formData.bio.trim(),
        },
      });
      setIsSaving(false);
      setSaveTrigger(false);
      setIsEditing(false);
      setSuccessMessage("Profile updated.");
    }, 900);

    return () => clearTimeout(timeoutId);
  // Runs only when saveTrigger changes (Save changes pressed). formData and
  // currentUser are read inside but left out on purpose, so typing doesn't
  // restart the timer.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveTrigger]);

  // Hide the success message after a few seconds
  useEffect(() => {
    if (!successMessage) return;
    const timeoutId = setTimeout(() => setSuccessMessage(""), 3000);
    return () => clearTimeout(timeoutId);
  }, [successMessage]);

  if (!currentUser) return null;

  const startEditing = (user: User) => {
    setFormData({ name: user.name, phone: user.phone, bio: user.bio });
    setTouched({});
    setSubmitAttempted(false);
    setSuccessMessage("");
    setIsEditing(true);
  };

  const updateField = (field: keyof ProfileForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const markTouched = (field: keyof ProfileForm) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Errors appear only after a field is touched or Save is pressed
  const getFieldError = (field: keyof ProfileErrors) =>
    touched[field] || submitAttempted ? errors[field] : undefined;

  const handleSave = () => {
    setSubmitAttempted(true);
    if (Object.keys(errors).length === 0) {
      setIsSaving(true);
      setSaveTrigger(true);
    }
  };

  const handleLogout = () => {
    setShowLogout(false);
    dispatch({ type: "LOGOUT" });
    router.replace("/login");
  };

  const isOrganizer = currentUser.role === "organizer";

  // Small summary numbers for the profile card
  const stats = isOrganizer
    ? (() => {
        const myEvents = state.events.filter(
          (e) => e.organizerId === currentUser.id
        );
        const registrations = myEvents.reduce(
          (sum, e) => sum + countActiveBookings(state.bookings, e.id),
          0
        );
        return [
          { label: "Events", value: myEvents.length },
          { label: "Registrations", value: registrations },
        ];
      })()
    : [
        {
          label: "Active tickets",
          value: state.bookings.filter(
            (b) => b.userId === currentUser.id && b.status === "booked"
          ).length,
        },
        {
          label: "Saved events",
          value: state.saved.filter((s) => s.userId === currentUser.id).length,
        },
      ];

  return (
    <Screen scroll>
      <ScreenHeader
        title="Profile"
        subtitle={isOrganizer ? "Organizer account" : "Attendee account"}
      />

      {successMessage ? <Banner type="success" message={successMessage} /> : null}

      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(currentUser.name)}</Text>
        </View>
        <Text style={styles.name}>{currentUser.name}</Text>
        <Text style={styles.email}>{currentUser.email}</Text>
        <StatusBadge
          label={isOrganizer ? "Organizer" : "Attendee"}
          tone="primary"
        />
        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.stat}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </Card>

      {isEditing ? (
        <Card>
          <Text style={styles.sectionTitle}>Edit profile</Text>
          <FormField
            label="Full name"
            value={formData.name}
            onChangeText={(text) => updateField("name", text)}
            onBlur={() => markTouched("name")}
            error={getFieldError("name")}
          />
          <FormField
            label="Phone (optional)"
            value={formData.phone}
            onChangeText={(text) => updateField("phone", text)}
            onBlur={() => markTouched("phone")}
            keyboardType="phone-pad"
            placeholder="01711-000111"
            error={getFieldError("phone")}
          />
          <FormField
            label="Bio (optional)"
            value={formData.bio}
            onChangeText={(text) => updateField("bio", text)}
            onBlur={() => markTouched("bio")}
            multiline
            placeholder="A short line about you"
            hint={`${formData.bio.trim().length}/160`}
            error={getFieldError("bio")}
          />
          <View style={styles.row}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => setIsEditing(false)}
              disabled={isSaving}
              style={styles.flex}
            />
            <Button
              title="Save changes"
              onPress={handleSave}
              loading={isSaving}
              style={styles.flex}
            />
          </View>
        </Card>
      ) : (
        <Card>
          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.fieldLabel}>Phone</Text>
          <Text style={styles.fieldValue}>{currentUser.phone || "Not added"}</Text>
          <Text style={styles.fieldLabel}>Bio</Text>
          <Text style={styles.fieldValue}>{currentUser.bio || "Not added"}</Text>
          <Button
            title="Edit profile"
            variant="secondary"
            onPress={() => startEditing(currentUser)}
            style={styles.editButton}
          />
        </Card>
      )}

      <Button title="Log out" variant="danger" onPress={() => setShowLogout(true)} />

      <ConfirmDialog
        visible={showLogout}
        title="Log out?"
        message="You will need to log in again to see your tickets and events."
        confirmLabel="Log out"
        destructive
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: { alignItems: "center", paddingVertical: 24 },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { color: Colors.white, fontSize: 26, fontWeight: "800" },
  name: { fontSize: 20, fontWeight: "800", color: Colors.text },
  email: { fontSize: 14, color: Colors.textMuted, marginTop: 2, marginBottom: 10 },
  statsRow: { flexDirection: "row", marginTop: 18, gap: 32 },
  stat: { alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800", color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 12,
  },
  fieldLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 6 },
  fieldValue: { fontSize: 15, color: Colors.text, marginTop: 2 },
  editButton: { marginTop: 16 },
  row: { flexDirection: "row", gap: 10 },
  flex: { flex: 1 },
});
