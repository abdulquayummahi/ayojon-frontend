import { Stack } from "expo-router";

// Create tab stack: Create Event (step 1) → Schedule and Seats (step 2)
export const unstable_settings = {
  // Deep links / cross-tab pushes still get the list screen underneath
  initialRouteName: "index",
};

export default function CreateStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
