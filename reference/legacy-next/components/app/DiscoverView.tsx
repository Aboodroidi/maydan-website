"use client";

import { useEffect, useMemo, useState } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { firebaseReady, mapsReady, mapsKey } from "@/lib/firebase";
import { fetchPitches, omr } from "@/lib/pitches";
import type { Pitch } from "@/lib/types";
import { useLang } from "@/components/LangProvider";
import { SetupNotice } from "./SetupNotice";

const MUSCAT = { lat: 23.588, lng: 58.3829 };

export function DiscoverView() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [surface, setSurface] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return;
    }
    let alive = true;
    fetchPitches()
      .then((p) => alive && (setPitches(p), setLoading(false)))
      .catch((e) => alive && (setError(String(e?.message ?? e)), setLoading(false)));
    return () => {
      alive = false;
    };
  }, []);

  const surfaces = useMemo(
    () => Array.from(new Set(pitches.map((p) => p.surface).filter(Boolean))),
    [pitches]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pitches.filter((p) => {
      const matchesQ =
        !q || [p.name, p.area, p.city].some((s) => s.toLowerCase().includes(q));
      const matchesS = surface === "all" || p.surface === surface;
      return matchesQ && matchesS;
    });
  }, [pitches, query, surface]);

  const selected = filtered.find((p) => p.id === selectedId) ?? null;
  const center = selected ? { lat: selected.latitude, lng: selected.longitude } : MUSCAT;

  if (!firebaseReady) {
    return (
      <SetupNotice
        title={ar ? "اربط قاعدة بيانات Firebase" : "Connect the Firebase database"}
        steps={[
          "Firebase Console → Project settings → Add app → Web → register the web app.",
          "Copy the firebaseConfig values into .env.local as NEXT_PUBLIC_FIREBASE_* (and GitHub Action variables for the live build).",
          "Reload — the live pitches will appear here on the map.",
        ]}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={ar ? "ابحث عن ملعب أو منطقة" : "Search a pitch or area"}
          className="w-full max-w-xs rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-electric-bright"
        />
        <div className="flex items-center gap-2 overflow-x-auto scroll-thin">
          <button className="chip" data-active={surface === "all"} onClick={() => setSurface("all")}>
            {ar ? "الكل" : "All"}
          </button>
          {surfaces.map((s) => (
            <button key={s} className="chip" data-active={surface === s} onClick={() => setSurface(s)}>
              {s}
            </button>
          ))}
        </div>
        <span className="ms-auto text-sm text-muted">
          {loading ? (ar ? "جارٍ التحميل…" : "Loading…") : `${filtered.length} ${ar ? "ملعب" : "pitches"}`}
        </span>
      </div>

      {/* body: list + map */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[380px_1fr]">
        {/* list */}
        <div className="min-h-0 overflow-y-auto border-e border-border scroll-thin">
          {error && <p className="p-6 text-sm text-red-400">{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <p className="p-6 text-sm text-muted">{ar ? "لا توجد ملاعب" : "No pitches found."}</p>
          )}
          <ul className="divide-y divide-[color:var(--color-border)]">
            {filtered.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setSelectedId(p.id)}
                  className={`pitch-row flex w-full gap-3 p-4 text-start ${
                    selectedId === p.id ? "bg-surface" : "hover:bg-surface/60"
                  }`}
                >
                  <div
                    className="h-16 w-16 shrink-0 rounded-xl bg-cover bg-center"
                    style={{
                      backgroundColor: `#${(p.accentHex & 0xffffff).toString(16).padStart(6, "0")}`,
                      backgroundImage: p.imageURL ? `url(${p.imageURL})` : undefined,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-bold">{p.name}</span>
                      <span className="shrink-0 text-sm font-bold text-electric-bright">{omr(p.pricePerHour)}</span>
                    </div>
                    <div className="mt-0.5 truncate text-[13px] text-muted">
                      {[p.area, p.city].filter(Boolean).join(" · ")}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[12px] text-muted">
                      {p.rating > 0 && <span>★ {p.rating.toFixed(1)}</span>}
                      {p.surface && <span>· {p.surface}</span>}
                      {p.isIndoor && <span>· {ar ? "مغلق" : "Indoor"}</span>}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* map */}
        <div className="relative min-h-[320px]">
          {!mapsReady ? (
            <SetupNotice
              title={ar ? "أضف مفتاح خرائط Google" : "Add a Google Maps key"}
              steps={[
                "Google Cloud Console → Credentials → Create API key.",
                "Restrict it to the Maps JavaScript API + HTTP referrers (maydan.om/*, localhost:3000/*).",
                "Set it as NEXT_PUBLIC_GOOGLE_MAPS_KEY. The map with pitch pins will render here.",
              ]}
            />
          ) : (
            <APIProvider apiKey={mapsKey}>
              <Map
                key={ar ? "ar" : "en"}
                defaultCenter={MUSCAT}
                center={selected ? center : undefined}
                defaultZoom={11}
                gestureHandling="greedy"
                disableDefaultUI={false}
                colorScheme="DARK"
                className="h-full w-full"
              >
                {filtered.map((p) => (
                  <Marker
                    key={p.id}
                    position={{ lat: p.latitude, lng: p.longitude }}
                    onClick={() => setSelectedId(p.id)}
                    label={{ text: String(Math.round(p.pricePerHour)), color: "#fff", fontSize: "11px", fontWeight: "700" }}
                  />
                ))}
              </Map>
            </APIProvider>
          )}
        </div>
      </div>
    </div>
  );
}
