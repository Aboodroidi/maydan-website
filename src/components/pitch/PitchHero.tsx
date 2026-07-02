import type { Pitch } from "../../lib/types";
import { useLang } from "../../lib/i18n";
import { accentColor, amenityLabel, tierLabel } from "./helpers";

/** Accent-colored hero block: watermark, tier badge, name, location, chips. */
export function PitchHero({ pitch }: { pitch: Pitch }) {
  const { ar } = useLang();
  const pro = pitch.tier === "pro";

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-border"
      style={{ backgroundColor: accentColor(pitch.accentHex) }}
    >
      {pitch.imageURL ? (
        <img src={pitch.imageURL} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <img
          src="/assets/img/wordmark_white.svg"
          alt=""
          className="pointer-events-none absolute -bottom-4 -end-8 w-80 opacity-10"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

      <div className="relative flex min-h-[260px] flex-col justify-end gap-3 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              pro ? "bg-electric text-white" : "bg-white/15 text-white"
            }`}
          >
            {tierLabel(pitch.tier)}
          </span>
          {pitch.rating > 0 && (
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
              ★ {pitch.rating.toFixed(1)}
              {pitch.reviewCount > 0 && (
                <span className="font-semibold text-white/70">
                  {" "}
                  ({pitch.reviewCount})
                </span>
              )}
            </span>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-black text-white sm:text-4xl">{pitch.name}</h1>
          <p className="mt-1 text-sm font-semibold text-white/80">
            {[pitch.area, pitch.city].filter(Boolean).join(", ")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pitch.amenities.map((a) => (
            <span
              key={a}
              className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white"
            >
              {amenityLabel(a, ar)}
            </span>
          ))}
          {pitch.phone && (
            <a
              href={`tel:${pitch.phone}`}
              dir="ltr"
              className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20"
            >
              {pitch.phone}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
