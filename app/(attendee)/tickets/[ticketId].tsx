import { router, useLocalSearchParams } from "expo-router";
import TicketView from "../../../components/booking/ticket-view";

export default function MyTicketScreen() {
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();

  return (
    <TicketView
      ticketId={ticketId}
      justBooked={false}
      primaryLabel="Back to my tickets"
      onPrimary={() =>
        router.canGoBack() ? router.back() : router.replace("/tickets")
      }
    />
  );
}
