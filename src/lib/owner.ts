import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
  Timestamp,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useEffect, useState } from "react";
import { db, fns } from "./firebase";
import type { Booking, Pitch } from "./types";

/** Booking statuses the owner can set (mirrors the app's BookingStatus). */
export type OwnerBookingStatus = "confirmed" | "completed" | "cancelled";

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

/** Tolerant pitch mapping (same shape as lib/data.ts fetchPitches). */
function mapPitch(id: string, x: Record<string, unknown>): Pitch {
  return {
    id: (x.id as string) ?? id,
    name: (x.name as string) ?? "",
    area: (x.area as string) ?? "",
    city: (x.city as string) ?? "",
    surface: String(x.surface ?? ""),
    size: String(x.size ?? ""),
    pricePerHour: num(x.pricePerHour),
    rating: num(x.rating),
    reviewCount: num(x.reviewCount),
    tier: String(x.tier ?? ""),
    amenities: Array.isArray(x.amenities) ? (x.amenities as unknown[]).map(String) : [],
    phone: (x.phone as string) ?? "",
    isIndoor: Boolean(x.isIndoor),
    latitude: num(x.latitude),
    longitude: num(x.longitude),
    distanceKm: num(x.distanceKm),
    accentHex: num(x.accentHex, 0x2563eb),
    imageURL: (x.imageURL as string) ?? null,
    courts: Array.isArray(x.courts)
      ? (x.courts as Record<string, unknown>[]).map((c) => ({
          id: (c.id as string) ?? crypto.randomUUID(),
          name: (c.name as string) ?? "",
          attributes: Array.isArray(c.attributes) ? (c.attributes as unknown[]).map(String) : [],
          pricePerHour: num(c.pricePerHour),
          size: c.size ? String(c.size) : undefined,
          isAvailable: c.isAvailable === undefined ? undefined : Boolean(c.isAvailable),
        }))
      : [],
    slots: Array.isArray(x.slots)
      ? (x.slots as Record<string, unknown>[]).map((s) => ({
          id: (s.id as string) ?? crypto.randomUUID(),
          startMs: toMillis(s.start),
          endMs: toMillis(s.end),
          isAvailable: Boolean(s.isAvailable),
          price: num(s.price),
        }))
      : [],
    ownerUid: (x.ownerUid as string) ?? null,
  } satisfies Pitch;
}

/** The 6-character share code derived from a booking id (matches the app). */
function joinCode(id: string): string {
  const base = id.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return (base + "MAYDAN").slice(0, 6);
}

/** Booking doc to model, mirroring the app's tolerant decoding. */
function mapBooking(id: string, d: Record<string, unknown>): Booking | null {
  if (typeof d.pitchId !== "string") return null;
  const startMs = toMillis(d.startMs ?? d.start);
  const endMs = toMillis(d.endMs ?? d.end);
  if (!startMs || !endMs) return null;
  return {
    id,
    pitchId: d.pitchId,
    pitchName: String(d.pitchName ?? ""),
    customerName: String(d.customerName ?? ""),
    customerPhone: String(d.customerPhone ?? ""),
    partySize: num(d.partySize),
    startMs,
    endMs,
    amount: num(d.amount),
    status: String(d.status ?? "confirmed"),
    playerId: String(d.playerId ?? ""),
    joinCode: typeof d.joinCode === "string" ? d.joinCode : joinCode(id),
    spotsFilled: num(d.spotsFilled, 1),
  };
}

/** The signed-in owner's pitches (Firestore: pitches where ownerUid == uid). */
export async function fetchOwnedPitches(uid: string): Promise<Pitch[]> {
  const d = db();
  if (!d || !uid) return [];
  const snap = await getDocs(query(collection(d, "pitches"), where("ownerUid", "==", uid)));
  return snap.docs.map((doc) => mapPitch(doc.id, doc.data() as Record<string, unknown>));
}

/**
 * Live bookings across the owner's pitches, mirroring the app's
 * `observeOwner` snapshot listener. Firestore `in` queries take at most 10
 * values, so the ids are chunked and the chunk results merged. Returns an
 * unsubscribe function.
 */
