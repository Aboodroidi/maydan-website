"use client";

import Link from "next/link";
import { useLang } from "./LangProvider";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-[14px] text-muted">
        <span>{t.footer.rights}</span>
        <div className="flex items-center gap-5 font-semibold text-electric">
          <Link href="/privacy/" className="hover:text-electric-dark">{t.footer.privacy}</Link>
          <Link href="/terms/" className="hover:text-electric-dark">{t.footer.terms}</Link>
          <Link href="/support/" className="hover:text-electric-dark">{t.footer.support}</Link>
          <a href="mailto:support@maydan.om" className="hover:text-electric-dark">support@maydan.om</a>
        </div>
      </div>
    </footer>
  );
}
