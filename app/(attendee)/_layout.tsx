import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { TAB_SCREEN_OPTIONS } from "../../components/ui/tab-options";
import { useApp } from "../../context/app-context";

// Attendee tab bar: Explore, Saved, Tickets, Profile.
// Role guard: only signed-in attendees can open these tabs.
export default function AttendeeTabsLayout() {
  const { currentUser } = useApp();

  if (!currentUser) return <Redirect href="/login" />;
  if (currentUser.role !== "attendee") return <Redirect href="/events" />;

  return (
    <Tabs
      screenOptions={TAB_SCREEN_OPTIONS}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "compass" : "compass-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "bookmark" : "bookmark-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: "Tickets",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "ticket" : "ticket-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
