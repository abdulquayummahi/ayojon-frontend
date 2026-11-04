import { Stack } from "expo-router";

// Events tab stack: Organizer Events → Manage Event → Attendees / Edit, and Manage Event → Scan Ticket → Check-in Result
export const unstable_settings = {
  // Deep links / cross-tab pushes still get the list screen underneath
  initialRouteName: "index",
};

export default function EventsStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
