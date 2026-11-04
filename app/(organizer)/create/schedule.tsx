import { router, useLocalSearchParams } from "expo-router";
import { EventInfo } from "../../../components/organizer/event-info-form";
import ScheduleSeatsForm from "../../../components/organizer/schedule-seats-form";

type Step1Params = {
  title?: string;
  category?: string;
  banner?: string;
  description?: string;
  organizerName?: string;
};

export default function ScheduleAndSeatsScreen() {
  const params = useLocalSearchParams<Step1Params>();

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
      onSaved={(event) => {
        // Back to a fresh step 1 that shows a success message
        router.dismissAll();
        router.replace({ pathname: "/create", params: { savedId: event.id } });
      }}
    />
  );
}
