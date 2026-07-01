"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { useLang } from "./LangProvider";

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  const { t } = useLang();
  return (
    <>
      <Nav />
      <main className="px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="text-[14px] font-semibold text-electric-bright hover:text-ink">
            ← {t.legal.back}
          </Link>
          <div className="glass mt-4 rounded-[28px] p-7 sm:p-10">
            <h1 className="text-[clamp(28px,5vw,40px)] font-extrabold tracking-[-0.02em]">{title}</h1>
            {updated && (
              <p className="mt-2 text-[13px] text-muted">
                {t.legal.updated}: {updated}
              </p>
            )}
            <div className="legal-prose mt-6">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
