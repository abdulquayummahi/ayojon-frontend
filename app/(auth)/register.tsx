import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Banner from "../../components/ui/banner";
import Button from "../../components/ui/button";
import FormField from "../../components/ui/form-field";
import Screen from "../../components/ui/screen";
import ScreenHeader from "../../components/ui/screen-header";
import { Colors, Radius } from "../../constants/theme";
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

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "attendee", label: "Attend events" },
  { value: "organizer", label: "Organize events" },
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
      };

      setIsSubmitting(false);
      setSubmitTrigger(false);
      dispatch({ type: "REGISTER", payload: newUser });
      router.replace(role === "organizer" ? "/events" : "/explore");
    }, 1200);

    return () => clearTimeout(timeoutId);
  // Runs only when the trigger changes (Submit pressed), not on every
  // keystroke — so the other values are left out on purpose.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitTrigger]);

  return (
    <Screen scroll>
      <ScreenHeader
        title="Create account"
        subtitle="Join events or organize your own."
      />

      {submitAttempted && !isFormValid ? (
        <Banner type="error" message="Please fix the highlighted fields." />
      ) : null}

      <FormField
        label="Full name"
        value={formData.name}
        onChangeText={(text) => updateField("name", text)}
        onBlur={() => markTouched("name")}
        placeholder="Your name"
        error={getFieldError("name")}
      />

      <FormField
        label="Email"
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
        value={formData.password}
        onChangeText={(text) => updateField("password", text)}
        onBlur={() => markTouched("password")}
        placeholder="At least 8 characters"
        secureTextEntry
        autoCapitalize="none"
        error={getFieldError("password")}
      />

      <Text style={styles.label}>I want to</Text>
      <View style={styles.roleRow}>
        {ROLE_OPTIONS.map((option) => {
          const selected = option.value === role;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setRole(option.value)}
              style={[styles.roleOption, selected && styles.roleSelected]}
            >
              <Text style={[styles.roleText, selected && styles.roleTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Button
        title="Create account"
        onPress={handleSubmitPress}
        loading={isSubmitting}
        style={styles.submit}
      />

      <Pressable
        onPress={() =>
          router.canGoBack() ? router.back() : router.replace("/login")
        }
        style={styles.linkWrap}
      >
        <Text style={styles.link}>Already registered? Log in</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 8,
    marginTop: 4,
    fontWeight: "500",
  },
  roleRow: { flexDirection: "row", gap: 10 },
  roleOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
  },
  roleSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  roleText: { fontSize: 14, color: Colors.text },
  roleTextSelected: { color: Colors.primary, fontWeight: "700" },
  submit: { marginTop: 28 },
  linkWrap: { alignItems: "center", marginTop: 20 },
  link: { color: Colors.primary, fontSize: 14, fontWeight: "600" },
});
