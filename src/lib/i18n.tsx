import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";

type Ctx = { lang: Lang; ar: boolean; toggle: () => void };

const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  // Restore saved choice on mount.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("maydan_lang");
    } catch {}
    if (saved === "ar") setLang("ar");
  }, []);

  // Keep <html lang/dir> and storage in sync.
  useEffect(() => {
    const el = document.documentElement;
    el.lang = lang;
    el.dir = lang === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem("maydan_lang", lang);
    } catch {}
  }, [lang]);

  const toggle = () => setLang((l) => (l === "ar" ? "en" : "ar"));

  return (
    <LangContext.Provider value={{ lang, ar: lang === "ar", toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
