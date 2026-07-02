import { Link } from "react-router-dom";
import { useLang } from "../../lib/i18n";
import { joinCode } from "./helpers";

/** Confirmation panel shown after createBooking succeeds. */
export function BookingSuccess({ bookingId }: { bookingId: string }) {
  const { ar } = useLang();

  return (
    <div className="card fade-up p-7 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-electric/15">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-electric-bright"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <h2 className="text-xl font-black">{ar ? "تم تأكيد الحجز" : "Booking confirmed"}</h2>
      <p className="mt-2 text-sm text-muted">
        {ar
          ? "شارك هذا الرمز مع فريقك حتى ينضموا إلى حجزك."
          : "Share this code so teammates can join your booking."}
      </p>
      <div
        dir="ltr"
        className="mx-auto mt-5 w-fit rounded-2xl border border-border bg-bg-soft px-6 py-3 text-2xl font-black tracking-[0.3em] text-electric-bright"
      >
        {joinCode(bookingId)}
      </div>
      <div className="mt-6">
        <Link to="/bookings" className="btn btn-primary">
          {ar ? "عرض حجوزاتي" : "View my bookings"}
        </Link>
      </div>
    </div>
  );
}
