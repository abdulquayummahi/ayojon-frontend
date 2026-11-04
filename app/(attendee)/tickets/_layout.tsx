import { Stack } from "expo-router";

// Tickets tab stack: My Tickets → QR Ticket
export const unstable_settings = {
  // Deep links / cross-tab pushes still get the list screen underneath
  initialRouteName: "index",
};

export default function TicketsStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
