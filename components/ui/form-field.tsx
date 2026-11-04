import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Colors, Radius } from "../../constants/theme";

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
}

// A controlled input with a label, an optional hint and an error message.
export default function FormField({
  label,
  error,
  hint,
  multiline,
  style,
  ...inputProps
}: FormFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        multiline={multiline}
        placeholderTextColor={Colors.textLight}
        style={[
          styles.input,
          multiline && styles.multiline,
          error ? styles.inputError : null,
          style,
        ]}
      />
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  multiline: { minHeight: 90, textAlignVertical: "top" },
  inputError: { borderColor: Colors.danger },
  error: { color: Colors.danger, fontSize: 12, marginTop: 5 },
  hint: { color: Colors.textLight, fontSize: 12, marginTop: 5 },
});
