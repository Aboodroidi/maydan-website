"use client";

import { useLang } from "./LangProvider";

export function About() {
  const { t } = useLang();
  return (
    <section id="about" className="scroll-mt-24 bg-surface px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-[clamp(24px,4vw,34px)] font-extrabold tracking-[-0.02em]">{t.about.title}</h2>
        <p className="mx-auto mt-4 max-w-[620px] text-[17px] leading-relaxed text-muted">{t.about.body}</p>
      </div>
    </section>
  );
}
