import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useLang } from "../lib/i18n";
import { firebaseReady } from "../lib/firebase";
import { omr } from "../lib/data";
import { cancelBooking, joinByCode, watchMyBookings } from "../lib/bookings";
import { SetupNotice } from "../components/SetupNotice";
import type { Booking } from "../lib/types";

const T = {
  title: { en: "My Bookings", ar: "حجوزاتي" },
  subtitle: { en: "Your matches, live from the pitch.", ar: "مبارياتك، مباشرة من الملعب." },
  upcoming: { en: "Upcoming", ar: "القادمة" },
  past: { en: "Past and cancelled", ar: "السابقة والملغاة" },
  emptyUpcoming: {
    en: "No upcoming matches. Find a pitch and book your next game.",
    ar: "لا توجد مباريات قادمة. اكتشف ملعباً واحجز مباراتك القادمة.",
  },
  discover: { en: "Discover pitches", ar: "اكتشف الملاعب" },
  signInTitle: { en: "Sign in to see your bookings", ar: "سجّل الدخول لعرض حجوزاتك" },
  signInBody: {
    en: "Your matches and join codes live on your account.",
    ar: "مبارياتك ورموز الانضمام محفوظة في حسابك.",
  },
  signIn: { en: "Sign in", ar: "تسجيل الدخول" },
  today: { en: "Today", ar: "اليوم" },
  tomorrow: { en: "Tomorrow", ar: "غداً" },
  to: { en: "to", ar: "إلى" },
  confirmed: { en: "Confirmed", ar: "مؤكد" },
  completed: { en: "Completed", ar: "مكتمل" },
  cancelled: { en: "Cancelled", ar: "ملغي" },
  players: { en: "players", ar: "لاعبين" },
  code: { en: "Code", ar: "الرمز" },
  copy: { en: "Copy", ar: "نسخ" },
  copied: { en: "Copied", ar: "تم النسخ" },
  share: { en: "Share", ar: "مشاركة" },
  cancel: { en: "Cancel booking", ar: "إلغاء الحجز" },
  cancelling: { en: "Cancelling...", ar: "جارٍ الإلغاء..." },
  confirmCancel: {
    en: "Cancel this booking? This cannot be undone.",
    ar: "إلغاء هذا الحجز؟ لا يمكن التراجع عن ذلك.",
  },
  joinTitle: { en: "Join with a code", ar: "انضم برمز" },
  joinBody: {
    en: "Got a code from a teammate? Enter it to join their match.",
    ar: "لديك رمز من زميلك؟ أدخله للانضمام إلى مباراته.",
  },
  join: { en: "Join", ar: "انضم" },
  joining: { en: "Joining...", ar: "جارٍ الانضمام..." },
  joined: {
    en: "You are in. The match now shows in your list.",
    ar: "تم الانضمام. ستظهر المباراة في قائمتك.",
  },
  alreadyJoined: { en: "You already joined this match.", ar: "أنت منضم لهذه المباراة بالفعل." },
  shareText: {
    en: (pitch: string, code: string) => `Join my match at ${pitch} on Maydan. Code: ${code}`,
    ar: (pitch: string, code: string) => `انضم لمباراتي في ${pitch} عبر ميدان. الرمز: ${code}`,
  },
} as const;

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

