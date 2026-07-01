"use client";

import Link from "next/link";
import { useLang } from "./LangProvider";
import { MaydanMark } from "./MaydanMark";

export function Nav() {
  const { t, toggle } = useLang();
  return (
    <header className="sticky top-0 z-50 px-4 pt-3">
      <nav className="glass mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full px-4 sm:px-5">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-[19px]">
          <MaydanMark size={30} />
          <span>Maydan</span>
        </Link>

        <div className="flex items-center gap-6">
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
            className="glass lift rounded-full px-4 py-1.5 text-sm font-bold"
            aria-label="Toggle language"
          >
            {t.nav.langLabel}
          </button>
        </div>
      </nav>
    </header>
  );
}
