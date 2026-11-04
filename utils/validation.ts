import { findPreset, isImageLink } from "./images";

// Small validation helpers shared by every form in the app.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  const value = email.trim();
  if (value.length === 0) return "Email is required.";
  if (!EMAIL_PATTERN.test(value)) return "Enter a valid email address.";
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (password.length === 0) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  return undefined;
}

export function validateName(name: string): string | undefined {
  const value = name.trim();
  if (value.length === 0) return "Name is required.";
  if (value.length < 3) return "Name must be at least 3 characters.";
  return undefined;
}

// "2026-11-12" — must be a real calendar date
export function validateDate(date: string): string | undefined {
  const value = date.trim();
  if (value.length === 0) return "Date is required.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Use the format YYYY-MM-DD.";
  const [y, m, d] = value.split("-").map(Number);
  const parsed = new Date(y, m - 1, d);
  if (
    parsed.getFullYear() !== y ||
    parsed.getMonth() !== m - 1 ||
    parsed.getDate() !== d
  ) {
    return "This date does not exist.";
  }
  return undefined;
}

// "10:00" — 24-hour clock
export function validateTime(time: string): string | undefined {
  const value = time.trim();
  if (value.length === 0) return "Start time is required.";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    return "Use 24-hour format HH:MM, e.g. 14:30.";
  }
  return undefined;
}

// Ticket IDs look like AYO-1024
export function normaliseTicketId(input: string): string {
  return input.trim().toUpperCase();
}

export function validateTicketId(input: string): string | undefined {
  const value = normaliseTicketId(input);
  if (value.length === 0) return "Ticket ID is required.";
  if (!/^AYO-\d{4}$/.test(value)) return "Ticket IDs look like AYO-1024.";
  return undefined;
}

// Every event needs a banner: a preset id or an image link
export function validateBanner(banner: string): string | undefined {
  const value = banner.trim();
  if (value.length === 0) return "Choose a banner image for the event.";
  if (isImageLink(value) || findPreset(value)) return undefined;
  return "Enter an image link that starts with http:// or https://";
}

// Optional image link (profile photo)
export function validateImageLink(link: string): string | undefined {
  const value = link.trim();
  if (value.length === 0) return undefined;
  if (!isImageLink(value)) return "Image links start with http:// or https://";
  return undefined;
}
