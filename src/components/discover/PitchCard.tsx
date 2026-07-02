import type { ReactNode } from "react";
import { omr } from "../../lib/data";
import { useLang } from "../../lib/i18n";
import type { Pitch } from "../../lib/types";

/** Raw Firestore size values to the app's short labels. */
const SIZE_LABELS: Record<string, string> = {
  fiveASide: "5v5",
  sixASide: "6v6",
  sevenASide: "7v7",
  elevenASide: "11v11",
};

const SURFACE_LABELS: Record<string, { en: string; ar: string }> = {
  grass: { en: "Grass", ar: "عشب طبيعي" },
  turf: { en: "Turf", ar: "عشب صناعي" },
  hybrid: { en: "Hybrid", ar: "هجين" },
};

const AMENITY_LABELS: Record<string, { en: string; ar: string }> = {
  parking: { en: "Parking", ar: "مواقف" },
  showers: { en: "Showers", ar: "دشات" },
  lighting: { en: "Floodlights", ar: "إضاءة" },
  lockers: { en: "Lockers", ar: "خزائن" },
  cafe: { en: "Cafe", ar: "مقهى" },
  water: { en: "Water", ar: "ماء" },
  indoor: { en: "Indoor", ar: "مغلق" },
};

/** The app stores accent colors as a number (0xRRGGBB). */
function accentColor(hex: number): string {
  return `#${(hex & 0xffffff).toString(16).padStart(6, "0")}`;
}

/** Small translucent pill used on the banner (surface, size, indoor). */
function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-black/35 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
      {children}
    </span>
  );
}

export function PitchCard({
  pitch,
  selected,
  onClick,
  onHover,
}: {
  pitch: Pitch;
  selected: boolean;
  onClick: () => void;
  onHover: (hovering: boolean) => void;
}) {
  const { ar } = useLang();
  const pro = pitch.tier === "pro";
  const surface = SURFACE_LABELS[pitch.surface];
  const size = SIZE_LABELS[pitch.size];
  const amenities = pitch.amenities.map((a) => {
    const label = AMENITY_LABELS[a];
    return label ? (ar ? label.ar : label.en) : a;
  });

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={`card w-full overflow-hidden text-start ${
        selected ? "ring-1 ring-electric-bright" : "card-hover"
      }`}
    >
      {/* Accent banner: brand watermark, photo when present, tags and price. */}
      <div className="relative h-28" style={{ backgroundColor: accentColor(pitch.accentHex) }}>
        {pitch.imageURL && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${pitch.imageURL})` }}
          />
        )}
        <img
          src="/assets/img/watermark_white.svg"
          alt=""
          className="pointer-events-none absolute -top-3 -end-5 h-24 w-24 opacity-15"
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/45" />
        <div className="absolute bottom-2.5 start-3 flex items-center gap-1.5">
          {surface && <Tag>{ar ? surface.ar : surface.en}</Tag>}
          {size && <Tag>{size}</Tag>}
          {pitch.isIndoor && <Tag>{ar ? "مغلق" : "Indoor"}</Tag>}
        </div>
        <div className="absolute bottom-2.5 end-3 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
          <span className="text-[15px] font-extrabold">{omr(pitch.pricePerHour)}</span>
          <span className="ms-1 text-[11px] font-semibold opacity-90">{ar ? "/ ساعة" : "/ hr"}</span>
        </div>
      </div>

      <div className="p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-[15px] font-bold">
            {pitch.name}
            {pro && (
              <span className="ms-1.5 text-[12px] font-extrabold italic text-electric-bright">Pro</span>
            )}
          </span>
          {pitch.rating > 0 && (
            <span className="shrink-0 text-[12px] font-semibold text-muted">
              <span className="text-amber-400">★</span> {pitch.rating.toFixed(1)}
              {pitch.reviewCount > 0 ? ` (${pitch.reviewCount})` : ""}
            </span>
          )}
        </div>
        <div className="mt-0.5 truncate text-[13px] text-muted">
          {[pitch.area, pitch.city].filter(Boolean).join(" · ")}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              pro ? "bg-electric/15 text-electric-bright" : "bg-surface-2 text-muted"
            }`}
          >
            {pro ? (ar ? "قابل للحجز" : "Bookable") : ar ? "اتصل للحجز" : "Call to book"}
          </span>
          {amenities.length > 0 && (
            <span className="min-w-0 truncate text-[12px] text-muted">{amenities.join(" · ")}</span>
          )}
        </div>
      </div>
    </button>
  );
}
