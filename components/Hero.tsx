"use client";

import { useLang } from "./LangProvider";

export function Hero() {
  const { t } = useLang();
  return (
    <section className="hero-bg px-6 pb-20 pt-24 text-center">
      <div className="mx-auto max-w-2xl">
        <span className="mb-6 inline-block rounded-full bg-electric/10 px-3.5 py-1.5 text-[13px] font-bold text-electric-dark">
          {t.hero.pill}
        </span>
        <h1 className="text-[clamp(38px,6vw,64px)] font-black leading-[1.05] tracking-[-0.02em]">
          {t.hero.title}
        </h1>
        <p className="mx-auto mt-5 max-w-[600px] text-[clamp(16px,2.4vw,20px)] text-muted">
          {t.hero.subtitle}
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <a href="#download" className="btn btn-primary">
            {t.hero.cta}
          </a>
          <span className="text-[14px] font-semibold text-muted">{t.hero.soon}</span>
        </div>
      </div>
    </section>
  );
}
