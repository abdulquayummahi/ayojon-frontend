// Shared data models agreed by all three members.
// The same shapes will be returned by the REST API in the final term.

export type Role = "attendee" | "organizer";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // mock only — the server will store a hash in the final term
  role: Role;
  phone: string;
  bio: string;
}

export type EventCategory =
  | "Workshop"
  | "Seminar"
  | "Sports"
  | "Concert"
  | "Community";

export type EventLocation = "AIUB Campus" | "Banani" | "Dhanmondi" | "Online";

// draft     → only the organizer can see it
// published → visible in Explore, registration open
// closed    → visible in Explore, registration closed
export type EventStatus = "draft" | "published" | "closed";

export interface AppEvent {
  id: string;
  title: string;
  category: EventCategory;
  description: string;
  organizerId: string;
  organizerName: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM" (24-hour)
  venue: string;
  location: EventLocation;
  seatLimit: number;
  status: EventStatus;
}

export type BookingStatus = "booked" | "cancelled";

export interface Booking {
  id: string; // ticket ID, e.g. "AYO-1024"
  eventId: string;
  userId: string;
  attendeeName: string;
  attendeeEmail: string;
  status: BookingStatus;
  bookedAt: string; // ISO date-time
  checkedInAt: string | null; // ISO date-time once checked in
}

export interface SavedEvent {
  userId: string;
  eventId: string;
}

export type CheckInOutcome = "valid" | "already" | "invalid";
