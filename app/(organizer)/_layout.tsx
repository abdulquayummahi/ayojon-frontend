import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { Colors } from "../../constants/theme";
import { useApp } from "../../context/app-context";

// Organizer tab bar: Events, Create, Profile.
// Role guard: only signed-in organizers can open these tabs.
export default function OrganizerTabsLayout() {
  const { currentUser } = useApp();

  if (!currentUser) return <Redirect href="/login" />;
  if (currentUser.role !== "organizer") return <Redirect href="/explore" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
      }}
    >
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      {/* Named "account" so its URL does not clash with the attendee /profile */}
      <Tabs.Screen
        name="account"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
