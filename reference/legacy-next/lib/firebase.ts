import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "maydan-155cd.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "maydan-155cd",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "maydan-155cd.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "177885135855",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True once the web Firebase config is present (set NEXT_PUBLIC_FIREBASE_* in env). */
export const firebaseReady = Boolean(config.apiKey && config.projectId && config.appId);

export const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";
export const mapsReady = Boolean(mapsKey);
export const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID ?? "";

let cachedDb: Firestore | null = null;

export function db(): Firestore | null {
  if (!firebaseReady) return null;
  const app: FirebaseApp = getApps().length ? getApp() : initializeApp(config);
  if (!cachedDb) cachedDb = getFirestore(app);
  return cachedDb;
}
