import { NavLink, Outlet, Link } from "react-router-dom";
import { useLang } from "../lib/i18n";

const ICONS = {
  // simple line icons (24x24 paths)
  discover: "M12 2C7.6 2 4 5.6 4 10c0 5.2 8 12 8 12s8-6.8 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z",
  bookings: "M7 2v3M17 2v3M3 8h18M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z",
  ai: "M3 6a1 1 0 011-1h16a1 1 0 011 1v10a1 1 0 01-1 1H7l-4 4V6zM8 9.5h8M8 12.5h5",
  owner: "M4 20V10M10 20V4M16 20v-8M22 20H2",
  profile: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
} as const;

type Item = { to: string; icon: keyof typeof ICONS; en: string; ar: string; end?: boolean };

const ITEMS: Item[] = [
  { to: "/", icon: "discover", en: "Discover", ar: "اكتشف", end: true },
  { to: "/bookings", icon: "bookings", en: "Bookings", ar: "الحجوزات" },
  { to: "/ai", icon: "ai", en: "Maydan AI", ar: "ميدان AI" },
  { to: "/owner", icon: "owner", en: "Owner", ar: "لوحة المالك" },
  { to: "/profile", icon: "profile", en: "Profile", ar: "الملف" },
];

export function Shell() {
  const { ar, toggle } = useLang();

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <aside className="flex w-[76px] shrink-0 flex-col items-center border-e border-border bg-bg-soft py-5 lg:w-60 lg:items-stretch lg:px-4">
        <Link to="/" className="mb-8 flex items-center justify-center lg:justify-start lg:px-2">
          <img src="/assets/img/logo_electric_blue.svg" alt="Maydan" className="h-8 w-8 lg:hidden" />
          <img src="/assets/img/wordmark_white.svg" alt="Maydan" className="hidden h-7 w-auto lg:block" />
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {ITEMS.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `navlink flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold ${
                  isActive ? "bg-surface text-ink" : "text-muted hover:bg-surface/60 hover:text-ink"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={isActive ? "text-electric-bright" : ""}
                  >
                    <path d={ICONS[it.icon]} />
                  </svg>
                  <span className="hidden lg:inline">{ar ? it.ar : it.en}</span>
                </>
              )}
            </NavLink>
          ))}
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

      <main className="min-w-0 flex-1 overflow-y-auto scroll-thin">
        <Outlet />
      </main>
    </div>
  );
}
