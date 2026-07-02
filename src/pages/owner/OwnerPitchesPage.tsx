import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { firebaseReady } from "../../lib/firebase";
import { useAuth } from "../../lib/auth";
import { useLang } from "../../lib/i18n";
import { omr } from "../../lib/data";
import { savePitch, useOwnedPitches } from "../../lib/owner";
import type { Court, Pitch } from "../../lib/types";
import { SetupNotice } from "../../components/SetupNotice";

type SaveState = { state: "saving" | "saved" | "error"; message?: string };

const accentCss = (hex: number) => `#${(hex & 0xffffff).toString(16).padStart(6, "0")}`;

function tierLabel(tier: string, ar: boolean): string {
  if (tier === "pro") return ar ? "ميدان برو" : "Maydan Pro";
  if (tier === "plus") return ar ? "ميدان بلس" : "Maydan Plus";
  return ar ? "ميدان" : "Maydan";
}

export default function OwnerPitchesPage() {
  const { ar } = useLang();
  const { user, loading: authLoading } = useAuth();
  const { pitches, setPitches, loading: pitchesLoading, error } = useOwnedPitches(user?.uid);

  // Draft price inputs, keyed by pitch id / `${pitchId}:${courtId}`.
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const flash = (pitchId: string, state: SaveState) => {
    setSaveStates((s) => ({ ...s, [pitchId]: state }));
    if (state.state === "saved") {
      clearTimeout(timers.current[pitchId]);
      timers.current[pitchId] = setTimeout(() => {
        setSaveStates((s) => {
          const { [pitchId]: _gone, ...rest } = s;
          return rest;
        });
      }, 2200);
    }
  };

  /** Optimistically applies `next`, persists it, reverts on failure. */
  const persist = async (next: Pitch) => {
    const prev = pitches;
    setPitches(pitches.map((p) => (p.id === next.id ? next : p)));
    flash(next.id, { state: "saving" });
    try {
      await savePitch({ ...next, ownerUid: next.ownerUid ?? user?.uid ?? null });
      flash(next.id, { state: "saved" });
    } catch (e: unknown) {
      setPitches(prev);
      flash(next.id, {
        state: "error",
        message: e instanceof Error ? e.message : String(e),
      });
    }
  };

  const savePitchPrice = (pitch: Pitch) => {
    const raw = priceDrafts[pitch.id];
    const value = raw === undefined ? pitch.pricePerHour : Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      flash(pitch.id, { state: "error", message: ar ? "سعر غير صالح." : "Enter a valid price." });
      return;
    }
    void persist({ ...pitch, pricePerHour: value });
  };

  const saveCourtPrice = (pitch: Pitch, court: Court) => {
    const key = `${pitch.id}:${court.id}`;
    const raw = priceDrafts[key];
    const value = raw === undefined ? court.pricePerHour : Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      flash(pitch.id, { state: "error", message: ar ? "سعر غير صالح." : "Enter a valid price." });
      return;
    }
    void persist({
      ...pitch,
      courts: pitch.courts.map((c) => (c.id === court.id ? { ...c, pricePerHour: value } : c)),
    });
  };

  const toggleCourt = (pitch: Pitch, court: Court) => {
    const on = court.isAvailable ?? true;
    void persist({
      ...pitch,
      courts: pitch.courts.map((c) => (c.id === court.id ? { ...c, isAvailable: !on } : c)),
    });
  };

  if (!firebaseReady) {
    return (
      <SetupNotice
        title={ar ? "اربط قاعدة بيانات Firebase" : "Connect the Firebase database"}
        body={
          ar
            ? "أضف مفاتيح VITE_FIREBASE_* إلى ملف البيئة ثم أعد التحميل لإدارة ملاعبك."
            : "Add the VITE_FIREBASE_* keys to your env file and reload to manage your pitches."
        }
      />
    );
  }

  if (authLoading || (user && pitchesLoading)) {
    return <p className="p-8 text-sm text-muted">{ar ? "جارٍ التحميل…" : "Loading…"}</p>;
  }

  if (!user) {
    return (
      <div className="grid h-full place-items-center p-8">
        <div className="card max-w-md p-7 text-center fade-up">
          <h1 className="text-lg font-bold">
            {ar ? "سجل الدخول لإدارة ملاعبك" : "Sign in to manage your pitches"}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {ar
              ? "أدوات المالك تتطلب حساباً مسجلاً. سجل الدخول بنفس حساب التطبيق."
              : "Owner tools need a signed in account. Use the same account as the iOS app."}
          </p>
          <Link to="/signin" className="btn btn-primary mt-5">
            {ar ? "تسجيل الدخول" : "Sign in"}
          </Link>
        </div>
      </div>
    );
  }

  if (pitches.length === 0) {
    return (
      <div className="grid h-full place-items-center p-8">
        <div className="card max-w-md p-7 text-center fade-up">
          <h1 className="text-lg font-bold">{ar ? "لا توجد ملاعب" : "No pitches yet"}</h1>
          <p className="mt-3 text-sm text-muted">
            {ar
              ? "لا توجد ملاعب مرتبطة بهذا الحساب بعد. أدر ملاعبك من تطبيق iOS أو تواصل مع ميدان."
              : "No pitches linked to this account yet. Manage pitches from the iOS app or contact Maydan."}
          </p>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 p-6 lg:p-8 fade-up">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-extrabold">{ar ? "ملاعبي" : "My pitches"}</h1>
        <p className="text-sm text-muted">
          {ar ? `${pitches.length} ملاعب` : `${pitches.length} pitches`}
        </p>
      </header>

      {pitches.map((pitch) => {
        const state = saveStates[pitch.id];
        return (
          <section key={pitch.id} className="card p-5">
            {/* Header row */}
            <div className="flex items-center gap-3">
              <div
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                style={{ backgroundColor: accentCss(pitch.accentHex) }}
              >
                <img src="/assets/img/logo_white.svg" alt="" className="h-5 w-5 opacity-90" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-bold">{pitch.name}</h2>
                <p className="mt-0.5 truncate text-[13px] text-muted">
                  {[pitch.area, pitch.city].filter(Boolean).join(", ")} ·{" "}
                  {omr(pitch.pricePerHour)} {ar ? "للساعة" : "per hour"}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-electric/15 px-2.5 py-1 text-[11px] font-bold text-electric-bright">
                {tierLabel(pitch.tier, ar)}
              </span>
            </div>

            {/* Save feedback */}
            <div className="mt-2 min-h-[18px] text-[12px]" aria-live="polite">
              {state?.state === "saving" && (
                <span className="text-muted">{ar ? "جارٍ الحفظ…" : "Saving…"}</span>
              )}
              {state?.state === "saved" && (
                <span className="font-semibold text-emerald-400">{ar ? "تم الحفظ" : "Saved"}</span>
              )}
              {state?.state === "error" && (
                <span className="text-red-400">
                  {ar ? "تعذر الحفظ." : "Could not save."} {state.message}
                </span>
              )}
            </div>

            {/* Pitch-level price */}
            <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-bg-soft p-3">
              <label
                htmlFor={`price-${pitch.id}`}
                className="text-[13px] font-semibold text-muted"
              >
                {ar ? "السعر بالساعة (ر.ع)" : "Price per hour (OMR)"}
              </label>
              <input
                id={`price-${pitch.id}`}
                type="number"
                min="0"
                step="0.5"
                inputMode="decimal"
                dir="ltr"
                value={priceDrafts[pitch.id] ?? String(pitch.pricePerHour)}
                onChange={(e) =>
                  setPriceDrafts((d) => ({ ...d, [pitch.id]: e.target.value }))
                }
                className="w-24 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-bold outline-none focus:border-electric-bright"
              />
              <button
                className="btn btn-primary !px-4 !py-2 !text-[13px]"
                onClick={() => savePitchPrice(pitch)}
              >
                {ar ? "حفظ" : "Save"}
              </button>
            </div>

            {/* Courts */}
            <div className="mt-4">
              <h3 className="text-[13px] font-bold text-muted">{ar ? "الملاعب" : "Courts"}</h3>
              {pitch.courts.length === 0 ? (
                <p className="mt-2 text-[13px] text-muted">
                  {ar
                    ? "لا توجد ملاعب فرعية لهذا المكان. أضفها من تطبيق iOS."
                    : "No courts on this venue yet. Add them from the iOS app."}
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-[color:var(--color-border)]">
                  {pitch.courts.map((court) => {
                    const key = `${pitch.id}:${court.id}`;
                    const on = court.isAvailable ?? true;
                    return (
                      <li
                        key={court.id}
                        className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-sm font-bold ${on ? "" : "text-muted line-through"}`}>
                            {court.name || (ar ? "ملعب" : "Court")}
                          </p>
                          {court.attributes.length > 0 && (
                            <p className="mt-0.5 truncate text-[12px] text-muted">
                              {court.attributes.join(" · ")}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            inputMode="decimal"
                            dir="ltr"
                            aria-label={ar ? "سعر الملعب بالساعة" : "Court price per hour"}
                            value={priceDrafts[key] ?? String(court.pricePerHour)}
                            onChange={(e) =>
                              setPriceDrafts((d) => ({ ...d, [key]: e.target.value }))
                            }
                            className="w-20 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm font-bold outline-none focus:border-electric-bright"
                          />
                          <button
                            className="btn btn-ghost !px-3 !py-1.5 !text-[12px]"
                            onClick={() => saveCourtPrice(pitch, court)}
                          >
                            {ar ? "حفظ" : "Save"}
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[12px] text-muted">
                            {on ? (ar ? "متاح" : "Available") : ar ? "غير متاح" : "Unavailable"}
                          </span>
                          <button
                            role="switch"
                            aria-checked={on}
                            aria-label={ar ? "تبديل الإتاحة" : "Toggle availability"}
                            onClick={() => toggleCourt(pitch, court)}
                            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                              on ? "bg-electric" : "bg-surface-2 border border-border"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                                on ? "start-[22px]" : "start-0.5"
                              }`}
                            />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
