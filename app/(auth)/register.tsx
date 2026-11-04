import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Banner from "../../components/ui/banner";
import Button from "../../components/ui/button";
import FormField from "../../components/ui/form-field";
import Screen from "../../components/ui/screen";
import ScreenHeader from "../../components/ui/screen-header";
import { Colors, FontSize, Radius, Shadow } from "../../constants/theme";
import { useApp } from "../../context/app-context";
import { Role, User } from "../../types/models";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "../../utils/validation";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
}

const INITIAL_FORM: RegisterForm = { name: "", email: "", password: "" };

function validateForm(data: RegisterForm, users: User[]): RegisterErrors {
  const errors: RegisterErrors = {};
  const nameError = validateName(data.name);
  const passwordError = validatePassword(data.password);
  let emailError = validateEmail(data.email);

  const email = data.email.trim().toLowerCase();
  if (!emailError && users.some((u) => u.email.toLowerCase() === email)) {
    emailError = "An account with this email already exists.";
  }

  if (nameError) errors.name = nameError;
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  return errors;
}

const ROLE_OPTIONS = [
  {
    value: "attendee" as Role,
    label: "Attend events",
    description: "Discover events, save them and book seats.",
    icon: "ticket-outline" as const,
  },
  {
    value: "organizer" as Role,
    label: "Organize events",
    description: "Create events, manage seats and check people in.",
    icon: "megaphone-outline" as const,
  },
];

export default function RegisterScreen() {
  const { state, dispatch } = useApp();

  const [formData, setFormData] = useState<RegisterForm>(INITIAL_FORM);
  const [role, setRole] = useState<Role>("attendee");
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitTrigger, setSubmitTrigger] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = Object.keys(errors).length === 0;

  const updateField = (field: keyof RegisterForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const markTouched = (field: keyof RegisterForm) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field: keyof RegisterErrors) =>
    touched[field] || submitAttempted ? errors[field] : undefined;

  const handleSubmitPress = () => {
    setSubmitAttempted(true);
    if (isFormValid) {
      setIsSubmitting(true);
      setSubmitTrigger(true);
    }
  };

  useEffect(() => {
    setErrors(validateForm(formData, state.users));
  }, [formData, state.users]);

  useEffect(() => {
    if (!submitTrigger) return;

    const timeoutId = setTimeout(() => {
      const newUser: User = {
        id: "u" + Date.now(),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role,
        phone: "",
        bio: "",
        avatarUrl: "", // a photo can be added later from the Profile screen
      };

      setIsSubmitting(false);
      setSubmitTrigger(false);
      dispatch({ type: "REGISTER", payload: newUser });
      router.replace(role === "organizer" ? "/events" : "/explore");
    }, 1200);

    return () => clearTimeout(timeoutId);
  // Runs only when submitTrigger changes (Create account pressed). formData
  // and role are read inside but left out on purpose, so typing doesn't
  // restart the timer.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitTrigger]);

  return (
    <Screen
      scroll
      safeBottom
      footer={
        <Button
          title="Create account"
          icon="person-add-outline"
          onPress={handleSubmitPress}
          loading={isSubmitting}
        />
      }
    >
      <ScreenHeader
        title="Create account"
        subtitle="Join events or organize your own."
        backLabel="Back to log in"
      />

      {submitAttempted && !isFormValid ? (
        <Banner type="error" message="Please fix the highlighted fields." />
      ) : null}

      <Text style={styles.label}>I want to</Text>
      <View style={styles.roleRow}>
        {ROLE_OPTIONS.map((option) => {
          const selected = option.value === role;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ selected }}
              onPress={() => setRole(option.value)}
              style={[styles.roleCard, selected && styles.roleSelected]}
            >
              <View style={[styles.roleIcon, selected && styles.roleIconSelected]}>
                <Ionicons
                  name={option.icon}
                  size={22}
                  color={selected ? Colors.white : Colors.primary}
                />
              </View>
              <Text style={styles.roleTitle}>{option.label}</Text>
              <Text style={styles.roleText}>{option.description}</Text>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <FormField
        label="Full name"
        icon="person-outline"
        value={formData.name}
        onChangeText={(text) => updateField("name", text)}
        onBlur={() => markTouched("name")}
        placeholder="Your name"
        error={getFieldError("name")}
      />

      <FormField
        label="Email"
        icon="mail-outline"
        value={formData.email}
        onChangeText={(text) => updateField("email", text)}
        onBlur={() => markTouched("email")}
        placeholder="you@university.edu"
        keyboardType="email-address"
        autoCapitalize="none"
        error={getFieldError("email")}
      />

      <FormField
        label="Password"
        icon="lock-closed-outline"
        value={formData.password}
        onChangeText={(text) => updateField("password", text)}
        onBlur={() => markTouched("password")}
        placeholder="At least 8 characters"
        secureTextEntry
        autoCapitalize="none"
        error={getFieldError("password")}
      />

      <Pressable
        accessibilityRole="link"
        onPress={() =>
          router.canGoBack() ? router.back() : router.replace("/login")
        }
        style={styles.linkWrap}
      >
        <Text style={styles.linkMuted}>
          Already registered? <Text style={styles.link}>Log in</Text>
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: FontSize.small, color: Colors.text, marginBottom: 10, fontWeight: "600" },
  roleRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  roleCard: {
    flex: 1,
    padding: 14,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  roleSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
    ...Shadow.card,
  },
  roleIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  roleIconSelected: { backgroundColor: Colors.primary },
  roleTitle: { fontSize: FontSize.body, fontWeight: "800", color: Colors.text },
  roleText: { fontSize: FontSize.caption, color: Colors.textMuted, marginTop: 4, lineHeight: 17 },
  radio: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  linkWrap: { alignItems: "center", marginTop: 8 },
  linkMuted: { color: Colors.textMuted, fontSize: FontSize.small },
  link: { color: Colors.primary, fontWeight: "700" },
});
