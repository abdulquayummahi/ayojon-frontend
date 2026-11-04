import { Redirect } from "expo-router";
import { useApp } from "../context/app-context";

// Entry point: send the user to Login, or to the tab group for their role.
export default function Index() {
  const { currentUser } = useApp();

  if (!currentUser) return <Redirect href="/login" />;
  if (currentUser.role === "organizer") return <Redirect href="/events" />;
  return <Redirect href="/explore" />;
}
