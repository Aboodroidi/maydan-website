"use client";

import { useLang } from "./LangProvider";

export function DownloadCTA() {
  const { t } = useLang();
  return (
    <section id="download" className="scroll-mt-24 px-4 py-16">
      <div
        className="glass sheen relative mx-auto max-w-4xl overflow-hidden rounded-[32px] p-10 text-center sm:p-16"
        style={{
          background:
            "linear-gradient(135deg, rgba(47,107,255,0.28), rgba(91,139,255,0.14)), rgba(255,255,255,0.05)",
        }}
      >
        <h2 className="text-[clamp(26px,4vw,40px)] font-extrabold tracking-[-0.02em]">{t.download.title}</h2>
        <p className="mx-auto mt-3.5 max-w-[520px] text-[18px] text-muted">{t.download.body}</p>
        <div className="mt-8 flex justify-center">
          <span className="glass inline-flex items-center gap-3 rounded-2xl px-6 py-3.5">
            <span className="text-[22px]"></span>
            <span className="text-start leading-tight">
              <span className="block text-[11px] font-semibold text-muted">{t.download.badgeSmall}</span>
              <span className="text-[16px] font-bold">{t.download.badgeStore}</span>
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
