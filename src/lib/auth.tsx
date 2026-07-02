import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth, firebaseReady } from "./firebase";

type Ctx = { user: User | null; loading: boolean; signOutUser: () => Promise<void> };

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseReady);

  useEffect(() => {
    const a = auth();
    if (!a) return;
    return onAuthStateChanged(a, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const signOutUser = async () => {
    const a = auth();
    if (a) await signOut(a);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOutUser }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): Ctx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
