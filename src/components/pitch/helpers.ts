import { fetchPitches } from "../../lib/data";
import type { Court, Pitch, Slot } from "../../lib/types";

/** All pitch times are Muscat local (UTC+4, no DST). */
export const MUSCAT_TZ = "Asia/Muscat";

/** Loads a single pitch by id (the collection is small, so fetch + find). */
export async function fetchPitch(id: string): Promise<Pitch | null> {
  const all = await fetchPitches();
  return all.find((p) => p.id === id) ?? null;
}

/** accentHex (stored as a number) to a CSS hex color. */
export function accentColor(hex: number): string {
  return `#${(hex & 0xffffff).toString(16).padStart(6, "0")}`;
}

/** Mirrors the app's OwnerTier labels. */
export function tierLabel(tier: string): string {
  if (tier === "pro") return "Maydan Pro";
  if (tier === "plus") return "Maydan+";
  return "Maydan";
}

/** Plus and Pro pitches publish slot availability. */
export function showsAvailability(tier: string): boolean {
  return tier === "plus" || tier === "pro";
}

/** Only Pro pitches can be booked in-app; the rest are call to book. */
export function supportsBooking(tier: string): boolean {
  return tier === "pro";
}

const AMENITIES: Record<string, { en: string; ar: string }> = {
  parking: { en: "Parking", ar: "مواقف" },
  showers: { en: "Showers", ar: "دشات" },
  lighting: { en: "Floodlights", ar: "إضاءة" },
  lockers: { en: "Lockers", ar: "خزائن" },
  cafe: { en: "Cafe", ar: "مقهى" },
  water: { en: "Water", ar: "ماء" },
  indoor: { en: "Indoor", ar: "مغلق" },
};

export function amenityLabel(raw: string, ar: boolean): string {
  const hit = AMENITIES[raw];
  return hit ? (ar ? hit.ar : hit.en) : raw;
}

const SURFACES: Record<string, { en: string; ar: string }> = {
  grass: { en: "Grass", ar: "عشب طبيعي" },
  turf: { en: "Turf", ar: "عشب صناعي" },
  hybrid: { en: "Hybrid", ar: "هجين" },
};

export function surfaceLabel(raw: string, ar: boolean): string {
  const hit = SURFACES[raw];
  return hit ? (ar ? hit.ar : hit.en) : raw;
}

/** PitchSize raw values (as stored by the app) to labels and per-side counts. */
const SIZES: Record<string, { label: string; perSide: number }> = {
  fiveASide: { label: "5v5", perSide: 5 },
  sixASide: { label: "6v6", perSide: 6 },
  sevenASide: { label: "7v7", perSide: 7 },
  elevenASide: { label: "11v11", perSide: 11 },
};

export function sizeLabel(raw?: string): string {
  if (!raw) return "";
  return SIZES[raw]?.label ?? raw;
}

/** Players per side for a court, e.g. 5 for a 5v5 pitch (default 5). */
export function courtSizeNumber(court: Court): number {
  const hit = court.size ? SIZES[court.size] : undefined;
  if (hit) return hit.perSide;
  const digits = /\d+/.exec(court.size ?? court.name);
  return digits ? Number(digits[0]) : 5;
}

/**
 * Bookable pitches to display: the venue's own list, or a derived 5/6/7-a-side
 * set matching the app's `displayCourts` (stable ids, +2 OMR per size step).
 */
export function displayCourts(pitch: Pitch, ar: boolean): Court[] {
  if (pitch.courts.length > 0) return pitch.courts;
  const base = pitch.isIndoor ? (ar ? "مغلق" : "Indoor") : ar ? "مكشوف" : "Outdoor";
  const sizes = ["fiveASide", "sixASide", "sevenASide"];
  return sizes.map((size, index) => ({
    id: `${pitch.id}-c${index + 1}`,
    name: sizeLabel(size),
    attributes: [base, surfaceLabel(pitch.surface, ar), sizeLabel(size)],
    pricePerHour: pitch.pricePerHour + index * 2,
    size,
    isAvailable: true,
  }));
}

/** Calendar-day key (YYYY-MM-DD) for a timestamp, in Muscat time. */
export function dayKeyOf(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: MUSCAT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ms);
}

/** Timestamps for today plus the next `count - 1` days. */
export function nextDays(count = 7): number[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => now + i * 86_400_000);
}

/** Weekday, day number and month pieces for a date chip. */
export function dayParts(ms: number, ar: boolean): { weekday: string; day: string; month: string } {
  const locale = ar ? "ar" : "en";
  const fmt = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { timeZone: MUSCAT_TZ, ...options }).format(ms);
  return {
    weekday: fmt({ weekday: "short" }),
    day: fmt({ day: "numeric" }),
    month: fmt({ month: "short" }),
  };
}

/** Short date label for the booking summary, e.g. "Thu 3 Jul". */
export function dayShortLabel(ms: number, ar: boolean): string {
  return new Intl.DateTimeFormat(ar ? "ar" : "en", {
    timeZone: MUSCAT_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(ms);
}

/** Clock time label for a slot start, e.g. "6:00 pm". */
export function timeLabel(ms: number, ar: boolean): string {
  return new Intl.DateTimeFormat(ar ? "ar" : "en", {
    timeZone: MUSCAT_TZ,
    hour: "numeric",
    minute: "2-digit",
  })
    .format(ms)
    .toLowerCase();
}

/** Available, still-upcoming slots that fall on the given Muscat day. */
export function slotsForDay(slots: Slot[], key: string): Slot[] {
  const now = Date.now();
  return slots
    .filter((s) => s.isAvailable && s.startMs > now && dayKeyOf(s.startMs) === key)
    .sort((a, b) => a.startMs - b.startMs);
}

/**
 * The 6-character share code derived from a booking id. Matches the server
 * (`createBooking` in functions/index.js) and the app's Booking.joinCode.
 */
export function joinCode(bookingId: string): string {
  return bookingId
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}
