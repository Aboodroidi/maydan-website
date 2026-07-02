"use client";

import { useLang } from "@/components/LangProvider";

export type AppView = "discover" | "bookings" | "owner" | "profile";

const ICONS: Record<AppView, string> = {
  // simple line icons (24x24 paths)
  discover: "M12 2C7.6 2 4 5.6 4 10c0 5.2 8 12 8 12s8-6.8 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z",
  bookings: "M7 2v3M17 2v3M3 8h18M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z",
  owner: "M4 20V10M10 20V4M16 20v-8M22 20H2",
  profile: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
};

export function Sidebar({ view, onSelect }: { view: AppView; onSelect: (v: AppView) => void }) {
  const { lang, toggle } = useLang();
  const ar = lang === "ar";

  const items: { key: AppView; label: string }[] = [
    { key: "discover", label: ar ? "اكتشف" : "Discover" },
    { key: "bookings", label: ar ? "الحجوزات" : "Bookings" },
    { key: "owner", label: ar ? "لوحة المالك" : "Owner" },
    { key: "profile", label: ar ? "الملف" : "Profile" },
  ];

  return (
    <aside className="flex w-[76px] shrink-0 flex-col items-center border-e border-border bg-bg-soft py-5 lg:w-60 lg:items-stretch lg:px-4">
      <a href="/" className="mb-8 flex items-center justify-center lg:justify-start lg:px-2">
        <img src="/assets/img/logo_electric_blue.svg" alt="Maydan" className="h-8 w-8 lg:hidden" />
        <img src="/assets/img/wordmark_white.svg" alt="Maydan" className="hidden h-7 w-auto lg:block" />
      </a>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((it) => {
          const active = view === it.key;
          return (
            <button
              key={it.key}
              onClick={() => onSelect(it.key)}
              aria-current={active ? "page" : undefined}
              className={`navlink flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold ${
                active ? "bg-surface text-ink" : "text-muted hover:bg-surface/60 hover:text-ink"
              }`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-electric-bright" : ""}>
                <path d={ICONS[it.key]} />
              </svg>
              <span className="hidden lg:inline">{it.label}</span>
            </button>
          );
        })}
      </nav>

      <button
        onClick={toggle}
        className="mt-4 rounded-xl border border-border px-3 py-2.5 text-sm font-bold text-muted hover:text-ink"
        aria-label="Toggle language"
      >
        <span className="lg:hidden">{ar ? "EN" : "ع"}</span>
        <span className="hidden lg:inline">{ar ? "English" : "العربية"}</span>
      </button>
    </aside>
  );
}
