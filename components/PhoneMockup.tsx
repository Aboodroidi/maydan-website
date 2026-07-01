/** A glassy iPhone frame showing a miniature of the app's Discover screen. */
export function PhoneMockup() {
  return (
    <div
      className="relative w-[260px] shrink-0 rounded-[42px] p-2.5 sm:w-[290px]"
      style={{
        background: "linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.04))",
        boxShadow: "0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.25)",
      }}
    >
      <div className="relative overflow-hidden rounded-[34px] bg-bg-soft" style={{ aspectRatio: "9 / 19.5" }}>
        {/* top brand glow */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{ background: "radial-gradient(70% 100% at 50% 0%, rgba(37,99,235,0.42), transparent 70%)" }}
        />
        {/* notch */}
        <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-black/70" />

        {/* header — real electric wordmark */}
        <div className="flex items-center px-4 pt-9">
          <img src="/assets/img/wordmark_electric_blue.svg" alt="Maydan" className="h-4 w-auto" />
          <span className="ms-auto grid h-7 w-7 place-items-center rounded-full glass text-[12px]">⚽</span>
        </div>

        {/* filter chips */}
        <div className="flex gap-2 px-4 pt-4">
          <span className="glass-fill rounded-full px-3 py-1 text-[11px] font-semibold text-electric-bright">5-a-side</span>
          <span className="glass rounded-full px-3 py-1 text-[11px] font-medium text-muted">Grass</span>
          <span className="glass rounded-full px-3 py-1 text-[11px] font-medium text-muted">Indoor</span>
        </div>

        {/* pitch card */}
        <div className="mx-4 mt-4 overflow-hidden rounded-2xl glass">
          <div className="h-24 w-full" style={{ background: "linear-gradient(135deg, #1c3a6e, #2563eb)" }} />
          <div className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold">Goal One Centre</span>
              <span className="text-[12px] font-bold text-electric-bright">OMR 12</span>
            </div>
            <div className="mt-1 text-[11px] text-muted">Al Khuwair · 2.1 km</div>
            <div className="mt-3 flex gap-1.5">
              {["6PM", "7PM", "8PM"].map((tm, i) => (
                <span
                  key={tm}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                    i === 1 ? "glass-fill text-electric-bright" : "glass text-ink"
                  }`}
                >
                  {tm}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* bottom booking bar */}
        <div className="absolute inset-x-3 bottom-3">
          <div className="glass-prominent rounded-2xl py-3 text-center text-[13px] font-bold">Book now</div>
        </div>
      </div>
    </div>
  );
}
