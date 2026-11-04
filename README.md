# Ayojon — Frontend (Midterm)

Ayojon lets campus clubs and community organizers create events, manage
registrations and check in attendees, while students discover and book them.

**Group 2 · Nexus Devs** — Mobile Application Development with React Native & Expo, Fall 2026-27

This is the **midterm frontend**: every screen runs on mock data kept in a
`useReducer` + `useContext` store. Each screen shows loading, empty, error and
success states. Camera scanning, AsyncStorage and the REST API are added in the
final term.

---

## Run the app

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go**, or press `w` to open the web version.

### Demo accounts (password for both: `password123`)

| Role      | Email                      |
| --------- | -------------------------- |
| Attendee  | `student@university.edu`   |
| Organizer | `organizer@university.edu` |

The Login screen has buttons that fill these in. You can also register a new
account. The role you pick (Attend events / Organize events) decides which tab
bar opens.

### Demo ticket IDs (Organizer → Design Thinking Workshop → Scan QR ticket)

| Ticket ID  | Result                                          |
| ---------- | ----------------------------------------------- |
| `AYO-1024` | Valid the first time, then "Already checked in" |
| `AYO-2001` | Already checked in                              |
| `AYO-2042` | Invalid: booking was cancelled                  |
| `AYO-1031` | Invalid: ticket belongs to a different event    |
| `AYO-9999` | Invalid: no booking found                       |

Other useful demo data:
- **Inter-University Football Friendly** is fully booked, so booking is blocked.
- **UX Portfolio Review Night** has registration closed.
- **Campus Photography Walk** is a draft that only its organizer can see.

> Everything is stored in memory. Reloading the app resets the mock data.

---

## Navigation

The root Stack opens Login/Register. After login, the user's role decides
which tab group is shown. Each tab that drills into detail screens has its
own nested Stack.

```
app/
├── _layout.tsx            Root Stack + AppProvider (shared store)
├── index.tsx              Redirects to Login or the user's tab group
├── (auth)/                Login, Register
├── (attendee)/            Tabs: Explore · Saved · Tickets · Profile
│   ├── explore/           Explore → Event Details → Confirm Booking → QR Ticket
│   ├── saved/             Saved Events → Event Details
│   ├── tickets/           My Tickets → QR Ticket
│   └── profile.tsx
└── (organizer)/           Tabs: Events · Create · Profile
    ├── events/            Organizer Events → Manage Event → Attendees / Edit
    │                      Manage Event → Scan Ticket → Check-in Result
    ├── create/            Create Event (step 1) → Schedule & Seats (step 2)
    └── account.tsx        Profile (named "account" so its URL doesn't clash with /profile)
```

The `(attendee)` and `(organizer)` layouts act as **role guards**. If nobody is
signed in, or the role is wrong, they redirect.

## Shared state (`context/`)

- `app-reducer.ts`: the `AppState` (current user, users, events, bookings,
  saved events), the `AppAction` union and the pure `appReducer`. The reducer
  also blocks duplicate bookings and overbooking.
- `app-context.tsx`: `AppProvider` (calls `useReducer`) and the `useApp()`
  custom hook, which throws if it is used outside the provider.

Form fields, search text and filters stay as **local** `useState` in their screens.

## Folder structure

```
app/          Screens and navigators (Expo Router, file-based routing)
components/
  ui/         Reusable building blocks: Button, FormField, Chip, ChipRow, Card,
              Banner, StatusBadge, ConfirmDialog, Screen, ScreenHeader,
              LoadingState / EmptyState / ErrorState
  events/     EventCard, DateBadge
  auth/       ProfileView
  discovery/  EventDetailsView
  booking/    TicketView, SampleQr
  organizer/  EventInfoForm (step 1), ScheduleSeatsForm (step 2)
constants/    theme.ts (colours, spacing, radius)
context/      Reducer + provider + useApp()
data/         Mock users, events and bookings
hooks/        useSimulatedLoading (fake network delay with cleanup)
types/        Shared data models (User, AppEvent, Booking, …)
utils/        Validation, date/seat helpers, ticket check-in rules
```

---

## File ownership (who pushes what)

Each member commits and pushes **their own files from their own device**.

### Shared setup: MD SHOHAG SHAHJAHAN (push first)

Everyone else's screens import these, so push them first:

