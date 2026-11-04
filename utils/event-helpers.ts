import { AppEvent, Booking } from "../types/models";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// "2026-11-12" → Date at local midnight (avoids time-zone shifts)
export function parseEventDate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

// "NOV" and "12" for the date badge
export function getDateParts(date: string) {
  const d = parseEventDate(date);
  return {
    month: MONTHS[d.getMonth()].slice(0, 3).toUpperCase(),
    day: String(d.getDate()),
  };
}

// "12 November 2026 · 10:00 AM"
export function formatLongDate(event: AppEvent): string {
  const d = parseEventDate(event.date);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${formatTime(event.time)}`;
}

// "12 Nov · 10:00 AM"
export function formatShortDate(event: AppEvent): string {
  const d = parseEventDate(event.date);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} · ${formatTime(event.time)}`;
}

export function countActiveBookings(bookings: Booking[], eventId: string) {
  return bookings.filter((b) => b.eventId === eventId && b.status === "booked")
    .length;
}

export function countCheckedIn(bookings: Booking[], eventId: string) {
  return bookings.filter(
    (b) =>
      b.eventId === eventId && b.status === "booked" && b.checkedInAt !== null
  ).length;
}

export function seatsLeft(event: AppEvent, bookings: Booking[]) {
  return Math.max(0, event.seatLimit - countActiveBookings(bookings, event.id));
}

export type DateFilter = "any" | "week" | "month";

export const DATE_FILTER_LABELS: Record<DateFilter, string> = {
  any: "Any date",
  week: "Next 7 days",
  month: "Next 30 days",
};

export function matchesDateFilter(event: AppEvent, filter: DateFilter) {
  if (filter === "any") return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = filter === "week" ? 7 : 30;
  const limit = new Date(today);
  limit.setDate(today.getDate() + days);
  const eventDate = parseEventDate(event.date);
  return eventDate >= today && eventDate <= limit;
}

// Next free ticket ID such as "AYO-2412"
export function generateTicketId(bookings: Booking[]): string {
  let max = 1000;
  bookings.forEach((b) => {
    const n = Number(b.id.replace("AYO-", ""));
    if (!Number.isNaN(n) && n > max) max = n;
  });
  return `AYO-${max + 1}`;
}

export const STATUS_LABELS = {
  draft: "Draft",
  published: "Published · Registration open",
  closed: "Published · Registration closed",
} as const;
