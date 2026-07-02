import { NavLink, Outlet, Link } from "react-router-dom";
import { firebaseReady } from "../../lib/firebase";
import { useAuth } from "../../lib/auth";
import { useLang } from "../../lib/i18n";
import { SetupNotice } from "../SetupNotice";

type NavItem = { to: string; end?: boolean; en: string; ar: string; icon: string };

const NAV: NavItem[] = [
  {
    to: "/owner",
    end: true,
    en: "Dashboard",
    ar: "لوحة التحكم",
    icon: "M4 20V10M10 20V4M16 20v-8M22 20H2",
  },
  {
    to: "/owner/bookings",
    en: "Bookings",
    ar: "الحجوزات",
    icon: "M7 2v3M17 2v3M3 8h18M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z",
  },
  {
    to: "/owner/pitches",
    en: "Pitches",
    ar: "الملاعب",
    icon: "M12 2C7.6 2 4 5.6 4 10c0 5.2 8 12 8 12s8-6.8 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z",
  },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

/**
 * Owner area shell, modeled on the Shopify admin: a secondary left sidebar
 * (owner sections) under the global blue top header, with the active page in
 * the main column. Handles the Firebase / auth gating so the child pages can
 * assume a signed in owner.
 */
export default function OwnerLayout() {
  const { ar } = useLang();
  const { user, loading } = useAuth();

  if (!firebaseReady) {
    return (
      <SetupNotice
        title={ar ? "اربط قاعدة بيانات Firebase" : "Connect the Firebase database"}
        body={
          ar
            ? "أضف مفاتيح VITE_FIREBASE_* إلى ملف البيئة ثم أعد التحميل لعرض أدوات المالك."
            : "Add the VITE_FIREBASE_* keys to your env file and reload to open the owner tools."
        }
      />
    );
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1400px] space-y-4 px-4 py-6 sm:px-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-2" />
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-2" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-surface-2" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid h-full place-items-center p-8">
        <div className="card max-w-md p-7 text-center fade-up">
          <h1 className="text-lg font-bold">
            {ar ? "سجل الدخول لإدارة ملاعبك" : "Sign in to manage your pitches"}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {ar
              ? "أدوات المالك تتطلب حساباً مسجلاً. سجل الدخول بنفس حساب التطبيق."
              : "Owner tools need a signed in account. Use the same account as the iOS app."}
          </p>
          <Link to="/signin?next=/owner" className="btn btn-primary mt-5">
            {ar ? "تسجيل الدخول" : "Sign in"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full">
      {/* Secondary sidebar (Shopify-style), collapses to an icon rail on lg- */}
      <aside className="shrink-0 border-e border-border bg-surface lg:w-60">
        <nav className="scroll-thin sticky top-0 flex max-h-full flex-col gap-1 overflow-y-auto p-2 lg:p-3">
          <p className="hidden px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-muted lg:block">
            {ar ? "أدوات المالك" : "Owner tools"}
          </p>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={ar ? item.ar : item.en}
              className={({ isActive }) =>
                `navlink flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] font-bold ${
                  isActive
                    ? "bg-electric/10 text-electric"
                    : "text-muted hover:bg-surface-2 hover:text-ink"
                }`
              }
            >
              <NavIcon d={item.icon} />
              <span className="hidden lg:inline">{ar ? item.ar : item.en}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 overflow-y-auto scroll-thin">
        <Outlet />
      </div>
    </div>
  );
}
