"use client";

import { useLang } from "./LangProvider";
import { PhoneMockup } from "./PhoneMockup";

export function Hero() {
  const { t } = useLang();
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:pt-24">
      {/* Faint M watermark (real brand mark) */}
      <img
        src="/assets/img/watermark_white.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-20 top-0 z-0 w-[380px] select-none opacity-70 rtl:right-auto rtl:-left-20"
      />

      <div className="relative z-10 mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="text-center lg:text-start">
          <span className="glass-fill inline-block rounded-full px-3.5 py-1.5 text-[13px] font-bold text-electric-bright">
            {t.hero.pill}
          </span>
          <h1 className="mt-5 text-[clamp(38px,6vw,64px)] font-black leading-[1.03] tracking-[-0.02em]">
            {t.hero.title}
          </h1>
          <p className="mx-auto mt-5 max-w-[560px] text-[clamp(16px,2.4vw,20px)] text-muted lg:mx-0">
            {t.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <a href="#download" className="glass-prominent sheen lift rounded-2xl px-7 py-4 text-[16px] font-bold">
              {t.hero.cta}
            </a>
            <span className="text-[14px] font-semibold text-muted">{t.hero.soon}</span>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}