/** Today / Tomorrow / short weekday date, like the app's Booking.dateLabel. */
function dateLabel(startMs: number, ar: boolean): string {
  const d = new Date(startMs);
  const today = new Date();
  if (sameDay(d, today)) return ar ? T.today.ar : T.today.en;
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (sameDay(d, tomorrow)) return ar ? T.tomorrow.ar : T.tomorrow.en;
  return new Intl.DateTimeFormat(ar ? "ar" : "en", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

function timeLabel(startMs: number, endMs: number, ar: boolean): string {
  const f = new Intl.DateTimeFormat(ar ? "ar" : "en", { hour: "numeric", minute: "2-digit" });
  return `${f.format(new Date(startMs))} ${ar ? T.to.ar : T.to.en} ${f.format(new Date(endMs))}`;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers or non-secure contexts.
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      el.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function StatusPill({ status, ar }: { status: string; ar: boolean }) {
  const styles: Record<string, string> = {
    confirmed: "bg-electric/10 text-electric",
    completed: "bg-surface-2 text-muted",
    cancelled: "bg-red-50 text-red-600",
  };
  const labels: Record<string, { en: string; ar: string }> = {
    confirmed: T.confirmed,
    completed: T.completed,
    cancelled: T.cancelled,
  };
  const label = labels[status] ?? T.confirmed;
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles[status] ?? styles.confirmed}`}
    >
      {ar ? label.ar : label.en}
    </span>
  );
}

function BookingCard({
  booking,
  ar,
  onCancel,
  cancelling,
}: {
  booking: Booking;
  ar: boolean;
  onCancel: (b: Booking) => void;
  cancelling: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const canCancel = booking.status === "confirmed" && booking.startMs > Date.now();

  const copyCode = async () => {
    if (await copyText(booking.joinCode)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  const shareCode = async () => {
    const text = (ar ? T.shareText.ar : T.shareText.en)(booking.pitchName, booking.joinCode);
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // Dismissed or unsupported payload, fall back to copy.
      }
    }
    if (await copyText(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold">{booking.pitchName || "Maydan"}</h3>
          <p className="mt-1 text-sm text-muted">
            {dateLabel(booking.startMs, ar)}, {timeLabel(booking.startMs, booking.endMs, ar)}
          </p>
        </div>
        <StatusPill status={booking.status} ar={ar} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
        <span className="font-bold text-electric-bright">{omr(booking.amount)}</span>
        {booking.partySize > 0 && (
          <span className="text-muted">
            {booking.spotsFilled}/{booking.partySize} {ar ? T.players.ar : T.players.en}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <span className="text-xs font-semibold text-muted">{ar ? T.code.ar : T.code.en}</span>
        <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-sm font-bold tracking-[0.2em]">
          {booking.joinCode}
        </span>
        <button onClick={copyCode} className="chip" data-active={copied ? "true" : undefined}>
          {copied ? (ar ? T.copied.ar : T.copied.en) : ar ? T.copy.ar : T.copy.en}
        </button>
        <button onClick={shareCode} className="chip">
          {ar ? T.share.ar : T.share.en}
        </button>
        {canCancel && (
          <button
            onClick={() => onCancel(booking)}
            disabled={cancelling}
            className="ms-auto rounded-full px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {cancelling ? (ar ? T.cancelling.ar : T.cancelling.en) : ar ? T.cancel.ar : T.cancel.en}
          </button>
        )}
      </div>
    </div>
  );
}

function JoinCard({ ar, name }: { ar: boolean; name: string }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await joinByCode(code, name);
      setMsg({
        ok: true,
        text: res.alreadyJoined
          ? ar
            ? T.alreadyJoined.ar
            : T.alreadyJoined.en
          : ar
            ? T.joined.ar
            : T.joined.en,
      });
      setCode("");
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  };

  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, "");

  return (
    <div className="card p-5">
      <h2 className="text-base font-bold">{ar ? T.joinTitle.ar : T.joinTitle.en}</h2>
      <p className="mt-1 text-sm text-muted">{ar ? T.joinBody.ar : T.joinBody.en}</p>
      <div className="mt-4 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && clean.length >= 4 && !busy) void submit();
          }}
          maxLength={6}
          placeholder="ABC123"
          dir="ltr"
          className="w-40 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm font-bold uppercase tracking-[0.25em] text-ink placeholder:text-muted/50 focus:border-electric focus:outline-none focus:ring-4 focus:ring-electric/15"
          aria-label={ar ? T.joinTitle.ar : T.joinTitle.en}
        />
        <button
          onClick={() => void submit()}
          disabled={busy || clean.length < 4}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (ar ? T.joining.ar : T.joining.en) : ar ? T.join.ar : T.join.en}
        </button>
      </div>
      {msg && (
        <p className={`mt-3 text-sm font-semibold ${msg.ok ? "text-electric-bright" : "text-red-600"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}

export default function BookingsPage() {
  const { user, loading } = useAuth();
  const { ar } = useLang();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setBookings(null);
      return;
    }
    return watchMyBookings(user.uid, setBookings);
  }, [user]);

  const now = Date.now();
  const { upcoming, past } = useMemo(() => {
    const all = bookings ?? [];
    const upcoming = all
      .filter((b) => b.status === "confirmed" && b.endMs >= now)
      .sort((a, b) => a.startMs - b.startMs);
    const past = all
      .filter((b) => !(b.status === "confirmed" && b.endMs >= now))
      .sort((a, b) => b.startMs - a.startMs);
    return { upcoming, past };
  }, [bookings, now]);

  const onCancel = async (b: Booking) => {
    if (!window.confirm(ar ? T.confirmCancel.ar : T.confirmCancel.en)) return;
    setCancellingId(b.id);
    try {
      await cancelBooking(b.id);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : String(e));
    } finally {
      setCancellingId(null);
    }
  };

  if (!firebaseReady) {
    return (
      <SetupNotice
        title={ar ? "فايربيس غير مهيأ" : "Firebase is not configured"}
        body={
          ar
            ? "أضف مفاتيح VITE_FIREBASE في ملف البيئة لعرض حجوزاتك."
            : "Add the VITE_FIREBASE keys to your env file to see live bookings."
        }
      />
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="card h-28 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid h-full place-items-center px-4 py-10 sm:px-6">
        <div className="card fade-up max-w-md p-8 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-electric/10">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-electric-bright"
            >
              <path d="M7 2v3M17 2v3M3 8h18M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold">{ar ? T.signInTitle.ar : T.signInTitle.en}</h1>
          <p className="mt-2 text-sm text-muted">{ar ? T.signInBody.ar : T.signInBody.en}</p>
          <Link to="/signin?next=/bookings" className="btn btn-primary mt-5 w-full">
            {ar ? T.signIn.ar : T.signIn.en}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
      <header>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{ar ? T.title.ar : T.title.en}</h1>
        <p className="mt-1.5 text-sm text-muted">{ar ? T.subtitle.ar : T.subtitle.en}</p>
      </header>

      <div className="mt-6 space-y-8">
        <JoinCard ar={ar} name={user.displayName ?? ""} />

        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
            {ar ? T.upcoming.ar : T.upcoming.en}
          </h2>
          {bookings === null ? (
            <div className="space-y-3">
              <div className="card h-36 animate-pulse" />
              <div className="card h-36 animate-pulse" />
            </div>
          ) : upcoming.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-sm text-muted">{ar ? T.emptyUpcoming.ar : T.emptyUpcoming.en}</p>
              <Link to="/discover" className="btn btn-ghost mt-4">
                {ar ? T.discover.ar : T.discover.en}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  ar={ar}
                  onCancel={onCancel}
                  cancelling={cancellingId === b.id}
                />
              ))}
            </div>
          )}
        </section>

        {past.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
              {ar ? T.past.ar : T.past.en}
            </h2>
            <div className="space-y-3">
              {past.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  ar={ar}
                  onCancel={onCancel}
                  cancelling={cancellingId === b.id}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
