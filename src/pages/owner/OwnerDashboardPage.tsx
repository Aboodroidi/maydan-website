import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { firebaseReady } from "../../lib/firebase";
import { useAuth } from "../../lib/auth";
import { useLang } from "../../lib/i18n";
import { omr } from "../../lib/data";
import { setBookingStatus, useOwnedPitches, useOwnerBookings } from "../../lib/owner";
import type { Booking } from "../../lib/types";
import { SetupNotice } from "../../components/SetupNotice";

const DAY_MS = 86_400_000;

function fmtDate(ms: number, ar: boolean): string {
  return new Intl.DateTimeFormat(ar ? "ar" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(ms));
}

function fmtTime(ms: number, ar: boolean): string {
  return new Intl.DateTimeFormat(ar ? "ar" : "en-GB", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(ms));
}

function StatusPill({ status, ar }: { status: string; ar: boolean }) {
  const label =
    status === "cancelled"
      ? ar
        ? "ملغي"
        : "Cancelled"
      : status === "completed"
        ? ar
          ? "مكتمل"
          : "Completed"
        : ar
          ? "مؤكد"
          : "Confirmed";
  const tone =
    status === "cancelled"
      ? "bg-red-500/10 text-red-400"
      : status === "completed"
        ? "bg-white/10 text-muted"
        : "bg-electric/15 text-electric-bright";
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${tone}`}>
      {label}
    </span>
  );
}

const TOOLTIP_STYLE = {
  background: "#131c2e",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  fontSize: 12,
} as const;

export default function OwnerDashboardPage() {
  const { ar } = useLang();
  const { user, loading: authLoading } = useAuth();
  const { pitches, loading: pitchesLoading, error } = useOwnedPitches(user?.uid);
  const pitchIds = useMemo(() => pitches.map((p) => p.id), [pitches]);
  const bookings = useOwnerBookings(pitchIds);

  const stats = useMemo(() => {
    const now = Date.now();
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
    const nextMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getTime();
    const monthOnly = bookings.filter(
      (b) => b.status !== "cancelled" && b.startMs >= monthStart && b.startMs < nextMonthStart
    );
    const upcoming = bookings.filter((b) => b.status === "confirmed" && b.endMs >= now);
    // Rough occupancy: booked upcoming slots over total upcoming slots.
    let totalSlots = 0;
    let bookedSlots = 0;
    for (const p of pitches) {
      for (const s of p.slots) {
        if (s.startMs >= now) {
          totalSlots += 1;
          if (!s.isAvailable) bookedSlots += 1;
        }
      }
    }
    return {
      bookingsThisMonth: monthOnly.length,
      revenueThisMonth: monthOnly.reduce((sum, b) => sum + b.amount, 0),
      upcomingCount: upcoming.length,
      occupancy: totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0,
    };
  }, [bookings, pitches]);

  // Last 14 days: bookings per day + revenue per day (cancelled excluded).
  const chartData = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(ar ? "ar" : "en-GB", { day: "numeric", month: "short" });
    const out: { day: string; bookings: number; revenue: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const start = d.getTime();
      const end = start + DAY_MS;
      const dayBookings = bookings.filter(
        (b) => b.status !== "cancelled" && b.startMs >= start && b.startMs < end
      );
      out.push({
        day: fmt.format(d),
        bookings: dayBookings.length,
        revenue: Math.round(dayBookings.reduce((sum, b) => sum + b.amount, 0) * 10) / 10,
      });
    }
    return out;
  }, [bookings, ar]);

  const recent = useMemo(
    () => [...bookings].sort((a, b) => b.startMs - a.startMs).slice(0, 6),
    [bookings]
  );

  if (!firebaseReady) {
    return (
      <SetupNotice
        title={ar ? "اربط قاعدة بيانات Firebase" : "Connect the Firebase database"}
        body={
          ar
            ? "أضف مفاتيح VITE_FIREBASE_* إلى ملف البيئة ثم أعد التحميل لعرض لوحة المالك."
            : "Add the VITE_FIREBASE_* keys to your env file and reload to see the owner dashboard."
        }
      />
    );
  }

  if (authLoading) {
    return <p className="p-8 text-sm text-muted">{ar ? "جارٍ التحميل…" : "Loading…"}</p>;
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
          <Link to="/signin" className="btn btn-primary mt-5">
            {ar ? "تسجيل الدخول" : "Sign in"}
          </Link>
        </div>
      </div>
    );
  }

  if (pitchesLoading) {
    return <p className="p-8 text-sm text-muted">{ar ? "جارٍ التحميل…" : "Loading…"}</p>;
  }

  if (pitches.length === 0) {
    return (
      <div className="grid h-full place-items-center p-8">
        <div className="card max-w-md p-7 text-center fade-up">
          <h1 className="text-lg font-bold">{ar ? "لا توجد ملاعب" : "No pitches yet"}</h1>
          <p className="mt-3 text-sm text-muted">
            {ar
              ? "لا توجد ملاعب مرتبطة بهذا الحساب بعد. أدر ملاعبك من تطبيق iOS أو تواصل مع ميدان."
              : "No pitches linked to this account yet. Manage pitches from the iOS app or contact Maydan."}
          </p>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: ar ? "حجوزات هذا الشهر" : "Bookings this month",
      value: String(stats.bookingsThisMonth),
    },
    {
      label: ar ? "إيرادات هذا الشهر" : "Revenue this month",
      value: omr(stats.revenueThisMonth),
    },
    { label: ar ? "الحجوزات القادمة" : "Upcoming", value: String(stats.upcomingCount) },
    { label: ar ? "الإشغال" : "Occupancy", value: `${stats.occupancy}%` },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6 lg:p-8 fade-up">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-extrabold">{ar ? "لوحة المالك" : "Owner dashboard"}</h1>
        <p className="text-sm text-muted">
          {ar ? `عبر ${pitches.length} ملاعب` : `Across ${pitches.length} pitches`}
        </p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-[13px] text-muted">{s.label}</p>
            <p className="mt-1 truncate text-2xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-sm font-bold text-muted">
            {ar ? "الحجوزات اليومية، آخر 14 يوماً" : "Bookings per day, last 14 days"}
          </h2>
          <div dir="ltr" className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#8a97ad", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#8a97ad", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ color: "#8a97ad" }}
                  itemStyle={{ color: "#f3f6fc" }}
                  cursor={{ fill: "rgba(37,99,235,0.1)" }}
                />
                <Bar
                  dataKey="bookings"
                  name={ar ? "الحجوزات" : "Bookings"}
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={26}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-bold text-muted">
            {ar ? "الإيرادات، آخر 14 يوماً (ر.ع)" : "Revenue, last 14 days (OMR)"}
          </h2>
          <div dir="ltr" className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#8a97ad", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "#8a97ad", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ color: "#8a97ad" }}
                  itemStyle={{ color: "#f3f6fc" }}
                  cursor={{ stroke: "rgba(255,255,255,0.15)" }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name={ar ? "الإيرادات" : "Revenue"}
                  stroke="#4f7bf7"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: "#4f7bf7" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <section className="card p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-base font-bold">{ar ? "أحدث الحجوزات" : "Recent bookings"}</h2>
          <Link to="/owner/bookings" className="text-sm font-semibold text-electric-bright">
            {ar ? "عرض الكل" : "See all"}
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            {ar ? "لا توجد حجوزات بعد." : "No bookings yet."}
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[color:var(--color-border)]">
            {recent.map((b: Booking) => (
              <li key={b.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">
                    {b.customerName || (ar ? "زائر" : "Guest")}
                  </p>
                  <p className="mt-0.5 truncate text-[13px] text-muted">
                    {b.pitchName} · {fmtDate(b.startMs, ar)} · {fmtTime(b.startMs, ar)}{" "}
                    {ar ? "إلى" : "to"} {fmtTime(b.endMs, ar)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-electric-bright">
                  {omr(b.amount)}
                </span>
                <StatusPill status={b.status} ar={ar} />
                {b.status === "confirmed" && (
                  <button
                    className="btn btn-ghost shrink-0 !px-3 !py-1.5 !text-[12px]"
                    onClick={() => void setBookingStatus(b.id, "cancelled").catch(() => {})}
                  >
                    {ar ? "إلغاء" : "Cancel"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
