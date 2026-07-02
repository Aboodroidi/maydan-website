import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../../lib/i18n";

export default function SupportPage() {
  const { ar } = useLang();

  useEffect(() => {
    document.title = "Support | Maydan";
    return () => {
      document.title = "Maydan";
    };
  }, []);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-bg-soft px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/" aria-label="Maydan home">
            <img src="/assets/img/wordmark_white.svg" alt="Maydan" className="h-6 w-auto" />
          </Link>
          <Link to="/" className="text-[14px] font-semibold text-electric-bright hover:text-ink">
            {ar ? "العودة للرئيسية" : "Back to home"}
          </Link>
        </div>
      </header>

      <main className="px-6 py-12">
        <div className="mx-auto max-w-3xl fade-up">
          <h1 className="text-[clamp(28px,5vw,40px)] font-extrabold tracking-[-0.02em]">Support</h1>

          <div className="legal-prose mt-6">
            <p>
              Need a hand? We&apos;re here to help. Email us any time at{" "}
              <a href="mailto:support@maydan.om">support@maydan.om</a> and we&apos;ll usually reply within 1 to 2 days.
            </p>

            <h2>Frequently asked questions</h2>

            <h3>How do I book a pitch?</h3>
            <p>
              Open Maydan, browse pitches on the map or list, pick a pitch and an available time, then confirm and pay
              in Omani Rial. Your booking appears under the Bookings tab.
            </p>

            <h3>How does splitting the cost work?</h3>
            <p>
              When booking, choose to split between players and pay only your share. Invite teammates with a code or
              link so each person pays their part.
            </p>

            <h3>What is the cancellation policy?</h3>
            <p>
              Free cancellation up to 24 hours before the start time (refunded to your original payment method, usually
              within 2 to 10 days). Within 24 hours, bookings are non-refundable. If a venue cancels, you get a full refund.
            </p>

            <h3>How do I get a refund?</h3>
            <p>
              Eligible refunds are returned automatically to your original payment method. If something looks wrong,
              email <a href="mailto:support@maydan.om">support@maydan.om</a> with your booking details.
            </p>

            <h3>How do I delete my account?</h3>
            <p>
              In the app, go to <strong>Profile → Manage account → Delete account</strong>. This permanently deletes your
              account and frees your username. You can also request deletion by emailing{" "}
              <a href="mailto:support@maydan.om">support@maydan.om</a>.
            </p>

            <h3>I own a pitch, how do I list it?</h3>
            <p>
              Maydan has an owner mode to manage pitches, availability, bookings and earnings. Email{" "}
              <a href="mailto:support@maydan.om">support@maydan.om</a> and we&apos;ll help you get set up.
            </p>

            <h2>Contact</h2>
            <p>
              Email: <a href="mailto:support@maydan.om">support@maydan.om</a>
              <br />
              Maydan · Muscat, Sultanate of Oman
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
