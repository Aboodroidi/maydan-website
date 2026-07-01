/** Mirrors the app's Pitch model (Firestore `pitches` collection). */
export interface Court {
  id: string;
  name: string;
  attributes: string[];
  pricePerHour: number;
  size?: string;
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
}
