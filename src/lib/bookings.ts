import {
  collection,
  onSnapshot,
  query,
  where,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, fns } from "./firebase";
import type { Booking } from "./types";

const num = (v: unknown, fallback = 0) => (typeof v === "number" ? v : Number(v) || fallback);

/** Firestore Timestamp (or millis, or {seconds}) to epoch millis. */
function toMillis(v: unknown): number {
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && "seconds" in v) {
    const t = v as { seconds: unknown; nanoseconds?: unknown };
    return num(t.seconds) * 1000 + Math.floor(num(t.nanoseconds) / 1e6);
  }
  return 0;
}

/**
 * The 6-character share code derived from a booking id. Matches the server
 * (`createBooking` in functions/index.js) and the app's Booking.joinCode, so
 * older docs without the stored field still get the right code.
 */
export function joinCodeForId(id: string): string {
  const base = id.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return (base + "MAYDAN").slice(0, 6);
}

/** Tolerant Firestore doc -> Booking (mirrors FirebaseBookingRepository.booking). */
function mapBooking(id: string, x: Record<string, unknown>): Booking | null {
  const pitchId = typeof x.pitchId === "string" ? x.pitchId : "";
  if (!pitchId) return null;
  const startMs = typeof x.startMs === "number" ? x.startMs : toMillis(x.start);
  const endMs = typeof x.endMs === "number" ? x.endMs : toMillis(x.end);
  if (!startMs || !endMs) return null;
  return {
    id,
    pitchId,
    pitchName: (x.pitchName as string) ?? "",
    customerName: (x.customerName as string) ?? "",
    customerPhone: (x.customerPhone as string) ?? "",
    partySize: num(x.partySize),
    startMs,
    endMs,
    amount: num(x.amount),
    status: typeof x.status === "string" && x.status ? x.status : "confirmed",
    playerId: (x.playerId as string) ?? "",
    joinCode: typeof x.joinCode === "string" && x.joinCode ? x.joinCode : joinCodeForId(id),
    spotsFilled: num(x.spotsFilled, 1),
  };
}

/**
 * Live "my bookings" for a player: ones they booked (playerId) plus ones they
 * joined via a code (joinedPlayerIds). Two listeners, merged and de-duped,
 * exactly like the app's FirebaseBookingRepository.observePlayer.
 */
export function watchMyBookings(uid: string, cb: (bookings: Booking[]) => void): Unsubscribe {
  const d = db();
  if (!d) {
    cb([]);
    return () => {};
  }
  const col = collection(d, "bookings");
  let booked: Booking[] = [];
  let joined: Booking[] = [];

  const emit = () => {
    const byId = new Map<string, Booking>();
    for (const b of [...booked, ...joined]) byId.set(b.id, b);
    cb([...byId.values()].sort((a, b) => a.startMs - b.startMs));
  };

  const un1 = onSnapshot(query(col, where("playerId", "==", uid)), (snap) => {
    booked = snap.docs
      .map((doc) => mapBooking(doc.id, doc.data() as Record<string, unknown>))
      .filter((b): b is Booking => b !== null);
    emit();
  });
  const un2 = onSnapshot(query(col, where("joinedPlayerIds", "array-contains", uid)), (snap) => {
    joined = snap.docs
      .map((doc) => mapBooking(doc.id, doc.data() as Record<string, unknown>))
      .filter((b): b is Booking => b !== null);
    emit();
  });

  return () => {
    un1();
    un2();
  };
}

/**
 * Cancels a booking through the `updateBookingStatus` callable, like the app.
 * Clients can't write the `bookings` collection directly (firestore.rules).
 */
export async function cancelBooking(id: string): Promise<void> {
  const f = fns();
  if (!f) throw new Error("Firebase is not configured.");
  await httpsCallable(f, "updateBookingStatus")({ bookingId: id, status: "cancelled" });
}

/**
 * Joins a booking from its 6-character share code. Mirrors the app's flow:
 * `findBookingByCode` resolves the code to a booking, then `joinBooking`
 * fills one spot (idempotent on the server).
 */
export async function joinByCode(
  code: string,
  name = ""
): Promise<{ spotsFilled: number; alreadyJoined: boolean }> {
  const f = fns();
  if (!f) throw new Error("Firebase is not configured.");
  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (clean.length < 4) throw new Error("Enter the 6 character code from your teammate.");

  const found = await httpsCallable(f, "findBookingByCode")({ code: clean });
  const booking = (found.data as { booking?: { id?: string } | null } | null)?.booking;
  if (!booking?.id) throw new Error("No booking matches that code.");

  const res = await httpsCallable(f, "joinBooking")({ bookingId: booking.id, name });
  const data = (res.data ?? {}) as { spotsFilled?: unknown; alreadyJoined?: unknown };
  return {
    spotsFilled: num(data.spotsFilled, 1),
    alreadyJoined: Boolean(data.alreadyJoined),
  };
}
