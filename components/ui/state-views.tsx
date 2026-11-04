import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Colors, FontSize } from "../../constants/theme";
import Button from "./button";

type IconName = ComponentProps<typeof Ionicons>["name"];

// ---------- Loading ----------
export function LoadingState({ message = "Loading…" }: { message?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

// ---------- Empty ----------
interface EmptyStateProps {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.center}>
      <View style={styles.iconCircle}>
        <View style={styles.iconInner}>
          <Ionicons name={icon} size={30} color={Colors.primary} />
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="secondary"
          size="sm"
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

// ---------- Error ----------
interface ErrorStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  actionLabel,
  onAction,
}: ErrorStateProps) {
  return (
    <View style={styles.center}>
      <View style={[styles.iconCircle, styles.errorCircle]}>
        <View style={[styles.iconInner, styles.errorInner]}>
          <Ionicons name="alert-circle-outline" size={30} color={Colors.danger} />
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="secondary"
          size="sm"
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  errorCircle: { backgroundColor: "#FFF5F5" },
  errorInner: { backgroundColor: Colors.dangerLight },
  title: {
    fontSize: FontSize.lead,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
  },
  message: {
    fontSize: FontSize.small,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 280,
  },
  action: { marginTop: 18 },
});
