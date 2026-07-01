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
      <main className="px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="text-[14px] font-semibold text-electric hover:text-electric-dark">
            ← {t.legal.back}
          </Link>
          <h1 className="mt-4 text-[clamp(28px,5vw,40px)] font-extrabold tracking-[-0.02em]">{title}</h1>
          {updated && (
            <p className="mt-2 text-[13px] text-muted">
              {t.legal.updated}: {updated}
            </p>
          )}
          <div className="legal-prose mt-6">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
