"use client";

import Link from "next/link";
import { useLang } from "./LangProvider";

export function Nav() {
  const { t, toggle } = useLang();
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="Maydan" className="flex items-center">
          <img src="/assets/img/wordmark_electric_blue.svg" alt="Maydan" className="h-8 w-auto" />
        </Link>

        <div className="flex items-center gap-7">
          <a href="/#about" className="hidden text-[15px] font-medium text-muted transition-colors hover:text-ink sm:inline">
            {t.nav.about}
          </a>
          <a href="/#features" className="hidden text-[15px] font-medium text-muted transition-colors hover:text-ink sm:inline">
            {t.nav.features}
          </a>
          <a href="/#download" className="hidden text-[15px] font-medium text-muted transition-colors hover:text-ink sm:inline">
            {t.nav.download}
          </a>
          <button
            onClick={toggle}
            className="rounded-full border border-border bg-white px-4 py-2 text-sm font-bold transition-colors hover:bg-surface"
            aria-label="Toggle language"
          >
            {t.nav.langLabel}
          </button>
        </div>
      </nav>
    </header>
  );
}
