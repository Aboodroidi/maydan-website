import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { httpsCallable } from "firebase/functions";
import { firebaseReady, fns } from "../lib/firebase";
import { omr } from "../lib/data";
import type { Pitch } from "../lib/types";
import { useLang } from "../lib/i18n";
import { useAuth } from "../lib/auth";
import { SetupNotice } from "../components/SetupNotice";
import { PitchHero } from "../components/pitch/PitchHero";
import { DateStrip } from "../components/pitch/DateStrip";
import { SlotGrid } from "../components/pitch/SlotGrid";
import { CourtList } from "../components/pitch/CourtList";
import { BookingSuccess } from "../components/pitch/BookingSuccess";
import {
  courtSizeNumber,
  dayKeyOf,
  dayShortLabel,
  displayCourts,
  fetchPitch,
  showsAvailability,
  slotsForDay,
  supportsBooking,
  timeLabel,
} from "../components/pitch/helpers";

export default function PitchPage() {
  const { id } = useParams<{ id: string }>();
  const { ar } = useLang();
  const { user } = useAuth();

  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [dayKey, setDayKey] = useState(() => dayKeyOf(Date.now()));
  const [slotId, setSlotId] = useState<string | null>(null);
  const [courtId, setCourtId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [bookedId, setBookedId] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseReady || !id) {
      setLoading(false);
      return;
    }
    let alive = true;
    fetchPitch(id)
      .then((p) => {
        if (alive) {
          setPitch(p);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (alive) {
          setLoadError(String((e as Error)?.message ?? e));
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [id]);

  const courts = useMemo(() => (pitch ? displayCourts(pitch, ar) : []), [pitch, ar]);

  // Default court: the first available one (like the app).
  useEffect(() => {
    if (courtId || courts.length === 0) return;
    const first = courts.find((c) => c.isAvailable !== false) ?? courts[0];
    setCourtId(first.id);
  }, [courts, courtId]);

  const daySlots = useMemo(
    () => (pitch ? slotsForDay(pitch.slots, dayKey) : []),
    [pitch, dayKey]
  );
  const slot = daySlots.find((s) => s.id === slotId) ?? null;
  const court = courts.find((c) => c.id === courtId) ?? null;
  const price = court?.pricePerHour ?? pitch?.pricePerHour ?? 0;

  async function book() {
    const f = fns();
    if (!f || !pitch || !slot || !court || !user) return;
    setSubmitting(true);
    setBookError(null);
    try {
      const create = httpsCallable(f, "createBooking");
      const startMs = slot.startMs;
      const endMs = startMs + 60 * 60_000; // 60 min default duration
      const res = await create({
        pitchId: pitch.id,
        startMs,
        endMs,
        pitchName: `${pitch.name} · ${court.name}`,
        customerName: user.displayName ?? "Player",
        customerPhone: user.phoneNumber ?? "",
        partySize: courtSizeNumber(court),
        amount: court.pricePerHour,
        kind: "player",
      });
      const data = res.data as { bookingId?: string } | null;
      setBookedId(data?.bookingId ?? "");
    } catch (e: unknown) {
      const alreadyBooked = e instanceof FirebaseError && e.code === "functions/already-exists";
      setBookError(
        alreadyBooked
          ? ar
            ? "هذا الوقت محجوز بالفعل."
            : "That time is already booked."
          : String((e as Error)?.message ?? e)
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!firebaseReady) {
    return (
      <SetupNotice
        title={ar ? "اربط قاعدة بيانات Firebase" : "Connect the Firebase database"}
        body={
          ar
            ? "أضف قيم VITE_FIREBASE_* في ملف البيئة ثم أعد التحميل لعرض تفاصيل الملعب."
            : "Set the VITE_FIREBASE_* env values and reload to see this pitch's details."
        }
      />
    );
  }

  if (loading) {
    return (
      <div className="grid h-full place-items-center p-8">
        <p className="text-sm text-muted">{ar ? "جارٍ التحميل…" : "Loading…"}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="grid h-full place-items-center p-8">
        <div className="card max-w-md p-7 text-center">
          <h1 className="text-lg font-black tracking-tight">
            {ar ? "تعذر تحميل الملعب" : "Could not load pitch"}
          </h1>
          <p className="mt-3 text-sm text-red-600">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!pitch) {
    return (
      <div className="grid h-full place-items-center p-8">
        <div className="card max-w-md p-7 text-center">
          <h1 className="text-lg font-black tracking-tight">
            {ar ? "الملعب غير موجود" : "Pitch not found"}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {ar ? "ربما تمت إزالة هذا الملعب." : "This pitch may have been removed."}
          </p>
          <div className="mt-5">
            <Link to="/" className="btn btn-ghost">
              {ar ? "الرجوع إلى اكتشف" : "Back to Discover"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const bookable = supportsBooking(pitch.tier);
  const summary = slot
    ? `${dayShortLabel(slot.startMs, ar)} · ${timeLabel(slot.startMs, ar)} · ${
        ar ? "60 دقيقة" : "60 min"
      }`
    : bookable
      ? ar
        ? "اختر وقتًا"
        : "Select a time"
      : ar
        ? "تواصل مع المالك"
        : "Contact the owner";

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <Link
        to="/"
        className="mb-4 inline-block text-sm font-semibold text-muted hover:text-electric"
      >
        {ar ? "الرجوع إلى اكتشف" : "Back to Discover"}
      </Link>

      <div className="fade-up flex flex-col gap-5">
        <PitchHero pitch={pitch} />

        {bookedId !== null ? (
          <BookingSuccess bookingId={bookedId} />
        ) : (
          <>
            {showsAvailability(pitch.tier) ? (
              <>
                <section className="card p-5 sm:p-6">
                  <h2 className="text-lg font-black tracking-tight">
                    {ar ? "التوفر" : "Availability"}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {ar ? "اختر اليوم ثم الوقت المناسب." : "Pick a day, then a time that works."}
                  </p>
                  <div className="mt-4">
                    <DateStrip
                      selectedKey={dayKey}
                      onSelect={(key) => {
                        setDayKey(key);
                        setSlotId(null);
                      }}
                    />
                  </div>

                  <h3 className="mt-5 text-sm font-semibold text-muted">
                    {ar ? "المدة" : "Duration"}
                  </h3>
                  <div className="mt-2">
                    <span className="chip inline-block" data-active="true">
                      {ar ? "60 دقيقة" : "60 min"}
                    </span>
                  </div>

                  <h3 className="mt-5 text-sm font-semibold text-muted">{ar ? "الوقت" : "Time"}</h3>
                  <div className="mt-2">
                    {pitch.slots.length === 0 ? (
                      <p className="text-sm text-muted">
                        {ar ? "لم تنشر أوقات بعد." : "No slots published yet."}
                      </p>
                    ) : daySlots.length === 0 ? (
                      <p className="text-sm text-muted">
                        {ar ? "لا توجد أوقات متاحة لهذا اليوم." : "No times available for this day."}
                      </p>
                    ) : (
                      <SlotGrid slots={daySlots} selectedId={slotId} onSelect={setSlotId} />
                    )}
                  </div>
                </section>

                <section className="card p-5 sm:p-6">
                  <h2 className="text-lg font-black tracking-tight">
                    {ar ? "احجز ملعبك" : "Reserve a pitch"}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {ar
                      ? "هذا المجمع يضم عدة ملاعب. اختر واحدًا لمباراتك."
                      : "This venue has several pitches. Pick one for your match."}
                  </p>
                  <div className="mt-4">
                    <CourtList courts={courts} selectedId={courtId} onSelect={setCourtId} />
                  </div>
                </section>
              </>
            ) : (
              <section className="card flex items-center gap-3 p-5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-electric"
                >
                  <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.9.3 1.9.6 2.9.7a2 2 0 011.7 2z" />
                </svg>
                <p className="text-sm text-muted">
                  {ar
                    ? "هذا الملعب لا يدعم الحجز داخل التطبيق بعد. اتصل بالمالك للحجز."
                    : "This pitch is not on in-app booking yet. Call the owner to reserve."}
                </p>
              </section>
            )}

            {bookError && (
              <p className="text-center text-sm font-semibold text-red-600">{bookError}</p>
            )}

            {/* Sticky booking bar: frosted white card with the tier-appropriate CTA. */}
            <div className="sticky bottom-4">
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-white/85 p-4 shadow-[0_4px_10px_rgba(13,27,50,0.06),0_18px_44px_rgba(37,99,235,0.18)] backdrop-blur-xl">
                <div className="min-w-0 flex-1">
                  <div className="text-lg font-black">{omr(price)}</div>
                  <div
                    className={`truncate text-xs font-semibold ${
                      slot ? "text-electric-bright" : "text-muted"
                    }`}
                  >
                    {summary}
                  </div>
                </div>
                {bookable ? (
                  user ? (
                    <button
                      className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!slot || !court || submitting}
                      onClick={book}
                    >
                      {submitting
                        ? ar
                          ? "جارٍ الحجز…"
                          : "Booking…"
                        : ar
                          ? "احجز الآن"
                          : "Book now"}
                    </button>
                  ) : (
                    <Link to={`/signin?next=/pitch/${pitch.id}`} className="btn btn-primary">
                      {ar ? "سجل الدخول للحجز" : "Sign in to book"}
                    </Link>
                  )
                ) : pitch.phone ? (
                  <a href={`tel:${pitch.phone}`} className="btn btn-primary">
                    {ar ? "اتصل للحجز" : "Call to book"}
                  </a>
                ) : (
                  <span className="btn btn-ghost cursor-not-allowed opacity-50">
                    {ar ? "اتصل للحجز" : "Call to book"}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
