import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppProvider } from "../context/app-context";

// Root Stack. The AppProvider makes the shared store (user, events,
// bookings, saved events) available to every screen.
export default function RootLayout() {
  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(attendee)" />
        <Stack.Screen name="(organizer)" />
      </Stack>
      <StatusBar style="dark" />
    </AppProvider>
  );
}
