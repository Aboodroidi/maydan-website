/** Mirrors the app's Pitch model (Firestore `pitches` collection). */
export interface Court {
  id: string;
  name: string;
  attributes: string[];
  pricePerHour: number;
  size?: string;
  isAvailable?: boolean;
}

/** A bookable time window on a pitch (Timestamps flattened to millis). */
export interface Slot {
  id: string;
  startMs: number;
  endMs: number;
  isAvailable: boolean;
  price: number;
}

export interface Pitch {
  id: string;
  name: string;
  area: string;
  city: string;
  surface: string;
  size: string;
  pricePerHour: number;
  rating: number;
  reviewCount: number;
  tier: string;
  amenities: string[];
  phone: string;
  isIndoor: boolean;
  latitude: number;
  longitude: number;
  distanceKm: number;
  accentHex: number;
  imageURL?: string | null;
  courts: Court[];
  slots: Slot[];
  ownerUid?: string | null;
}

/** Mirrors the app's Booking model (Firestore `bookings` collection). */
export interface Booking {
  id: string;
  pitchId: string;
  pitchName: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  startMs: number;
  endMs: number;
  amount: number;
  status: string;
  playerId: string;
  joinCode: string;
  spotsFilled: number;
}
