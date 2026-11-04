import { Stack } from "expo-router";

// Explore tab stack: Explore → Event Details → Confirm Booking → QR Ticket
export const unstable_settings = {
  // Deep links / cross-tab pushes still get the list screen underneath
  initialRouteName: "index",
};

export default function ExploreStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
