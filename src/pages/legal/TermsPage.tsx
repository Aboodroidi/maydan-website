import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../../lib/i18n";

export default function TermsPage() {
  const { ar } = useLang();

  useEffect(() => {
    document.title = "Terms of Use | Maydan";
    return () => {
      document.title = "Maydan";
    };
  }, []);

  return (
    <div className="min-h-dvh">
      <header className="glass-top sticky top-0 z-20 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/" aria-label="Maydan home">
            <img src="/assets/img/wordmark_electric_blue.svg" alt="Maydan" className="h-6 w-auto" />
          </Link>
          <Link to="/" className="text-[14px] font-semibold text-electric hover:text-electric-bright">
            {ar ? "العودة للرئيسية" : "Back to home"}
          </Link>
        </div>
      </header>

      <main className="px-4 py-10 sm:px-6 sm:py-14">
        <div className="card fade-up mx-auto max-w-3xl p-6 sm:p-10">
          <h1 className="text-[clamp(28px,5vw,40px)] font-black tracking-tight">Terms of Use</h1>
          <p className="mt-2 text-[13px] text-muted">{ar ? "آخر تحديث" : "Last updated"}: July 2026</p>

          <div className="legal-prose mt-8">
            <p>
              These Terms of Use govern your access to and use of the <strong>Maydan</strong> app and website. By
              creating an account or booking a pitch, you agree to these terms. Maydan is operated from Muscat,
              Sultanate of Oman.
            </p>

            <h2>Your account</h2>
            <ul>
              <li>You must provide accurate information and keep your login secure.</li>
              <li>You are responsible for activity that happens under your account.</li>
              <li>You must be able to form a binding contract to make a booking.</li>
            </ul>

            <h2>Bookings</h2>
            <p>
              Maydan connects players with football pitches operated by third-party venue owners. When you book, you
              enter into an arrangement to use that venue at the selected time. Availability and prices are set by the
              venue and may change. A booking is confirmed once payment is completed.
            </p>

            <h2>Payments</h2>
            <p>
              Payments are made in Omani Rial (OMR) and processed by our payment provider, Thawani. Prices shown
              include any applicable fees indicated at checkout. You authorise Maydan and its provider to charge the
              selected amount for your booking or your share of a split booking.
            </p>

            <h2>Cancellations &amp; refunds</h2>
            <ul>
              <li><strong>More than 24 hours</strong> before the start time: free cancellation, refunded to your original payment method (typically within 2 to 10 days).</li>
              <li><strong>Within 24 hours</strong> of the start time: the booking is non-refundable.</li>
              <li><strong>No-shows</strong> are treated as non-refundable.</li>
              <li>If a venue cancels, you receive a full refund.</li>
            </ul>

            <h2>Split payments</h2>
            <p>
              You can invite teammates to pay their share via a code or link. Until the required shares are paid, the
              organiser remains responsible for the booking as described at checkout.
            </p>

            <h2>Venue owners</h2>
            <p>
              Owners are responsible for the accuracy of their listings, availability, pricing, and for providing the
              booked facility. Owners must not list private residential contact details as public pitch information.
            </p>

            <h2>Acceptable use</h2>
            <ul>
              <li>Do not misuse the service, attempt to disrupt it, or access it in unauthorised ways.</li>
              <li>Do not book fraudulently or on behalf of others without permission.</li>
              <li>Do not upload unlawful, offensive or infringing content.</li>
            </ul>

            <h2>Liability</h2>
            <p>
              Maydan provides the platform &quot;as is&quot;. To the extent permitted by law, we are not liable for the
              conduct of venues or players, for injuries occurring at a venue, or for indirect or consequential losses.
              Your use of any facility is at your own risk.
            </p>

            <h2>Termination</h2>
            <p>
              You may delete your account at any time from the app. We may suspend or terminate accounts that breach
              these terms.
            </p>

            <h2>Governing law</h2>
            <p>These terms are governed by the laws of the Sultanate of Oman.</p>

            <h2>Contact</h2>
            <p>
              Questions about these terms? Email <a href="mailto:support@maydan.om">support@maydan.om</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
