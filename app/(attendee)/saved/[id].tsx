import { router, useLocalSearchParams } from "expo-router";
import EventDetailsView from "../../../components/discovery/event-details-view";

export default function SavedEventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <EventDetailsView
      eventId={id}
      backLabel="Back to Saved"
      // Booking continues in the Explore tab's flow
      onBook={() =>
        router.push({ pathname: "/explore/confirm/[id]", params: { id } })
      }
      onViewTicket={(ticketId) =>
        router.push({ pathname: "/tickets/[ticketId]", params: { ticketId } })
      }
    />
  );
}
