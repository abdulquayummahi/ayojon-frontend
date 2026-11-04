import { router, useLocalSearchParams } from "expo-router";
import EventInfoForm from "../../../../components/organizer/event-info-form";
import Screen from "../../../../components/ui/screen";
import { ErrorState } from "../../../../components/ui/state-views";
import { useApp } from "../../../../context/app-context";

// Edit Event — reuses step 1 of the Create Event flow.
export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, currentUser } = useApp();

  const event = state.events.find((e) => e.id === id);

  if (!event || event.organizerId !== currentUser?.id) {
    return (
      <Screen>
        <ErrorState
          title="Event not available"
          message="Only the event owner can edit this event."
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  return (
    <EventInfoForm
      heading={event.status === "draft" ? "Edit draft" : "Edit event"}
      subtitle="Step 1 of 2 · Event information"
      backLabel="Back"
      initialValues={{
        title: event.title,
        category: event.category,
        description: event.description,
        organizerName: event.organizerName,
      }}
      onNext={(info) =>
        router.push({
          pathname: "/events/edit/schedule",
          params: { ...info, eventId: event.id },
        })
      }
    />
  );
}
