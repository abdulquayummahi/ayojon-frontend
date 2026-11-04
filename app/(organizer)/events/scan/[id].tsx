import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Button from "../../../../components/ui/button";
import FormField from "../../../../components/ui/form-field";
import Screen from "../../../../components/ui/screen";
import ScreenHeader from "../../../../components/ui/screen-header";
import { ErrorState } from "../../../../components/ui/state-views";
import { Colors, Radius } from "../../../../constants/theme";
import { useApp } from "../../../../context/app-context";
import { checkTicket } from "../../../../utils/check-in";
import {
  normaliseTicketId,
  validateTicketId,
} from "../../../../utils/validation";

// Scan Ticket — midterm version uses manual ticket-ID entry.
// Camera QR scanning replaces the preview box in the final term.
export default function ScanTicketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, currentUser, dispatch } = useApp();

  const [ticketInput, setTicketInput] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [checkTrigger, setCheckTrigger] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const event = state.events.find((e) => e.id === id);

  useEffect(() => {
    setError(validateTicketId(ticketInput));
  }, [ticketInput]);

  // Fake "validate on server" request
  useEffect(() => {
    if (!checkTrigger || !event) return;

    const timeoutId = setTimeout(() => {
      const ticketId = normaliseTicketId(ticketInput);
      const result = checkTicket(state.bookings, ticketId, event.id);

      if (result.outcome === "valid") {
        dispatch({
          type: "CHECK_IN",
          payload: { bookingId: ticketId, time: new Date().toISOString() },
        });
      }

      setIsChecking(false);
      setCheckTrigger(false);
      setTicketInput("");
      setTouched(false);

      router.push({
        pathname: "/events/check-in/[ticketId]",
        params: {
          ticketId,
          eventId: event.id,
          outcome: result.outcome,
          reason: result.reason,
        },
      });
    }, 900);

    return () => clearTimeout(timeoutId);
  // Runs only when the trigger changes (Submit pressed), not on every
  // keystroke — so the other values are left out on purpose.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkTrigger]);

  if (!event || event.organizerId !== currentUser?.id) {
    return (
      <Screen>
        <ErrorState
          title="Event not available"
          message="You can only check in attendees for your own events."
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const handleCheck = () => {
    setTouched(true);
    if (!error) {
      setIsChecking(true);
      setCheckTrigger(true);
    }
  };

  return (
    <Screen scroll>
      <ScreenHeader title="Scan ticket" subtitle={event.title} />

      <View style={styles.camera}>
        <View style={styles.frame}>
          <Ionicons name="qr-code-outline" size={44} color={Colors.textLight} />
          <Text style={styles.cameraText}>Camera preview</Text>
        </View>
      </View>
      <Text style={styles.note}>
        Camera scanning is added in the final term. For now, type the ticket ID
        shown under the attendee’s QR code.
      </Text>

      <FormField
        label="Ticket ID"
        value={ticketInput}
        onChangeText={setTicketInput}
        onBlur={() => setTouched(true)}
        placeholder="e.g. AYO-1024"
        autoCapitalize="characters"
        autoCorrect={false}
        error={touched ? error : undefined}
      />

      <Button title="Check in" onPress={handleCheck} loading={isChecking} />
      <Button
        title="Back to event"
        variant="secondary"
        onPress={() => router.back()}
        disabled={isChecking}
        style={styles.secondary}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  camera: {
    height: 230,
    backgroundColor: Colors.dark,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: 160,
    height: 160,
    borderWidth: 2,
    borderColor: "#8E86C9",
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cameraText: { color: Colors.textLight, fontSize: 14 },
  note: {
    fontSize: 13,
    color: Colors.textMuted,
    marginVertical: 16,
    lineHeight: 19,
  },
  secondary: { marginTop: 10 },
});
