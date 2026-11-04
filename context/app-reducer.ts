import { BOOKINGS } from "../data/mock-bookings";
import { EVENTS } from "../data/mock-events";
import { USERS } from "../data/mock-users";
import {
  AppEvent,
  Booking,
  EventStatus,
  SavedEvent,
  User,
} from "../types/models";
import { countActiveBookings } from "../utils/event-helpers";

// One store for the whole app. In the final term each action below will be
// replaced by (or paired with) a REST API call.
export interface AppState {
  currentUserId: string | null;
  users: User[];
  events: AppEvent[];
  bookings: Booking[];
  saved: SavedEvent[];
}

export const INITIAL_STATE: AppState = {
  currentUserId: null,
  users: USERS,
  events: EVENTS,
  bookings: BOOKINGS,
  saved: [{ userId: "u1", eventId: "e2" }],
};

export type AppAction =
  // Authentication & profile (Mahi)
  | { type: "LOGIN"; payload: string }
  | { type: "LOGOUT" }
  | { type: "REGISTER"; payload: User }
  | {
      type: "UPDATE_PROFILE";
      payload: {
        userId: string;
        name: string;
        phone: string;
        bio: string;
        avatarUrl: string;
      };
    }
  // Check-in (Mahi)
  | { type: "CHECK_IN"; payload: { bookingId: string; time: string } }
  // Saved events & bookings (Musfikuzzaman)
  | { type: "TOGGLE_SAVED"; payload: SavedEvent }
  | { type: "BOOK_SEAT"; payload: Booking }
  | { type: "CANCEL_BOOKING"; payload: string }
  // Event management (Shohag)
  | { type: "CREATE_EVENT"; payload: AppEvent }
  | { type: "UPDATE_EVENT"; payload: AppEvent }
  | { type: "SET_EVENT_STATUS"; payload: { eventId: string; status: EventStatus } };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, currentUserId: action.payload };

    case "LOGOUT":
      return { ...state, currentUserId: null };

    case "REGISTER":
      return {
        ...state,
        users: [...state.users, action.payload],
        currentUserId: action.payload.id,
      };

    case "UPDATE_PROFILE": {
      const { userId, name, phone, bio, avatarUrl } = action.payload;
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === userId ? { ...u, name, phone, bio, avatarUrl } : u
        ),
      };
    }

    case "CHECK_IN":
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === action.payload.bookingId && b.checkedInAt === null
            ? { ...b, checkedInAt: action.payload.time }
            : b
        ),
      };

    case "TOGGLE_SAVED": {
      const { userId, eventId } = action.payload;
      const isSaved = state.saved.some(
        (s) => s.userId === userId && s.eventId === eventId
      );
      return {
        ...state,
        saved: isSaved
          ? state.saved.filter(
              (s) => !(s.userId === userId && s.eventId === eventId)
            )
          : [{ userId, eventId }, ...state.saved],
      };
    }

    case "BOOK_SEAT": {
      const booking = action.payload;
      const event = state.events.find((e) => e.id === booking.eventId);
      const alreadyBooked = state.bookings.some(
        (b) =>
          b.eventId === booking.eventId &&
          b.userId === booking.userId &&
          b.status === "booked"
      );
      // Guards: the event must be open, not full, and not already booked
      if (
        !event ||
        event.status !== "published" ||
        alreadyBooked ||
        countActiveBookings(state.bookings, event.id) >= event.seatLimit
      ) {
        return state;
      }
      return { ...state, bookings: [booking, ...state.bookings] };
    }

    case "CANCEL_BOOKING":
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === action.payload && b.status === "booked"
            ? { ...b, status: "cancelled" }
            : b
        ),
      };

    case "CREATE_EVENT":
      return { ...state, events: [action.payload, ...state.events] };

    case "UPDATE_EVENT":
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };

    case "SET_EVENT_STATUS":
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.payload.eventId
            ? { ...e, status: action.payload.status }
            : e
        ),
      };

    default:
      return state;
  }
}
