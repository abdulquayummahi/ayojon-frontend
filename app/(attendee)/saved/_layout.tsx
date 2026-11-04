import { Stack } from "expo-router";

// Saved tab stack: Saved Events → Event Details
export const unstable_settings = {
  // Deep links / cross-tab pushes still get the list screen underneath
  initialRouteName: "index",
};

export default function SavedStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
