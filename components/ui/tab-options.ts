import { Colors } from "../../constants/theme";

// Shared look for both tab bars (attendee and organizer)
export const TAB_SCREEN_OPTIONS = {
  headerShown: false,
  tabBarActiveTintColor: Colors.primary,
  tabBarInactiveTintColor: Colors.textLight,
  tabBarLabelStyle: { fontSize: 11, fontWeight: "700" as const },
  tabBarStyle: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    height: 64,
    paddingTop: 6,
    paddingBottom: 8,
  },
};
