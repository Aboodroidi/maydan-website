"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { dict, type Dict, type Lang } from "@/lib/i18n";

type Ctx = { lang: Lang; t: Dict; toggle: () => void; setLang: (l: Lang) => void };

const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Restore saved choice on mount.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("maydan_lang");
    } catch {}
    if (saved === "ar") setLangState("ar");
  }, []);

  // Keep <html lang/dir> and storage in sync.
  useEffect(() => {
    const el = document.documentElement;
    el.lang = lang;
    el.dir = dict[lang].dir;
    try {
      localStorage.setItem("maydan_lang", lang);
    } catch {}
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const toggle = () => setLangState((l) => (l === "ar" ? "en" : "ar"));

  return (
    <LangContext.Provider value={{ lang, t: dict[lang], toggle, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
