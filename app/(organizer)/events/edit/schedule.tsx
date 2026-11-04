import { router, useLocalSearchParams } from "expo-router";
import { EventInfo } from "../../../../components/organizer/event-info-form";
import ScheduleSeatsForm from "../../../../components/organizer/schedule-seats-form";

type EditParams = {
  eventId: string;
  title?: string;
  category?: string;
  banner?: string;
  description?: string;
  organizerName?: string;
};

// Edit Event — reuses step 2 of the Create Event flow.
export default function EditScheduleScreen() {
  const params = useLocalSearchParams<EditParams>();

  const info: EventInfo = {
    title: params.title ?? "",
    category: (params.category ?? "") as EventInfo["category"],
    banner: params.banner ?? "",
    description: params.description ?? "",
    organizerName: params.organizerName ?? "",
  };

  return (
    <ScheduleSeatsForm
      info={info}
      eventId={params.eventId}
      // Close both edit steps and return to where editing started
      onSaved={() => router.dismiss(2)}
    />
  );
}
