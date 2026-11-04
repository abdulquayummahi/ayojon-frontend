import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Banner from "../../components/ui/banner";
import BannerImage from "../../components/ui/banner-image";
import Button from "../../components/ui/button";
import FormField from "../../components/ui/form-field";
import Screen from "../../components/ui/screen";
import { Colors, FontSize, Radius, Shadow } from "../../constants/theme";
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
  { label: "Attendee demo", email: "student@university.edu", icon: "school-outline" as const },
  { label: "Organizer demo", email: "organizer@university.edu", icon: "briefcase-outline" as const },
];

// Decorative strip of event banners on the welcome header
const HERO_BANNERS = ["concert-lights", "workshop-ideas", "sports-football"];

export default function LoginScreen() {
  const { state, dispatch } = useApp();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<LoginForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitTrigger, setSubmitTrigger] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    <Screen scroll fullBleed>
      <View style={[styles.hero, { paddingTop: insets.top + 28 }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoMark}>
            <Ionicons name="calendar" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.logo}>ayojon</Text>
        </View>
        <Text style={styles.tagline}>Your campus. Your next event.</Text>
        <View style={styles.heroStrip}>
          {HERO_BANNERS.map((banner, i) => (
            <BannerImage
              key={banner}
              banner={banner}
              style={[styles.heroImage, i === 1 && styles.heroImageMiddle]}
            />
          ))}
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.subheading}>Log in to book seats or manage your events.</Text>

        {loginError ? <Banner type="error" message={loginError} /> : null}

        <FormField
          label="Email"
          icon="mail-outline"
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
          icon="lock-closed-outline"
          value={formData.password}
          onChangeText={(text) => updateField("password", text)}
          onBlur={() => markTouched("password")}
          placeholder="At least 8 characters"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          error={getFieldError("password")}
          right={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={8}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={Colors.textLight}
              />
            </Pressable>
          }
        />

        <Button
          title="Log in"
          icon="log-in-outline"
          onPress={handleSubmitPress}
          loading={isSubmitting}
          style={styles.submit}
        />

        <Link href="/register" asChild>
          <Pressable accessibilityRole="link" style={styles.linkWrap}>
            <Text style={styles.linkMuted}>
              New to Ayojon? <Text style={styles.link}>Create an account</Text>
            </Text>
          </Pressable>
        </Link>

        <View style={styles.demoBox}>
          <View style={styles.demoHeader}>
            <Ionicons name="flash-outline" size={16} color={Colors.primary} />
            <Text style={styles.demoTitle}>Try a demo account</Text>
            <Text style={styles.demoPassword}>password123</Text>
          </View>
          <View style={styles.demoRow}>
            {DEMO_ACCOUNTS.map((demo) => (
              <Pressable
                key={demo.email}
                accessibilityRole="button"
                accessibilityLabel={`Fill in the ${demo.label} account`}
                onPress={() => fillDemo(demo.email)}
                style={({ pressed }) => [styles.demoChip, pressed && styles.pressed]}
              >
                <Ionicons name={demo.icon} size={18} color={Colors.primary} />
                <Text style={styles.demoText}>{demo.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingBottom: 26,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { fontSize: FontSize.display, fontWeight: "800", color: Colors.white, letterSpacing: -0.8 },
  tagline: { fontSize: FontSize.body, color: "#DCD3FF", marginTop: 8 },
  heroStrip: { flexDirection: "row", gap: 10, marginTop: 22 },
  heroImage: { flex: 1, height: 86, borderRadius: Radius.lg, opacity: 0.95 },
  heroImageMiddle: { marginTop: -10, height: 96 },
  form: { paddingHorizontal: 20, paddingTop: 26 },
  heading: { fontSize: FontSize.heading, fontWeight: "800", color: Colors.text, letterSpacing: -0.4 },
  subheading: { fontSize: FontSize.small, color: Colors.textMuted, marginTop: 4, marginBottom: 20 },
  submit: { marginTop: 6 },
  linkWrap: { alignItems: "center", marginTop: 18 },
  linkMuted: { color: Colors.textMuted, fontSize: FontSize.small },
  link: { color: Colors.primary, fontWeight: "700" },
  demoBox: {
    marginTop: 26,
    padding: 14,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    ...Shadow.card,
  },
  demoHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  demoTitle: { flex: 1, fontSize: FontSize.small, fontWeight: "800", color: Colors.text },
  demoPassword: {
    fontSize: FontSize.caption,
    color: Colors.primary,
    fontWeight: "700",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    overflow: "hidden",
  },
  demoRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  demoChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  pressed: { opacity: 0.8 },
  demoText: { fontSize: FontSize.small, color: Colors.primary, fontWeight: "700" },
});
