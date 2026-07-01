"use client";

import { useLang } from "./LangProvider";
import { PhoneMockup } from "./PhoneMockup";

export function Hero() {
  const { t } = useLang();
  return (
    <section className="relative px-4 pb-16 pt-16 sm:pt-24">
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="text-center lg:text-start">
          <span className="glass-fill inline-block rounded-full px-3.5 py-1.5 text-[13px] font-bold text-electric-bright">
            {t.hero.pill}
          </span>
          <h1 className="mt-5 text-[clamp(36px,6vw,62px)] font-extrabold leading-[1.05] tracking-[-0.02em]">
            {t.hero.title}
          </h1>
          <p className="mx-auto mt-5 max-w-[560px] text-[clamp(16px,2.4vw,20px)] text-muted lg:mx-0">
            {t.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <a
              href="#download"
              className="glass-prominent sheen lift rounded-2xl px-7 py-4 text-[16px] font-bold"
            >
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
