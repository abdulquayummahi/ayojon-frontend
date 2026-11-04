import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ComponentProps, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors, FontSize, Radius, Shadow } from "../../constants/theme";
import { useApp } from "../../context/app-context";
import { AVATAR_OPTIONS } from "../../data/banners";
import { User } from "../../types/models";
import { countActiveBookings } from "../../utils/event-helpers";
import { validateName } from "../../utils/validation";
import Avatar from "../ui/avatar";
import Banner from "../ui/banner";
import Button from "../ui/button";
import Card from "../ui/card";
import ConfirmDialog from "../ui/confirm-dialog";
import FormField from "../ui/form-field";
import Screen from "../ui/screen";
import ScreenHeader from "../ui/screen-header";
import StatusBadge from "../ui/status-badge";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface ProfileForm {
  name: string;
  phone: string;
  bio: string;
  avatarUrl: string; // "" = no photo (initials)
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

function DetailRow({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

// Profile screen shared by the attendee and organizer tab groups.
export default function ProfileView() {
  const { state, currentUser, dispatch } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileForm>({
    name: "",
    phone: "",
    bio: "",
    avatarUrl: "",
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
          avatarUrl: formData.avatarUrl,
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
    setFormData({
      name: user.name,
      phone: user.phone,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
    });
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
          { label: "Events", value: myEvents.length, icon: "calendar-outline" as const },
          { label: "Registrations", value: registrations, icon: "people-outline" as const },
        ];
      })()
    : [
        {
          label: "Active tickets",
          icon: "ticket-outline" as const,
          value: state.bookings.filter(
            (b) => b.userId === currentUser.id && b.status === "booked"
          ).length,
        },
        {
          label: "Saved events",
          icon: "bookmark-outline" as const,
          value: state.saved.filter((s) => s.userId === currentUser.id).length,
        },
      ];

  // While editing, the card previews the new name and photo
  const shownName = isEditing && formData.name.trim() ? formData.name : currentUser.name;
  const shownPhoto = isEditing ? formData.avatarUrl : currentUser.avatarUrl;

  return (
    <Screen scroll>
      <ScreenHeader
        title="Profile"
        subtitle={isOrganizer ? "Organizer account" : "Attendee account"}
      />

      {successMessage ? <Banner type="success" message={successMessage} /> : null}

      <View style={styles.profileCard}>
        <View style={styles.cover} />
        <View style={styles.avatarRing}>
          <Avatar name={shownName} uri={shownPhoto} size={92} />
          {!isEditing ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
              onPress={() => startEditing(currentUser)}
              style={styles.cameraBadge}
            >
              <Ionicons name="camera" size={16} color={Colors.white} />
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.name}>{shownName}</Text>
        <Text style={styles.email}>{currentUser.email}</Text>
        <View style={styles.roleBadge}>
          <StatusBadge label={isOrganizer ? "Organizer" : "Attendee"} tone="primary" />
        </View>
        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.stat}>
              <Ionicons name={stat.icon} size={18} color={Colors.primary} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {isEditing ? (
        <Card>
          <Text style={styles.sectionTitle}>Edit profile</Text>

          <Text style={styles.fieldLabel}>Profile photo</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photoRow}
            contentContainerStyle={styles.photoRowContent}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="No photo, show initials"
              accessibilityState={{ selected: formData.avatarUrl === "" }}
              onPress={() => updateField("avatarUrl", "")}
              style={[styles.photoOption, formData.avatarUrl === "" && styles.photoSelected]}
            >
              <Avatar name={formData.name || currentUser.name} size={52} />
            </Pressable>
            {AVATAR_OPTIONS.map((uri, i) => {
              const selected = formData.avatarUrl === uri;
              return (
                <Pressable
                  key={uri}
                  accessibilityRole="button"
                  accessibilityLabel={`Photo option ${i + 1}`}
                  accessibilityState={{ selected }}
                  onPress={() => updateField("avatarUrl", uri)}
                  style={[styles.photoOption, selected && styles.photoSelected]}
                >
                  <Avatar name="?" uri={uri} size={52} />
                </Pressable>
              );
            })}
          </ScrollView>
          <Text style={styles.photoHint}>
            The first option shows your initials instead of a photo.
          </Text>

          <FormField
            label="Full name"
            icon="person-outline"
            value={formData.name}
            onChangeText={(text) => updateField("name", text)}
            onBlur={() => markTouched("name")}
            error={getFieldError("name")}
          />
          <FormField
            label="Phone (optional)"
            icon="call-outline"
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
              icon="checkmark"
              onPress={handleSave}
              loading={isSaving}
              style={styles.flex}
            />
          </View>
        </Card>
      ) : (
        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Details</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              onPress={() => startEditing(currentUser)}
              style={styles.editLink}
              hitSlop={8}
            >
              <Ionicons name="create-outline" size={16} color={Colors.primary} />
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          </View>
          <DetailRow icon="mail-outline" label="Email" value={currentUser.email} />
          <DetailRow icon="call-outline" label="Phone" value={currentUser.phone || "Not added"} />
          <DetailRow
            icon="information-circle-outline"
            label="Bio"
            value={currentUser.bio || "Not added"}
          />
        </Card>
      )}

      <Button
        title="Log out"
        icon="log-out-outline"
        variant="danger"
        onPress={() => setShowLogout(true)}
      />

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
  flex: { flex: 1 },
  row: { flexDirection: "row", gap: 10 },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    alignItems: "center",
    paddingBottom: 16,
    marginBottom: 14,
    ...Shadow.card,
  },
  cover: {
    alignSelf: "stretch",
    height: 86,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  avatarRing: {
    marginTop: -46,
    padding: 4,
    borderRadius: 52,
    backgroundColor: Colors.surface,
  },
  cameraBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: FontSize.title, fontWeight: "800", color: Colors.text, marginTop: 10 },
  email: { fontSize: FontSize.small, color: Colors.textMuted, marginTop: 2 },
  roleBadge: { marginTop: 10 },
  statsRow: { flexDirection: "row", gap: 10, alignSelf: "stretch", paddingHorizontal: 16, marginTop: 16 },
  stat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primarySoft,
  },
  statValue: { fontSize: FontSize.title, fontWeight: "800", color: Colors.text, marginTop: 4 },
  statLabel: { fontSize: FontSize.caption, color: Colors.textMuted, marginTop: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: FontSize.lead, fontWeight: "800", color: Colors.text, marginBottom: 12 },
  editLink: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  editText: { fontSize: FontSize.small, color: Colors.primary, fontWeight: "700" },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  detailLabel: { fontSize: FontSize.caption, color: Colors.textLight, fontWeight: "600" },
  detailValue: { fontSize: FontSize.body, color: Colors.text, marginTop: 1 },
  fieldLabel: { fontSize: FontSize.small, color: Colors.text, marginBottom: 8, fontWeight: "600" },
  photoRow: { flexGrow: 0 },
  photoRowContent: { gap: 10, paddingVertical: 2, paddingRight: 4 },
  photoOption: { padding: 3, borderRadius: 32, borderWidth: 2, borderColor: "transparent" },
  photoSelected: { borderColor: Colors.primary },
  photoHint: { fontSize: FontSize.caption, color: Colors.textLight, marginTop: 6, marginBottom: 16 },
});