```
app/_layout.tsx
app/index.tsx
app.json
package.json
README.md
constants/theme.ts
types/models.ts
context/app-reducer.ts
context/app-context.tsx
data/mock-users.ts
data/mock-events.ts
data/mock-bookings.ts
hooks/use-simulated-loading.ts
utils/event-helpers.ts
utils/validation.ts
components/ui/*            (all 11 reusable UI components)
components/events/event-card.tsx
components/events/date-badge.tsx
```

### 1. ABDUL QUAYUM MAHI: authentication, roles & profiles; QR check-in

Screens: Login, Register, Profile, Scan Ticket, Check-in Result

```
app/(auth)/_layout.tsx
app/(auth)/login.tsx
app/(auth)/register.tsx
app/(attendee)/profile.tsx
app/(organizer)/account.tsx
app/(organizer)/events/scan/[id].tsx
app/(organizer)/events/check-in/[ticketId].tsx
components/auth/profile-view.tsx
utils/check-in.ts
```

Reducer actions: `LOGIN`, `LOGOUT`, `REGISTER`, `UPDATE_PROFILE`, `CHECK_IN`

### 2. MD. MUSFIKUZZAMAN: event discovery & saved events; booking, tickets & cancellation

Screens: Explore, Event Details, Saved Events, Confirm Booking, QR Ticket, My Tickets

```
app/(attendee)/_layout.tsx
app/(attendee)/explore/_layout.tsx
app/(attendee)/explore/index.tsx
app/(attendee)/explore/[id].tsx
app/(attendee)/explore/confirm/[id].tsx
app/(attendee)/explore/ticket/[ticketId].tsx
app/(attendee)/saved/_layout.tsx
app/(attendee)/saved/index.tsx
app/(attendee)/saved/[id].tsx
app/(attendee)/tickets/_layout.tsx
app/(attendee)/tickets/index.tsx
app/(attendee)/tickets/[ticketId].tsx
components/discovery/event-details-view.tsx
components/booking/ticket-view.tsx
components/booking/sample-qr.tsx
```

Reducer actions: `TOGGLE_SAVED`, `BOOK_SEAT`, `CANCEL_BOOKING`

### 3. MD SHOHAG SHAHJAHAN: organizer event management & attendee lists

Screens: Organizer Events, Create Event, Schedule & Seats, Manage Event, Attendees

```
app/(organizer)/_layout.tsx
app/(organizer)/events/_layout.tsx
app/(organizer)/events/index.tsx
app/(organizer)/events/[id].tsx
app/(organizer)/events/attendees/[id].tsx
app/(organizer)/events/edit/[id].tsx
app/(organizer)/events/edit/schedule.tsx
app/(organizer)/create/_layout.tsx
app/(organizer)/create/index.tsx
app/(organizer)/create/schedule.tsx
components/organizer/event-info-form.tsx
components/organizer/schedule-seats-form.tsx
```

Reducer actions: `CREATE_EVENT`, `UPDATE_EVENT`, `SET_EVENT_STATUS`

---

## Midterm acceptance checks (from the proposal)

| Package        | Check                                                                                              | Where                                 |
| -------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Auth           | Required fields, email format, 8-char password; errors only after touch or Submit                  | `login.tsx`, `register.tsx`           |
| Auth           | Registration role decides the tab bar after login                                                  | `app/index.tsx`, group layouts        |
| Auth           | Profile edits update the displayed profile                                                         | `profile-view.tsx`                    |
| Check-in       | Manual ticket-ID entry checked against mock bookings; valid / already-checked-in / invalid outcomes | `scan/[id].tsx`, `check-in/[ticketId].tsx` |
| Discovery      | Search + category/date/location filters; empty state when nothing matches                         | `explore/index.tsx`                   |
| Discovery      | Saving on Event Details shows the event in Saved Events                                            | `event-details-view.tsx`, `saved/index.tsx` |
| Booking        | Confirm Booking validates name + email, blocks when no seats, opens a QR ticket                    | `explore/confirm/[id].tsx`            |
| Booking        | My Tickets cancels only after confirmation                                                         | `tickets/index.tsx`                   |
| Organizer      | Step 1 + step 2 validate title, category, date, venue, seats > 0 before draft or publish           | `event-info-form.tsx`, `schedule-seats-form.tsx` |
| Organizer      | Organizer Events filters Published / Drafts / Closed                                               | `events/index.tsx`                    |
| Organizer      | Manage Event shows registered/remaining seats and opens/closes registration                        | `events/[id].tsx`                     |
| Organizer      | Attendees searches by name or ticket ID, filters All / Checked in                                  | `events/attendees/[id].tsx`           |

## Checks

```bash
npx tsc --noEmit   # type-check
npx expo lint      # lint
```
