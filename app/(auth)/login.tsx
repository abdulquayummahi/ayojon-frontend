import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Banner from "../../components/ui/banner";
import Button from "../../components/ui/button";
import FormField from "../../components/ui/form-field";
import Screen from "../../components/ui/screen";
import { Colors, Radius } from "../../constants/theme";
import { useApp } from "../../context/app-context";
import { validateEmail, validatePassword } from "../../utils/validation";

interface LoginForm {
  email: string;
  password: string;
}

interface LoginErrors {
  email?: string;
  password?: string;
}

const INITIAL_FORM: LoginForm = { email: "", password: "" };

function validateForm(data: LoginForm): LoginErrors {
  const errors: LoginErrors = {};
  const emailError = validateEmail(data.email);
  const passwordError = validatePassword(data.password);
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  return errors;
}

// Demo accounts so the faculty can try both roles quickly
const DEMO_ACCOUNTS = [
  { label: "Attendee demo", email: "student@university.edu" },
  { label: "Organizer demo", email: "organizer@university.edu" },
];

export default function LoginScreen() {
  const { state, dispatch } = useApp();

  const [formData, setFormData] = useState<LoginForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitTrigger, setSubmitTrigger] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  const isFormValid = Object.keys(errors).length === 0;

  const updateField = (field: keyof LoginForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setLoginError("");
  };

  const markTouched = (field: keyof LoginForm) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Errors appear only after a field is touched or Submit is pressed
  const getFieldError = (field: keyof LoginErrors) =>
    touched[field] || submitAttempted ? errors[field] : undefined;

  const fillDemo = (email: string) => {
    setFormData({ email, password: "password123" });
    setLoginError("");
  };

  const handleSubmitPress = () => {
    setSubmitAttempted(true);
    if (isFormValid) {
      setIsSubmitting(true);
      setSubmitTrigger(true);
    }
  };

  // Live validation
  useEffect(() => {
    setErrors(validateForm(formData));
  }, [formData]);

  // Fake network request, cancelled if the screen unmounts
  useEffect(() => {
    if (!submitTrigger) return;

    const timeoutId = setTimeout(() => {
      const email = formData.email.trim().toLowerCase();
      const user = state.users.find(
        (u) => u.email.toLowerCase() === email && u.password === formData.password
      );

      setIsSubmitting(false);
      setSubmitTrigger(false);

      if (!user) {
        setLoginError("Incorrect email or password. Please try again.");
        return;
      }

      dispatch({ type: "LOGIN", payload: user.id });
      // The role decides which tab bar opens
      router.replace(user.role === "organizer" ? "/events" : "/explore");
    }, 1000);

    return () => clearTimeout(timeoutId);
  // Runs only when submitTrigger changes (Log in pressed). formData and
  // state are read inside but left out on purpose, so typing doesn't restart
  // the timer.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitTrigger]);

  return (
    <Screen scroll>
      <View style={styles.brand}>
        <Text style={styles.logo}>ayojon</Text>
        <Text style={styles.tagline}>Your campus. Your next event.</Text>
      </View>

      <Text style={styles.heading}>Welcome back</Text>

      {loginError ? <Banner type="error" message={loginError} /> : null}

      <FormField
        label="Email"
        value={formData.email}
        onChangeText={(text) => updateField("email", text)}
        onBlur={() => markTouched("email")}
        placeholder="you@university.edu"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
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

      <Button
        title="Log in"
        onPress={handleSubmitPress}
        loading={isSubmitting}
        style={styles.submit}
      />

      <Link href="/register" asChild>
        <Pressable accessibilityRole="link" style={styles.linkWrap}>
          <Text style={styles.link}>New to Ayojon? Create an account</Text>
        </Pressable>
      </Link>

      <View style={styles.demoBox}>
        <Text style={styles.demoTitle}>Demo accounts (password123)</Text>
        <View style={styles.demoRow}>
          {DEMO_ACCOUNTS.map((demo) => (
            <Pressable
              key={demo.email}
              accessibilityRole="button"
              onPress={() => fillDemo(demo.email)}
              style={styles.demoChip}
            >
              <Text style={styles.demoText}>{demo.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { marginTop: 36, marginBottom: 40 },
  logo: { fontSize: 38, fontWeight: "800", color: Colors.primary },
  tagline: { fontSize: 15, color: Colors.textMuted, marginTop: 4 },
  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 16,
  },
  submit: { marginTop: 10 },
  linkWrap: { alignItems: "center", marginTop: 20 },
  link: { color: Colors.primary, fontSize: 14, fontWeight: "600" },
  demoBox: {
    marginTop: 32,
    padding: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
  },
  demoTitle: { fontSize: 13, fontWeight: "700", color: Colors.primary },
  demoRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  demoChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
  },
  demoText: { fontSize: 13, color: Colors.primary, fontWeight: "600" },
});
