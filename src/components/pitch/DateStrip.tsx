import { useMemo } from "react";
import { useLang } from "../../lib/i18n";
import { dayKeyOf, dayParts, nextDays } from "./helpers";

/** The next 7 days (Muscat time) as selectable chips. */
export function DateStrip({
  selectedKey,
  onSelect,
}: {
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  const { ar } = useLang();
  const days = useMemo(() => nextDays(7), []);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scroll-thin">
      {days.map((ms) => {
        const key = dayKeyOf(ms);
        const active = key === selectedKey;
        const parts = dayParts(ms, ar);
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border px-2 py-2.5 ${
              active
                ? "border-electric/45 bg-electric/10 text-electric"
                : "border-border bg-surface text-muted hover:border-electric/30 hover:text-ink"
            }`}
          >
            <span className="text-[11px] font-semibold uppercase">{parts.weekday}</span>
            <span className={`text-lg font-black ${active ? "" : "text-ink"}`}>{parts.day}</span>
            <span className="text-[11px] font-semibold">{parts.month}</span>
          </button>
        );
      })}
    </div>
  );
}
