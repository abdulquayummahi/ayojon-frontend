import { Booking, CheckInOutcome } from "../types/models";

export interface TicketCheck {
  outcome: CheckInOutcome;
  reason: string;
  booking?: Booking;
}

// Decides whether a ticket can be checked in to an event.
// The server repeats these same rules in the final term.
export function checkTicket(
  bookings: Booking[],
  ticketId: string,
  eventId: string
): TicketCheck {
  const booking = bookings.find((b) => b.id === ticketId);

  if (!booking) {
    return { outcome: "invalid", reason: "No booking matches this ticket ID." };
  }
  if (booking.eventId !== eventId) {
    return {
      outcome: "invalid",
      reason: "This ticket belongs to a different event.",
      booking,
    };
  }
  if (booking.status === "cancelled") {
    return {
      outcome: "invalid",
      reason: "This booking was cancelled.",
      booking,
    };
  }
  if (booking.checkedInAt !== null) {
    return {
      outcome: "already",
      reason: "This ticket has already been used for entry.",
      booking,
    };
  }
  return { outcome: "valid", reason: "Entry recorded successfully.", booking };
}

export function formatCheckInTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} at ${hour12}:${m} ${suffix}`;
}
