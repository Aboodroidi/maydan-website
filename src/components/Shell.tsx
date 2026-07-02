import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { useLang } from "../lib/i18n";
import { useAuth } from "../lib/auth";

const ICONS = {
  // simple line icons (24x24 paths)
  home: "M3 10.5L12 3l9 7.5M5 9.5V20a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V9.5",
  discover: "M12 2C7.6 2 4 5.6 4 10c0 5.2 8 12 8 12s8-6.8 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z",
  bookings: "M7 2v3M17 2v3M3 8h18M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z",
  ai: "M3 6a1 1 0 011-1h16a1 1 0 011 1v10a1 1 0 01-1 1H7l-4 4V6zM8 9.5h8M8 12.5h5",
  owner: "M4 20V10M10 20V4M16 20v-8M22 20H2",
} as const;

type Item = { to: string; icon: keyof typeof ICONS; en: string; ar: string; end?: boolean };

const ITEMS: Item[] = [
  { to: "/", icon: "home", en: "Home", ar: "الرئيسية", end: true },
  { to: "/discover", icon: "discover", en: "Discover", ar: "اكتشف" },
  { to: "/bookings", icon: "bookings", en: "Bookings", ar: "الحجوزات" },
  { to: "/ai", icon: "ai", en: "Maydan AI", ar: "ميدان AI" },
  { to: "/owner", icon: "owner", en: "Owner", ar: "لوحة المالك" },
];

export function Shell() {
  const { ar, toggle } = useLang();
  const { user } = useAuth();
  const location = useLocation();
  const onProfile = location.pathname.startsWith("/profile");

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <header
        className="z-20 shadow-[0_2px_24px_rgba(29,78,216,0.28)]"
        style={{ background: "linear-gradient(180deg, #2f6af0, #1d4ed8)" }}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center" aria-label="Maydan home">
            <img src="/assets/img/wordmark_white.svg" alt="Maydan" className="hidden h-11 w-auto sm:block" />
            <img src="/assets/img/logo_white.svg" alt="Maydan" className="h-9 w-9 sm:hidden" />
          </Link>

          {/* Primary nav: pills on desktop, icon row on mobile */}
          <nav className="mx-auto flex items-center gap-1 overflow-x-auto rounded-full sm:gap-1.5">
            {ITEMS.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                className={({ isActive }) =>
                  `navlink flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-[14.5px] font-bold sm:px-4 ${
                    isActive
                      ? "bg-white text-electric shadow-sm"
                      : "text-white/85 hover:bg-white/15 hover:text-white"
                  }`
                }
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={ICONS[it.icon]} />
                </svg>
                <span className="hidden lg:inline">{ar ? it.ar : it.en}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={toggle}
              className="navlink rounded-full border border-white/35 px-3 py-1.5 text-[13px] font-bold text-white hover:bg-white/15"
              aria-label="Toggle language"
            >
              {ar ? "EN" : "ع"}
            </button>

            {user ? (
              <Link
                to="/profile"
                aria-label={ar ? "الملف" : "Profile"}
                className={`navlink flex h-9 w-9 items-center justify-center rounded-full bg-white text-[14px] font-black text-electric ${
                  onProfile ? "ring-2 ring-white ring-offset-2 ring-offset-electric-bright" : ""
                }`}
              >
                {(user.displayName?.[0] ?? user.phoneNumber?.slice(-2) ?? "M").toUpperCase()}
              </Link>
            ) : (
              <Link
                to="/signin"
                className="btn !bg-white !px-4 !py-2 !text-[13.5px] !text-electric hover:!bg-white/90"
              >
                {ar ? "تسجيل الدخول" : "Sign in"}
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="min-w-0 flex-1 overflow-y-auto scroll-thin">
        <Outlet />
      </main>
    </div>
  );
}
