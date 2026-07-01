import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import type { Pitch } from "./types";

/** Reads the live `pitches` collection (public per Firestore rules). */
export async function fetchPitches(): Promise<Pitch[]> {
  const d = db();
  if (!d) return [];
  const snap = await getDocs(collection(d, "pitches"));
  return snap.docs.map((doc) => {
    const x = doc.data() as Record<string, unknown>;
    const num = (v: unknown, fallback = 0) => (typeof v === "number" ? v : Number(v) || fallback);
    return {
      id: (x.id as string) ?? doc.id,
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
          }))
        : [],
    } satisfies Pitch;
  });
}

/** OMR price formatter matching the app (1 decimal). */
export function omr(v: number): string {
  return `OMR ${v.toFixed(1)}`;
}
