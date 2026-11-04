import { Booking } from "../types/models";

const ATTENDEE_NAMES = [
  "Samira Ahmed", "Rakib Hasan", "Tanvir Islam", "Nusrat Jahan", "Fahim Chowdhury",
  "Ayesha Siddiqua", "Mehedi Hasan", "Sadia Afrin", "Arif Hossain", "Tasnim Rahman",
  "Imran Kabir", "Farhana Akter", "Shakil Ahmed", "Lamia Haque", "Rafiul Karim",
  "Jannatul Ferdous", "Sabbir Rahman", "Mithila Das", "Nayeem Uddin", "Rumana Sultana",
  "Zahid Hasan", "Priya Saha", "Tahmid Alam", "Sumaiya Islam", "Rifat Mahmud",
  "Nabila Noor", "Asif Iqbal", "Tania Begum", "Fardin Khan", "Raisa Anjum",
  "Mahmudul Hasan", "Sharmin Akter", "Ehsan Kabir", "Anika Tabassum", "Shuvo Roy",
  "Maliha Rahman", "Hasib Ahmed", "Orin Chowdhury", "Sajid Hossain", "Tamanna Akter",
  "Rezaul Karim", "Nishat Tasnim", "Habib Ullah", "Lubna Yasmin", "Kawsar Ahmed",
];

let nextTicketNumber = 2001;

// Builds `count` bookings for an event. The first `checkedIn` bookings are
// already checked in, and every booking listed in `cancelledIndexes` is cancelled.
function makeBookings(
  eventId: string,
  count: number,
  checkedIn: number,
  cancelledIndexes: number[] = []
): Booking[] {
  const list: Booking[] = [];
  for (let i = 0; i < count; i++) {
    const name = ATTENDEE_NAMES[i % ATTENDEE_NAMES.length];
    const cancelled = cancelledIndexes.includes(i);
    list.push({
      id: `AYO-${nextTicketNumber++}`,
      eventId,
      userId: `guest-${eventId}-${i}`,
      attendeeName: name,
      attendeeEmail: name.toLowerCase().replace(/\s+/g, ".") + "@example.com",
      status: cancelled ? "cancelled" : "booked",
      bookedAt: "2026-10-28T09:00:00.000Z",
      checkedInAt:
        !cancelled && i < checkedIn ? "2026-11-12T03:45:00.000Z" : null,
    });
  }
  return list;
}

// Bookings that belong to the demo attendee (Nahin Zaman, u1)
const DEMO_USER_BOOKINGS: Booking[] = [
  {
    id: "AYO-1024",
    eventId: "e1",
    userId: "u1",
    attendeeName: "Nahin Zaman",
    attendeeEmail: "student@university.edu",
    status: "booked",
    bookedAt: "2026-10-30T11:20:00.000Z",
    checkedInAt: null,
  },
  {
    id: "AYO-1031",
    eventId: "e3",
    userId: "u1",
    attendeeName: "Nahin Zaman",
    attendeeEmail: "student@university.edu",
    status: "booked",
    bookedAt: "2026-10-31T15:05:00.000Z",
    checkedInAt: null,
  },
];

export const BOOKINGS: Booking[] = [
  ...DEMO_USER_BOOKINGS,
  // e1: demo + 41 active guests = 42 registered of 60, 12 checked in
  ...makeBookings("e1", 42, 12, [41]),
  ...makeBookings("e2", 78, 0, [5, 9]),
  // e3: demo + 24 guests = 25 of 25 → full and closed
  ...makeBookings("e3", 24, 0),
  // e5: 20 of 20 seats booked → full
  ...makeBookings("e5", 20, 0),
  ...makeBookings("e6", 64, 0, [3]),
  ...makeBookings("e7", 37, 0),
  ...makeBookings("e8", 112, 0),
];
