import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Button from "../../../../components/ui/button";
import FormField from "../../../../components/ui/form-field";
import Screen from "../../../../components/ui/screen";
import ScreenHeader from "../../../../components/ui/screen-header";
import { ErrorState } from "../../../../components/ui/state-views";
import { Colors, FontSize, Radius } from "../../../../constants/theme";
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
  // Runs only when checkTrigger changes (Check in pressed). ticketInput, event
  // and state are read inside but left out on purpose, so typing doesn't
  // restart the timer.
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
    <Screen
      scroll
      footer={
        <Button title="Check in" icon="checkmark-circle-outline" onPress={handleCheck} loading={isChecking} />
      }
    >
      <ScreenHeader title="Scan ticket" subtitle={event.title} backLabel="Back to event" />

      <View style={styles.camera}>
        <View style={styles.frame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          <Ionicons name="qr-code-outline" size={56} color="rgba(255,255,255,0.55)" />
          <View style={styles.scanLine} />
        </View>
        <Text style={styles.cameraText}>Camera preview</Text>
      </View>

      <View style={styles.noteBox}>
        <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
        <Text style={styles.note}>
          Camera scanning is added in the final term. For now, type the ticket ID
          shown under the attendee’s QR code.
        </Text>
      </View>

      <FormField
        label="Ticket ID"
        icon="ticket-outline"
        value={ticketInput}
        onChangeText={setTicketInput}
        onBlur={() => setTouched(true)}
        placeholder="e.g. AYO-1024"
        autoCapitalize="characters"
        autoCorrect={false}
        error={touched ? error : undefined}
      />
    </Screen>
  );
}

const CORNER = 28;

const styles = StyleSheet.create({
  camera: {
    height: 260,
    borderRadius: Radius.xl,
    backgroundColor: Colors.dark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  frame: { width: 170, height: 170, alignItems: "center", justifyContent: "center" },
  corner: { position: "absolute", width: CORNER, height: CORNER, borderColor: Colors.white },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 12 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 12 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 12 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 12 },
  scanLine: {
    position: "absolute",
    left: 14,
    right: 14,
    top: "50%",
    height: 3,
    borderRadius: 2,
    backgroundColor: "#8B74FF",
  },
  cameraText: { color: "rgba(255,255,255,0.6)", fontSize: FontSize.caption, marginTop: 14, fontWeight: "600" },
  noteBox: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primarySoft,
    marginBottom: 16,
  },
  note: { flex: 1, fontSize: FontSize.caption, color: Colors.textMuted, lineHeight: 18 },
});
