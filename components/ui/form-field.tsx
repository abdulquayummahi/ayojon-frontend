import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, ReactNode, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Colors, FontSize, Radius } from "../../constants/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  icon?: IconName; // optional icon inside the input, on the left
  right?: ReactNode; // optional element inside the input, on the right
}

// A controlled input with a label, an optional icon, hint and error message.
export default function FormField({
  label,
  error,
  hint,
  icon,
  right,
  multiline,
  style,
  onFocus,
  onBlur,
  ...inputProps
}: FormFieldProps) {
  // Only used for the focus outline — the value itself is controlled by the parent
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.box,
          multiline && styles.multilineBox,
          focused && styles.boxFocused,
          error ? styles.boxError : null,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={19}
            color={focused ? Colors.primary : Colors.textLight}
            style={multiline ? styles.iconTop : undefined}
          />
        ) : null}
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          multiline={multiline}
          placeholderTextColor={Colors.textLight}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, multiline && styles.multiline, style]}
        />
        {right}
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={Colors.danger} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    fontSize: FontSize.small,
    color: Colors.text,
    marginBottom: 8,
    fontWeight: "600",
  },
  box: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  multilineBox: { alignItems: "flex-start", paddingVertical: 12 },
  boxFocused: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  boxError: { borderColor: Colors.danger, backgroundColor: Colors.surface },
  iconTop: { marginTop: 2 },
  input: {
    flex: 1,
    fontSize: FontSize.body,
    color: Colors.text,
    paddingVertical: 12,
  },
  multiline: { minHeight: 96, paddingVertical: 0, textAlignVertical: "top" },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 },
  error: { fontSize: FontSize.caption, color: Colors.danger, fontWeight: "500" },
  hint: { fontSize: FontSize.caption, color: Colors.textLight, marginTop: 6 },
});
