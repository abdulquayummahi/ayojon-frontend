import { User } from "../types/models";

// Demo accounts (password for all: password123)
export const USERS: User[] = [
  {
    id: "u1",
    name: "Nahin Zaman",
    email: "student@university.edu",
    password: "password123",
    role: "attendee",
    phone: "01711-000111",
    bio: "CSE student who loves design workshops and football.",
  },
  {
    id: "org1",
    name: "AIUB Design Club",
    email: "organizer@university.edu",
    password: "password123",
    role: "organizer",
    phone: "01711-000222",
    bio: "Workshops and talks on design thinking and UX.",
  },
  {
    id: "org2",
    name: "AIUB Sports Club",
    email: "sports@university.edu",
    password: "password123",
    role: "organizer",
    phone: "01711-000333",
    bio: "Tournaments, friendlies and community runs.",
  },
];
