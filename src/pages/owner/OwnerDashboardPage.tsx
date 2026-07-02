import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../../lib/auth";
import { useLang } from "../../lib/i18n";
import { omr } from "../../lib/data";
import { setBookingStatus, useOwnedPitches, useOwnerBookings } from "../../lib/owner";
import type { Booking } from "../../lib/types";

const DAY_MS = 86_400_000;
const PERIOD_DAYS = 30;

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

function fmtRange(startMs: number, endMs: number, ar: boolean): string {
  const fmt = new Intl.DateTimeFormat(ar ? "ar" : "en-GB", { day: "numeric", month: "short" });
  return `${fmt.format(new Date(startMs))} – ${fmt.format(new Date(endMs))}`;
}

/** Percentage change of `curr` vs `prev`; null when there is no baseline. */
function pctDelta(curr: number, prev: number): number | null {
  if (prev === 0) return curr === 0 ? 0 : null;
  return Math.round(((curr - prev) / prev) * 100);
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
      ? "bg-red-600/10 text-red-600"
      : status === "completed"
        ? "bg-ink/5 text-muted"
        : "bg-electric/10 text-electric";
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${tone}`}>
      {label}
    </span>
  );
}

/** A small up/down/flat delta chip: green up, red down, muted flat. */
function Delta({ value, ar }: { value: number | null; ar: boolean }) {
  if (value === null) {
    return <span className="text-[12px] font-semibold text-muted">{ar ? "جديد" : "New"}</span>;
  }
  const up = value > 0;
  const down = value < 0;
  const tone = up ? "text-emerald-600" : down ? "text-red-600" : "text-muted";
  const arrow = up ? "M12 5v14M5 12l7-7 7 7" : down ? "M12 19V5M5 12l7 7 7-7" : "M5 12h14";
  return (
    <span className={`inline-flex items-center gap-1 text-[12px] font-bold ${tone}`}>
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={arrow} />
      </svg>
      <span dir="ltr">{`${up ? "+" : ""}${value}%`}</span>
    </span>
  );
}

const TOOLTIP_STYLE = {
  background: "#ffffff",
  border: "1px solid rgba(13,27,50,0.09)",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "0 4px 10px rgba(13,27,50,0.05), 0 16px 36px rgba(37,99,235,0.14)",
} as const;

const GRID_STROKE = "rgba(13,27,50,0.08)";
const TICK_FILL = "#5c6b84";

export default function OwnerDashboardPage() {
  const { ar } = useLang();
  const { user } = useAuth();
  const { pitches, error } = useOwnedPitches(user?.uid);
  const pitchIds = useMemo(() => pitches.map((p) => p.id), [pitches]);
  const bookings = useOwnerBookings(pitchIds);

  const venueName = useMemo(() => {
    if (pitches.length === 1) return pitches[0].name;
    return ar ? `${pitches.length} ملاعب` : `${pitches.length} pitches`;
  }, [pitches, ar]);

  // Current 30 days vs the prior 30 days, computed from real bookings.
  const metrics = useMemo(() => {
    const now = Date.now();
    const currStart = now - PERIOD_DAYS * DAY_MS;
    const prevStart = now - 2 * PERIOD_DAYS * DAY_MS;

    const live = bookings.filter((b) => b.status !== "cancelled");
    const inRange = (b: Booking, lo: number, hi: number) => b.startMs >= lo && b.startMs < hi;
    const curr = live.filter((b) => inRange(b, currStart, now));
    const prev = live.filter((b) => inRange(b, prevStart, currStart));

    const revenue = (list: Booking[]) => list.reduce((sum, b) => sum + b.amount, 0);
    const upcomingNow = bookings.filter((b) => b.status === "confirmed" && b.endMs >= now).length;
    const upcomingPrev = bookings.filter(
      (b) => b.status === "confirmed" && b.endMs >= currStart && b.endMs < now
    ).length;

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
    const occupancy = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

    return {
      bookings: { value: curr.length, delta: pctDelta(curr.length, prev.length) },
      revenue: {
        value: revenue(curr),
        delta: pctDelta(revenue(curr), revenue(prev)),
      },
      upcoming: { value: upcomingNow, delta: pctDelta(upcomingNow, upcomingPrev) },
      occupancy: { value: occupancy, delta: null as number | null },
      currStart,
      prevStart,
      now,
    };
  }, [bookings, pitches]);

  // Daily revenue for the current period plus the aligned prior period, so the
  // chart can draw two overlaid series (Shopify's "sales over time").
  const chart = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(ar ? "ar" : "en-GB", { day: "numeric", month: "short" });
    const live = bookings.filter((b) => b.status !== "cancelled");
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const todayStart = dayStart.getTime();

    const revenueOn = (start: number) => {
      const end = start + DAY_MS;
      return (
        Math.round(
          live
            .filter((b) => b.startMs >= start && b.startMs < end)
            .reduce((sum, b) => sum + b.amount, 0) * 10
        ) / 10
      );
    };

    const rows: { day: string; current: number; previous: number }[] = [];
    for (let i = PERIOD_DAYS - 1; i >= 0; i--) {
      const currDay = todayStart - i * DAY_MS;
      const prevDay = currDay - PERIOD_DAYS * DAY_MS;
      rows.push({
        day: fmt.format(new Date(currDay)),
        current: revenueOn(currDay),
        previous: revenueOn(prevDay),
      });
    }

    const currTotal = rows.reduce((s, r) => s + r.current, 0);
    const prevTotal = rows.reduce((s, r) => s + r.previous, 0);
    return {
      rows,
      currTotal: Math.round(currTotal * 10) / 10,
      delta: pctDelta(currTotal, prevTotal),
      currLabel: fmtRange(todayStart - (PERIOD_DAYS - 1) * DAY_MS, todayStart, ar),
      prevLabel: fmtRange(
        todayStart - (2 * PERIOD_DAYS - 1) * DAY_MS,
        todayStart - PERIOD_DAYS * DAY_MS,
        ar
      ),
    };
  }, [bookings, ar]);

  const recent = useMemo(
    () => [...bookings].sort((a, b) => b.startMs - a.startMs).slice(0, 6),
    [bookings]
  );

  // This-week insight numbers for the action cards.
  const week = useMemo(() => {
    const now = Date.now();
    const weekStart = now - 7 * DAY_MS;
    const live = bookings.filter(
      (b) => b.status !== "cancelled" && b.startMs >= weekStart && b.startMs <= now
    );
    return {
      count: live.length,
      revenue: live.reduce((sum, b) => sum + b.amount, 0),
      confirmed: bookings.filter((b) => b.status === "confirmed" && b.endMs >= now).length,
    };
  }, [bookings]);

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
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: ar ? "الحجوزات" : "Bookings",
      value: String(metrics.bookings.value),
      delta: metrics.bookings.delta,
    },
    {
      label: ar ? "الإيرادات" : "Revenue",
      value: omr(metrics.revenue.value),
      delta: metrics.revenue.delta,
    },
    {
      label: ar ? "القادمة" : "Upcoming",
      value: String(metrics.upcoming.value),
      delta: metrics.upcoming.delta,
    },
    {
      label: ar ? "الإشغال" : "Occupancy",
      value: `${metrics.occupancy.value}%`,
      delta: metrics.occupancy.delta,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-6 sm:px-6 fade-up">
      {/* Title row */}
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            {ar ? "لوحة التحكم" : "Dashboard"}
          </h1>
          <p className="mt-1 text-sm text-muted">{venueName}</p>
        </div>
        <span className="chip !cursor-default" data-active="true">
          {ar ? "آخر 30 يوماً" : "Last 30 days"}
        </span>
      </header>

      {/* Metrics bar: one card, four KPI cells with real deltas */}
      <div className="card grid grid-cols-2 divide-border p-0 sm:grid-cols-4 sm:divide-x sm:[&>*:not(:first-child)]:border-s">
        {kpis.map((k, i) => (
          <div
            key={k.label}
            className={`p-5 ${i < 2 ? "border-b border-border sm:border-b-0" : ""} ${
              i % 2 === 1 ? "border-s border-border sm:border-s-0" : ""
            }`}
          >
            <p className="text-[13px] font-semibold text-muted">{k.label}</p>
            <p className="mt-1 truncate text-2xl font-black tracking-tight">{k.value}</p>
            <div className="mt-1.5">
              <Delta value={k.delta} ar={ar} />
            </div>
          </div>
        ))}
      </div>

      {/* Revenue over time: two series, current (solid) vs previous (dashed) */}
      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-muted">
              {ar ? "الإيرادات عبر الوقت" : "Revenue over time"}
            </h2>
            <div className="mt-1 flex items-baseline gap-2.5">
              <p className="text-2xl font-black tracking-tight sm:text-3xl">
                {omr(chart.currTotal)}
              </p>
              <Delta value={chart.delta} ar={ar} />
            </div>
          </div>
          {/* Legend: current vs previous date ranges */}
          <div className="flex flex-col gap-1.5 text-[12px] font-semibold text-muted">
            <span className="inline-flex items-center gap-2">
              <span className="h-0.5 w-5 rounded-full bg-electric" />
              <span dir="ltr">{chart.currLabel}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-0 w-5 rounded-full border-t-2 border-dashed border-[#93b4fb]" />
              <span dir="ltr">{chart.prevLabel}</span>
            </span>
          </div>
        </div>

        <div dir="ltr" className="mt-5 h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart.rows} margin={{ top: 4, right: 6, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={GRID_STROKE} vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: TICK_FILL, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={28}
              />
              <YAxis
                tick={{ fill: TICK_FILL, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{ color: "#5c6b84", fontWeight: 600 }}
                itemStyle={{ color: "#0d1b32" }}
                cursor={{ stroke: "rgba(37,99,235,0.25)" }}
              />
              <Line
                type="monotone"
                dataKey="previous"
                name={ar ? "الفترة السابقة" : "Previous period"}
                stroke="#93b4fb"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 3, fill: "#93b4fb", stroke: "#ffffff", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="current"
                name={ar ? "الفترة الحالية" : "Current period"}
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Insight / action cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card card-hover flex flex-col p-5">
          <h3 className="text-base font-black tracking-tight">
            {ar ? "أداء هذا الأسبوع" : "This week at a glance"}
          </h3>
          <p className="mt-2 flex-1 text-sm text-muted">
            {ar
              ? `${week.count} حجوزات هذا الأسبوع، ${omr(week.revenue)} من الإيرادات.`
              : `${week.count} bookings this week, ${omr(week.revenue)} earned.`}
          </p>
          <Link to="/owner/bookings" className="btn btn-primary mt-4 self-start !px-4 !py-2 !text-[13px]">
            {ar ? "عرض الحجوزات" : "View bookings"}
          </Link>
        </div>

        <div className="card card-hover flex flex-col p-5">
          <h3 className="text-base font-black tracking-tight">
            {ar ? "الحجوزات القادمة" : "Coming up"}
          </h3>
          <p className="mt-2 flex-1 text-sm text-muted">
            {week.confirmed > 0
              ? ar
                ? `لديك ${week.confirmed} حجوزات مؤكدة قادمة. راجع الأسعار والإتاحة لتبقى ممتلئاً.`
                : `You have ${week.confirmed} confirmed bookings coming up. Review pricing and availability to stay full.`
              : ar
                ? "لا توجد حجوزات مؤكدة قادمة. حدث الأسعار والإتاحة لجذب المزيد."
                : "No confirmed bookings coming up. Update pricing and availability to attract more."}
          </p>
          <Link to="/owner/pitches" className="btn btn-ghost mt-4 self-start !px-4 !py-2 !text-[13px]">
            {ar ? "إدارة الملاعب" : "Manage pitches"}
          </Link>
        </div>
      </div>

      {/* Recent bookings */}
      <section className="card p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-base font-black tracking-tight">
            {ar ? "أحدث الحجوزات" : "Recent bookings"}
          </h2>
          <Link
            to="/owner/bookings"
            className="text-sm font-semibold text-electric hover:text-electric-bright"
          >
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
