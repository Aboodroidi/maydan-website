"use client";

import { useLang } from "./LangProvider";

export function Features() {
  const { t } = useLang();
  return (
    <section id="features" className="scroll-mt-24 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-[640px] text-center">
          <h2 className="text-[clamp(26px,4vw,38px)] font-extrabold tracking-[-0.02em]">{t.features.title}</h2>
          <p className="mt-3 text-[17px] text-muted">{t.features.subtitle}</p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {t.features.items.map((f) => (
            <div key={f.title} className="glass lift rounded-3xl p-7">
              <div className="glass-fill grid h-12 w-12 place-items-center rounded-2xl text-2xl">{f.icon}</div>
              <h3 className="mt-4 text-[19px] font-bold">{f.title}</h3>
              <p className="mt-1.5 text-[15px] text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
