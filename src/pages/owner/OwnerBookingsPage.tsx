import { useMemo, useState } from "react";
import { useAuth } from "../../lib/auth";
import { useLang } from "../../lib/i18n";
import { omr } from "../../lib/data";
import {
  setBookingStatus,
  useOwnedPitches,
  useOwnerBookings,
  type OwnerBookingStatus,
} from "../../lib/owner";
import type { Booking } from "../../lib/types";

type Filter = "all" | "confirmed" | "completed" | "cancelled";

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

function statusLabel(status: string, ar: boolean): string {
  if (status === "cancelled") return ar ? "ملغي" : "Cancelled";
  if (status === "completed") return ar ? "مكتمل" : "Completed";
  return ar ? "مؤكد" : "Confirmed";
}

function StatusPill({ status, ar }: { status: string; ar: boolean }) {
  const tone =
    status === "cancelled"
      ? "bg-red-600/10 text-red-600"
      : status === "completed"
        ? "bg-ink/5 text-muted"
        : "bg-electric/10 text-electric";
  return (
    <span className={`inline-block shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${tone}`}>
      {statusLabel(status, ar)}
    </span>
  );
}

export default function OwnerBookingsPage() {
  const { ar } = useLang();
  const { user } = useAuth();
  const { pitches, loading: pitchesLoading } = useOwnedPitches(user?.uid);
  const pitchIds = useMemo(() => pitches.map((p) => p.id), [pitches]);
  const liveBookings = useOwnerBookings(pitchIds);

  const [filter, setFilter] = useState<Filter>("all");
  // Optimistic status overrides while the callable is in flight.
  const [overrides, setOverrides] = useState<Record<string, OwnerBookingStatus>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bookings = useMemo(() => {
    const merged = liveBookings.map((b) =>
      overrides[b.id] ? { ...b, status: overrides[b.id] } : b
    );
    const filtered = filter === "all" ? merged : merged.filter((b) => b.status === filter);
    return filtered.sort((a, b) => b.startMs - a.startMs);
  }, [liveBookings, overrides, filter]);

  const act = async (booking: Booking, status: OwnerBookingStatus) => {
    setError(null);
    setBusyId(booking.id);
    setOverrides((o) => ({ ...o, [booking.id]: status }));
    try {
      await setBookingStatus(booking.id, status);
      // The live snapshot carries the final state; drop the local override.
      setOverrides((o) => {
        const { [booking.id]: _done, ...rest } = o;
        return rest;
      });
    } catch (e: unknown) {
      setOverrides((o) => {
        const { [booking.id]: _failed, ...rest } = o;
        return rest;
      });
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  };

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
        </div>
      </div>
    );
  }

  const filters: { key: Filter; en: string; ar: string }[] = [
    { key: "all", en: "All", ar: "الكل" },
    { key: "confirmed", en: "Confirmed", ar: "مؤكد" },
    { key: "completed", en: "Completed", ar: "مكتمل" },
    { key: "cancelled", en: "Cancelled", ar: "ملغي" },
  ];

  const actions = (b: Booking) => {
    const busy = busyId === b.id;
    if (b.status === "confirmed") {
      return (
        <div className="flex flex-wrap justify-end gap-2">
          <button
            className="btn btn-primary !px-3 !py-1.5 !text-[12px]"
            disabled={busy}
            onClick={() => void act(b, "completed")}
          >
            {ar ? "إكمال" : "Complete"}
          </button>
          <button
            className="btn btn-ghost !px-3 !py-1.5 !text-[12px] !text-red-600"
            disabled={busy}
            onClick={() => void act(b, "cancelled")}
          >
            {ar ? "إلغاء" : "Cancel"}
          </button>
        </div>
      );
    }
    if (b.status === "cancelled") {
      return (
        <div className="flex justify-end">
          <button
            className="btn btn-ghost !px-3 !py-1.5 !text-[12px]"
            disabled={busy}
            onClick={() => void act(b, "confirmed")}
          >
            {ar ? "تأكيد" : "Confirm"}
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-5 px-4 py-6 sm:px-6 fade-up">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          {ar ? "حجوزات الملاعب" : "Pitch bookings"}
        </h1>
        <p className="text-sm text-muted">
          {ar ? `${bookings.length} حجز` : `${bookings.length} bookings`}
        </p>
      </header>

      <div className="flex items-center gap-2 overflow-x-auto scroll-thin">
        {filters.map((f) => (
          <button
            key={f.key}
            className="chip"
            data-active={filter === f.key}
            onClick={() => setFilter(f.key)}
          >
            {ar ? f.ar : f.en}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {bookings.length === 0 ? (
        <div className="card p-7 text-center">
          <p className="text-sm text-muted">
            {ar ? "لا توجد حجوزات مطابقة." : "No bookings match this filter."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card hidden overflow-hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2/60 text-start text-[12px] uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 text-start font-semibold">{ar ? "العميل" : "Customer"}</th>
                  <th className="px-5 py-3 text-start font-semibold">{ar ? "الملعب" : "Pitch"}</th>
                  <th className="px-5 py-3 text-start font-semibold">{ar ? "الموعد" : "When"}</th>
                  <th className="px-5 py-3 text-start font-semibold">{ar ? "المبلغ" : "Amount"}</th>
                  <th className="px-5 py-3 text-start font-semibold">{ar ? "الحالة" : "Status"}</th>
                  <th className="px-5 py-3 text-end font-semibold">{ar ? "إجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-border)]">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-2">
                    <td className="px-5 py-3.5">
                      <p className="font-bold">{b.customerName || (ar ? "زائر" : "Guest")}</p>
                      {b.customerPhone && (
                        <p className="mt-0.5 text-[12px] text-muted" dir="ltr">
                          {b.customerPhone}
                        </p>
                      )}
                    </td>
                    <td className="max-w-[180px] truncate px-5 py-3.5 text-muted">{b.pitchName}</td>
                    <td className="px-5 py-3.5 text-muted">
                      <p className="text-ink">{fmtDate(b.startMs, ar)}</p>
                      <p className="mt-0.5 text-[12px]">
                        {fmtTime(b.startMs, ar)} {ar ? "إلى" : "to"} {fmtTime(b.endMs, ar)}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-electric-bright">{omr(b.amount)}</td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={b.status} ar={ar} />
                    </td>
                    <td className="px-5 py-3.5">{actions(b)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {bookings.map((b) => (
              <li key={b.id} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-bold">
                      {b.customerName || (ar ? "زائر" : "Guest")}
                    </p>
                    <p className="mt-0.5 truncate text-[13px] text-muted">{b.pitchName}</p>
                  </div>
                  <StatusPill status={b.status} ar={ar} />
                </div>
                <p className="mt-2 text-[13px] text-muted">
                  {fmtDate(b.startMs, ar)} · {fmtTime(b.startMs, ar)} {ar ? "إلى" : "to"}{" "}
                  {fmtTime(b.endMs, ar)}
                </p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="font-bold text-electric-bright">{omr(b.amount)}</span>
                  {actions(b)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
