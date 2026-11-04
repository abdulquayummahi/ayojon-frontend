import { router, useLocalSearchParams } from "expo-router";
import TicketView from "../../../../components/booking/ticket-view";

export default function ExploreTicketScreen() {
  const { ticketId, justBooked } = useLocalSearchParams<{
    ticketId: string;
    justBooked?: string;
  }>();

  return (
    <TicketView
      ticketId={ticketId}
      justBooked={justBooked === "1"}
      primaryLabel="Back to my tickets"
      onPrimary={() => {
        // Leave the booking flow and open the Tickets tab
        router.dismissAll();
        router.navigate("/tickets");
      }}
    />
  );
}
