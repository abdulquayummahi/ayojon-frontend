import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { Colors, FontSize, Radius, Shadow } from "../../constants/theme";

type Variant = "primary" | "secondary" | "danger";
type IconName = ComponentProps<typeof Ionicons>["name"];

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName; // optional icon shown before the title
  size?: "md" | "sm";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

const TEXT_COLOR: Record<Variant, string> = {
  primary: Colors.white,
  secondary: Colors.primary,
  danger: Colors.danger,
};

export default function Button({
  title,
  onPress,
  variant = "primary",
  icon,
  size = "md",
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const color = TEXT_COLOR[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === "sm" && styles.small,
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          {icon ? (
            <Ionicons name={icon} size={size === "sm" ? 16 : 19} color={color} />
          ) : null}
          <Text style={[styles.text, size === "sm" && styles.smallText, { color }]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: Radius.lg,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  small: { minHeight: 40, borderRadius: Radius.md, paddingHorizontal: 14 },
  primary: { backgroundColor: Colors.primary, ...Shadow.card },
  secondary: { backgroundColor: Colors.primaryLight },
  danger: { backgroundColor: Colors.dangerLight },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.45 },
  text: { fontSize: FontSize.body, fontWeight: "700" },
  smallText: { fontSize: FontSize.small },
});
