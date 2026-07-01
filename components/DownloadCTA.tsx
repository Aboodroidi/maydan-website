"use client";

import { useLang } from "./LangProvider";

export function DownloadCTA() {
  const { t } = useLang();
  return (
    <section id="download" className="scroll-mt-24 px-6 py-20">
      <div
        className="mx-auto max-w-4xl rounded-[28px] px-8 py-14 text-center text-white sm:px-12"
        style={{ background: "linear-gradient(135deg, #2563eb, #4f7bf7)" }}
      >
        <h2 className="text-[clamp(26px,4vw,40px)] font-extrabold tracking-[-0.02em]">{t.download.title}</h2>
        <p className="mx-auto mt-3.5 max-w-[520px] text-[18px] text-white/90">{t.download.body}</p>
        <div className="mt-8 flex justify-center">
          <span className="inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-3.5 text-ink">
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
