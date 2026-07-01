import type { Metadata } from "next";
import { LegalShell } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Support — Maydan",
  description: "Help with bookings, payments and your Maydan account.",
};

export default function SupportPage() {
  return (
    <LegalShell title="Support">
      <p>
        Need a hand? We&apos;re here to help. Email us any time at{" "}
        <a href="mailto:support@maydan.om">support@maydan.om</a> and we&apos;ll usually reply within 1–2 days.
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
        within 2–10 days). Within 24 hours, bookings are non-refundable. If a venue cancels, you get a full refund.
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

      <h3>I own a pitch — how do I list it?</h3>
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
    </LegalShell>
  );
}
