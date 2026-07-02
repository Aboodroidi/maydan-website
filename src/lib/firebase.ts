import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getFunctions, type Functions } from "firebase/functions";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "maydan-155cd.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "maydan-155cd",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "maydan-155cd.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "177885135855",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** True once the web Firebase config is present (set VITE_FIREBASE_* in env). */
export const firebaseReady = Boolean(config.apiKey && config.projectId && config.appId);

export const mapsKey: string = import.meta.env.VITE_GOOGLE_MAPS_KEY ?? "";
export const mapsReady = Boolean(mapsKey);
export const mapId: string = import.meta.env.VITE_GOOGLE_MAP_ID ?? "";

/** Dev-only key for Maydan AI. Proxy through a backend before production. */
export const openaiKey: string = import.meta.env.VITE_OPENAI_KEY ?? "";

function app(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(config);
}

let cachedDb: Firestore | null = null;
let cachedAuth: Auth | null = null;
let cachedFns: Functions | null = null;

export function db(): Firestore | null {
  if (!firebaseReady) return null;
  if (!cachedDb) cachedDb = getFirestore(app());
  return cachedDb;
}

export function auth(): Auth | null {
  if (!firebaseReady) return null;
  if (!cachedAuth) cachedAuth = getAuth(app());
  return cachedAuth;
}

export function fns(): Functions | null {
  if (!firebaseReady) return null;
  if (!cachedFns) cachedFns = getFunctions(app(), "me-central1");
  return cachedFns;
}
