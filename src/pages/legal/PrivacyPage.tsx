import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../../lib/i18n";

export default function PrivacyPage() {
  const { ar } = useLang();

  useEffect(() => {
    document.title = "Privacy Policy | Maydan";
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
          <h1 className="text-[clamp(28px,5vw,40px)] font-extrabold tracking-[-0.02em]">Privacy Policy</h1>
          <p className="mt-2 text-[13px] text-muted">{ar ? "آخر تحديث" : "Last updated"}: July 2026</p>

          <div className="legal-prose mt-6">
            <p>
              This Privacy Policy explains how <strong>Maydan</strong> (&quot;we&quot;, &quot;us&quot;) collects, uses
              and protects your information when you use the Maydan app and website. Maydan is operated from Muscat,
              Sultanate of Oman.
            </p>

            <h2>Information we collect</h2>
            <ul>
              <li><strong>Account details:</strong> your name, phone number, and (if provided) email, username and profile photo.</li>
              <li><strong>Bookings:</strong> the pitches, dates, times and party size you book, and your booking history.</li>
              <li><strong>Location:</strong> with your permission, your approximate/precise location to center the map and show nearby pitches. You can decline and still use the app.</li>
              <li><strong>Payments:</strong> payments are processed by our payment provider (Thawani). We receive confirmation of payment status, not your full card details.</li>
              <li><strong>Device &amp; usage data:</strong> device identifiers and diagnostic data needed for sign-in (including push notifications used for phone verification) and to keep the service reliable.</li>
            </ul>

            <h2>How we use your information</h2>
            <ul>
              <li>To create and secure your account and verify your phone number.</li>
              <li>To show pitches, take and manage bookings, and split payments between players.</li>
              <li>To provide owner tools (bookings, availability and earnings) to venue owners.</li>
              <li>To provide customer support and send booking-related communications.</li>
              <li>To detect abuse and keep the platform safe.</li>
            </ul>

            <h2>Who we share it with</h2>
            <p>We do not sell your personal data. We share limited data with service providers who help us run Maydan:</p>
            <ul>
              <li><strong>Google Firebase:</strong> authentication, database, and app infrastructure.</li>
              <li><strong>Google Maps:</strong> to display maps and pitch locations.</li>
              <li><strong>Thawani:</strong> to process payments securely.</li>
              <li><strong>Pitch owners:</strong> receive the booking details needed to fulfil your reservation (e.g. name and booking time).</li>
            </ul>

            <h2>Data retention</h2>
            <p>
              We keep your data for as long as your account is active. When you delete your account we remove your
              profile and free your username; some records may be retained where required for legal, accounting or
              fraud-prevention purposes.
            </p>

            <h2>Your rights &amp; account deletion</h2>
            <p>
              You can access and update your profile in the app at any time. You can permanently delete your account
              from <strong>Profile → Manage account → Delete account</strong>, or by emailing{" "}
              <a href="mailto:support@maydan.om">support@maydan.om</a>. Deleting your account removes your profile and
              frees your username.
            </p>

            <h2>Security</h2>
            <p>
              We use industry-standard measures to protect your data in transit and at rest. No method of transmission
              is completely secure, but we work to protect your information and limit access to it.
            </p>

            <h2>Children</h2>
            <p>Maydan is not directed to children under 13, and we do not knowingly collect their data.</p>

            <h2>Changes</h2>
            <p>We may update this policy from time to time. Material changes will be reflected here with a new date.</p>

            <h2>Contact</h2>
            <p>
              Questions about privacy? Email <a href="mailto:support@maydan.om">support@maydan.om</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
