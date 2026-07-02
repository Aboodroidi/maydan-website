import type { Court } from "../../lib/types";
import { useLang } from "../../lib/i18n";
import { omr } from "../../lib/data";

/**
 * The venue's individual pitches. Unavailable ones render dimmed and struck
 * through and can't be selected, mirroring the app's court rows.
 */
export function CourtList({
  courts,
  selectedId,
  onSelect,
}: {
  courts: Court[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { ar } = useLang();

  return (
    <div className="flex flex-col gap-2.5">
      {courts.map((c) => {
        const available = c.isAvailable !== false;
        const active = available && c.id === selectedId;
        return (
          <button
            key={c.id}
            disabled={!available}
            onClick={() => onSelect(c.id)}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-start ${
              !available
                ? "cursor-not-allowed border-border bg-surface/50 opacity-50"
                : active
                  ? "border-electric-bright/50 bg-electric/15"
                  : "border-border bg-surface hover:bg-surface-2"
            }`}
          >
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                active ? "border-electric-bright" : "border-muted"
              }`}
            >
              {active && <span className="h-2.5 w-2.5 rounded-full bg-electric-bright" />}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={`block truncate font-bold ${
                  !available ? "line-through" : active ? "text-electric-bright" : "text-ink"
                }`}
              >
                {c.name}
              </span>
              <span className="mt-0.5 block truncate text-[13px] text-muted">
                {available ? c.attributes.join(" | ") : ar ? "غير متاح" : "Unavailable"}
              </span>
            </span>
            <span
              className={`shrink-0 text-sm font-bold ${
                active ? "text-electric-bright" : "text-ink"
              }`}
            >
              {omr(c.pricePerHour)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
