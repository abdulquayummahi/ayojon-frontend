import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, FontSize, Radius, Shadow } from "../../constants/theme";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  backLabel?: string; // shows a round back button (backLabel is read by screen readers)
  right?: ReactNode;
}

export default function ScreenHeader({
  title,
  subtitle,
  backLabel,
  right,
}: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      {backLabel ? <BackButton label={backLabel} /> : null}
      <View style={styles.textBox}>
        <Text style={[styles.title, backLabel ? styles.titleSmall : null]} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

// Round "back" button, also used on top of hero images
export function BackButton({ label, light = false }: { label: string; light?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => router.back()}
      hitSlop={8}
      style={[styles.back, light && styles.backLight]}
    >
      <Ionicons name="chevron-back" size={22} color={Colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
    marginBottom: 18,
  },
  textBox: { flex: 1 },
  title: {
    fontSize: FontSize.heading,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.4,
  },
  titleSmall: { fontSize: FontSize.title },
  subtitle: { fontSize: FontSize.small, color: Colors.textMuted, marginTop: 3 },
  back: {
    width: 42,
    height: 42,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.card,
  },
  backLight: { backgroundColor: Colors.glass },
});
