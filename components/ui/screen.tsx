import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean; // wrap content in a ScrollView (forms, details)
  footer?: ReactNode; // stays pinned at the bottom (main action buttons)
  fullBleed?: boolean; // no padding and no top safe area (hero images)
  safeBottom?: boolean; // screens without a tab bar keep the footer above the phone's home bar
}

// Common screen wrapper: safe area, background colour, padding,
// keyboard handling for forms and an optional pinned footer.
export default function Screen({
  children,
  scroll = false,
  footer,
  fullBleed = false,
  safeBottom = false,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const contentStyle = fullBleed ? styles.bleed : styles.content;

  return (
    <SafeAreaView style={styles.safe} edges={fullBleed ? [] : ["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[contentStyle, footer ? styles.roomForFooter : null]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, contentStyle]}>{children}</View>
        )}
        {footer ? (
          <View style={[styles.footer, safeBottom && { paddingBottom: 14 + insets.bottom }]}>
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  bleed: { paddingBottom: 24 },
  roomForFooter: { paddingBottom: 12 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
