import { router } from "expo-router";
import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/theme";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  backLabel?: string; // shows "‹ backLabel" and goes back when pressed
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
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        {right}
      </View>
      {backLabel ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          hitSlop={8}
        >
          <Text style={styles.back}>‹ {backLabel}</Text>
        </Pressable>
      ) : subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 18 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 26, fontWeight: "800", color: Colors.text, flexShrink: 1 },
  subtitle: { fontSize: 14, color: Colors.textMuted, marginTop: 4 },
  back: { fontSize: 14, color: Colors.primary, marginTop: 6, fontWeight: "600" },
});
