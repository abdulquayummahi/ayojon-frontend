import { router, useLocalSearchParams } from "expo-router";
import EventDetailsView from "../../../components/discovery/event-details-view";

export default function ExploreEventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <EventDetailsView
      eventId={id}
      backLabel="Back to Explore"
      onBook={() =>
        router.push({ pathname: "/explore/confirm/[id]", params: { id } })
      }
      onViewTicket={(ticketId) =>
        router.push({ pathname: "/explore/ticket/[ticketId]", params: { ticketId } })
      }
    />
  );
}
