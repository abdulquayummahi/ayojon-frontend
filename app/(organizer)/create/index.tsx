import { router, useLocalSearchParams } from "expo-router";
import EventInfoForm from "../../../components/organizer/event-info-form";
import { useApp } from "../../../context/app-context";

export default function CreateEventScreen() {
  // savedId is set after step 2 saves an event, so we can show a success
  // message and start a fresh, empty form.
  const { savedId } = useLocalSearchParams<{ savedId?: string }>();
  const { state, currentUser } = useApp();

  const saved = savedId ? state.events.find((e) => e.id === savedId) : undefined;
  const successMessage = saved
    ? saved.status === "draft"
      ? `“${saved.title}” was saved as a draft.`
      : `“${saved.title}” is published and open for booking.`
    : undefined;

  return (
    <EventInfoForm
      // A new key remounts the form, which clears every field
      key={savedId ?? "new"}
      heading="Create event"
      subtitle="Step 1 of 2 · Event information"
      successMessage={successMessage}
      initialValues={{
        title: "",
        category: "",
        description: "",
        organizerName: currentUser?.name ?? "",
      }}
      onNext={(info) =>
        router.push({ pathname: "/create/schedule", params: { ...info } })
      }
    />
  );
}
