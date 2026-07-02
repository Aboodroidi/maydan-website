import type { Slot } from "../../lib/types";
import { useLang } from "../../lib/i18n";
import { timeLabel } from "./helpers";

/** Time chips for the selected day's available slots. */
export function SlotGrid({
  slots,
  selectedId,
  onSelect,
}: {
  slots: Slot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { ar } = useLang();

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 xl:grid-cols-6">
      {slots.map((s) => {
        const active = s.id === selectedId;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`rounded-xl border py-3 text-sm font-bold ${
              active
                ? "border-electric/45 bg-electric/10 text-electric"
                : "border-border bg-surface text-ink hover:border-electric/30 hover:bg-surface-2"
            }`}
          >
            {timeLabel(s.startMs, ar)}
          </button>
        );
      })}
    </div>
  );
}