export function watchOwnerBookings(
  pitchIds: string[],
  cb: (bookings: Booking[]) => void
): () => void {
  const d = db();
  if (!d || pitchIds.length === 0) {
    cb([]);
    return () => {};
  }
  const chunks: string[][] = [];
  for (let i = 0; i < pitchIds.length; i += 10) chunks.push(pitchIds.slice(i, i + 10));

  const parts = new Map<number, Booking[]>();
  const emit = () => {
    const all: Booking[] = [];
    parts.forEach((items) => all.push(...items));
    all.sort((a, b) => a.startMs - b.startMs);
    cb(all);
  };

  const unsubs = chunks.map((ids, i) =>
    onSnapshot(
      query(collection(d, "bookings"), where("pitchId", "in", ids)),
      (snap) => {
        parts.set(
          i,
          snap.docs
            .map((doc) => mapBooking(doc.id, doc.data() as Record<string, unknown>))
            .filter((b): b is Booking => b !== null)
        );
        emit();
      },
      () => {
        parts.set(i, []);
        emit();
      }
    )
  );
  return () => unsubs.forEach((u) => u());
}

/**
 * Persists a pitch with merge semantics, like the app's
 * `FirebasePitchRepository.save` (setData(merge: true)). Slots are written
 * back as Timestamps so the document keeps the app's schema.
 */
export async function savePitch(pitch: Pitch): Promise<void> {
  const d = db();
  if (!d) throw new Error("Firebase is not configured.");
  const payload: Record<string, unknown> = {
    id: pitch.id,
    name: pitch.name,
    area: pitch.area,
    city: pitch.city,
    surface: pitch.surface,
    size: pitch.size,
    pricePerHour: pitch.pricePerHour,
    rating: pitch.rating,
    reviewCount: pitch.reviewCount,
    tier: pitch.tier,
    amenities: pitch.amenities,
    phone: pitch.phone,
    isIndoor: pitch.isIndoor,
    latitude: pitch.latitude,
    longitude: pitch.longitude,
    distanceKm: pitch.distanceKm,
    accentHex: pitch.accentHex,
    imageURL: pitch.imageURL ?? null,
    ownerUid: pitch.ownerUid ?? null,
    courts: pitch.courts.map((c) => {
      const court: Record<string, unknown> = {
        id: c.id,
        name: c.name,
        attributes: c.attributes,
        pricePerHour: c.pricePerHour,
        isAvailable: c.isAvailable ?? true,
      };
      // Omit `size` when unknown; the app decodes a missing key to a default,
      // but an empty string would fail its enum decoding.
      if (c.size) court.size = c.size;
      return court;
    }),
    slots: pitch.slots.map((s) => ({
      id: s.id,
      start: Timestamp.fromMillis(s.startMs),
      end: Timestamp.fromMillis(s.endMs),
      isAvailable: s.isAvailable,
      price: s.price,
    })),
  };
  await setDoc(doc(d, "pitches", pitch.id), payload, { merge: true });
}

/** Owner action on a booking, via the `updateBookingStatus` callable. */
export async function setBookingStatus(
  bookingId: string,
  status: OwnerBookingStatus
): Promise<void> {
  const f = fns();
  if (!f) throw new Error("Firebase is not configured.");
  await httpsCallable(f, "updateBookingStatus")({ bookingId, status });
}

// ---- Shared hooks for the owner pages ----

/** Loads the pitches owned by `uid` once (with a setter for optimistic edits). */
export function useOwnedPitches(uid: string | null | undefined) {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setPitches([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    fetchOwnedPitches(uid)
      .then((p) => {
        if (alive) {
          setPitches(p);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (alive) {
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [uid]);

  return { pitches, setPitches, loading, error };
}

/** Live bookings across the given pitch ids (empty list when none). */
export function useOwnerBookings(pitchIds: string[]): Booking[] {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const key = pitchIds.join("\n");

  useEffect(() => {
    const ids = key ? key.split("\n") : [];
    return watchOwnerBookings(ids, setBookings);
  }, [key]);

  return bookings;
}
