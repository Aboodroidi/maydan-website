"use client";

import Link from "next/link";
import { useLang } from "./LangProvider";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="px-4 pb-10 pt-8">
      <div className="glass mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 rounded-3xl px-6 py-5 text-[14px] text-muted">
        <span>{t.footer.rights}</span>
        <div className="flex items-center gap-5 font-semibold text-electric-bright">
          <Link href="/privacy/" className="hover:text-ink">{t.footer.privacy}</Link>
          <Link href="/terms/" className="hover:text-ink">{t.footer.terms}</Link>
          <Link href="/support/" className="hover:text-ink">{t.footer.support}</Link>
          <a href="mailto:support@maydan.om" className="hover:text-ink">support@maydan.om</a>
        </div>
      </div>
    </footer>
  );
}
