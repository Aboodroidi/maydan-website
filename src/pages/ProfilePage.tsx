import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useLang } from "../lib/i18n";
import { firebaseReady } from "../lib/firebase";
import { SetupNotice } from "../components/SetupNotice";

const ICONS = {
  bookings: "M7 2v3M17 2v3M3 8h18M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z",
  owner: "M4 20V10M10 20V4M16 20v-8M22 20H2",
  globe: "M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z",
  support: "M12 21a9 9 0 100-18 9 9 0 000 18zM9.2 9a2.8 2.8 0 015.5.7c0 1.8-2.7 2.3-2.7 3.8M12 17h.01",
  privacy: "M12 2l8 3.5V11c0 5-3.4 8.8-8 11-4.6-2.2-8-6-8-11V5.5L12 2z",
  terms: "M6 2h9l5 5v15a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1zM14 2v6h6M9 13h6M9 17h6",
} as const;

function RowIcon({ path }: { path: string }) {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-muted">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={path} />
      </svg>
    </span>
  );
}

function Chevron() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-muted rtl:-scale-x-100"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function LinkRow({ to, icon, label }: { to: string; icon: keyof typeof ICONS; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-2/60">
      <RowIcon path={ICONS[icon]} />
      <span className="flex-1 text-[15px] font-semibold">{label}</span>
      <Chevron />
    </Link>
  );
}

function Rows({ children }: { children: ReactNode }) {
  return <div className="card divide-y divide-border overflow-hidden">{children}</div>;
}

function formatPhone(e164: string): string {
  if (e164.startsWith("+968") && e164.length === 12) {
    return `+968 ${e164.slice(4, 8)} ${e164.slice(8)}`;
  }
  return e164;
}

export default function ProfilePage() {
  const { user, loading, signOutUser } = useAuth();
  const { ar, toggle } = useLang();

  if (!firebaseReady) {
    return (
      <SetupNotice
        title={ar ? "الحساب غير مفعل" : "Accounts are not configured"}
        body={
          ar
            ? "أضف مفاتيح Firebase في متغيرات البيئة (VITE_FIREBASE_*) لتفعيل الحسابات."
            : "Add the Firebase web keys (VITE_FIREBASE_*) to the environment to enable accounts."
        }
      />
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="card animate-pulse p-7">
          <div className="mx-auto h-16 w-16 rounded-full bg-surface-2" />
          <div className="mx-auto mt-4 h-4 w-40 rounded bg-surface-2" />
          <div className="mx-auto mt-2 h-3 w-28 rounded bg-surface-2" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid min-h-full place-items-center px-4 py-10 sm:px-6">
        <div className="card fade-up w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-electric/10 text-electric">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" />
            </svg>
          </div>
          <h1 className="text-xl font-black tracking-tight">{ar ? "سجل الدخول" : "Sign in"}</h1>
          <p className="mt-2 text-sm text-muted">
            {ar
              ? "سجل الدخول لعرض ملفك وإدارة حجوزاتك."
              : "Sign in to see your profile and manage your bookings."}
          </p>
          <Link to="/signin?next=/profile" className="btn btn-primary mt-6 w-full">
            {ar ? "تسجيل الدخول" : "Sign in"}
          </Link>
        </div>
      </div>
    );
  }

  const name = user.displayName ?? "";
  const initial = (name || user.email || "").trim().charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-xl space-y-5 px-4 py-8 sm:px-6 lg:py-10">
      {/* Identity */}
      <div className="card fade-up p-7 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-electric/10 text-2xl font-extrabold text-electric">
          {initial || (
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" />
            </svg>
          )}
        </div>
        <h1 className="mt-3 text-xl font-black tracking-tight">{name || (ar ? "لاعب ميدان" : "Maydan player")}</h1>
        <div className="mt-1 space-y-0.5 text-sm text-muted">
          {user.phoneNumber && <p dir="ltr">{formatPhone(user.phoneNumber)}</p>}
          {user.email && <p dir="ltr">{user.email}</p>}
        </div>
      </div>

      {/* Activity */}
      <Rows>
        <LinkRow to="/bookings" icon="bookings" label={ar ? "حجوزاتي" : "My bookings"} />
        <LinkRow to="/owner" icon="owner" label={ar ? "لوحة المالك" : "Owner dashboard"} />
      </Rows>

      {/* Preferences */}
      <Rows>
        <button type="button" onClick={toggle} className="flex w-full items-center gap-3 px-5 py-3.5 text-start hover:bg-surface-2/60">
          <RowIcon path={ICONS.globe} />
          <span className="flex-1 text-[15px] font-semibold">{ar ? "اللغة" : "Language"}</span>
          <span className="text-sm font-bold text-electric-bright">{ar ? "English" : "العربية"}</span>
        </button>
      </Rows>

      {/* About */}
      <Rows>
        <LinkRow to="/support" icon="support" label={ar ? "الدعم" : "Support"} />
        <LinkRow to="/privacy" icon="privacy" label={ar ? "سياسة الخصوصية" : "Privacy policy"} />
        <LinkRow to="/terms" icon="terms" label={ar ? "الشروط والأحكام" : "Terms of service"} />
      </Rows>

      <button
        type="button"
        onClick={() => void signOutUser()}
        className="btn w-full bg-surface text-red-600 ring-1 ring-red-200 ring-inset hover:bg-red-50 hover:text-red-700"
      >
        {ar ? "تسجيل الخروج" : "Sign out"}
      </button>
    </div>
  );
}
