import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { firebaseReady, mapsReady } from "../lib/firebase";
import { fetchPitches } from "../lib/data";
import { useLang } from "../lib/i18n";
import type { Pitch } from "../lib/types";
import { SetupNotice } from "../components/SetupNotice";
import { DiscoverMap } from "../components/discover/DiscoverMap";
import { PitchCard } from "../components/discover/PitchCard";

type FilterId = "all" | "indoor" | "outdoor" | "five" | "sixSeven";
type SortId = "price" | "distance";

const FILTERS: { id: FilterId; en: string; ar: string }[] = [
  { id: "all", en: "All", ar: "الكل" },
  { id: "indoor", en: "Indoor", ar: "مغلق" },
  { id: "outdoor", en: "Outdoor", ar: "مفتوح" },
  { id: "five", en: "5-a-side", ar: "خماسي" },
  { id: "sixSeven", en: "6/7-a-side", ar: "سداسي وسباعي" },
];

const SORTS: { id: SortId; en: string; ar: string }[] = [
  { id: "price", en: "Price", ar: "السعر" },
  { id: "distance", en: "Nearest", ar: "الأقرب" },
];

/** True when the pitch (or any of its courts) plays one of the given formats. */
function hasSize(p: Pitch, sizes: string[]): boolean {
  return sizes.includes(p.size) || p.courts.some((c) => c.size != null && sizes.includes(c.size));
}

function matchesFilter(p: Pitch, f: FilterId): boolean {
  switch (f) {
    case "all":
      return true;
    case "indoor":
      return p.isIndoor;
    case "outdoor":
      return !p.isIndoor;
    case "five":
      return hasSize(p, ["fiveASide"]);
    case "sixSeven":
      return hasSize(p, ["sixASide", "sevenASide"]);
  }
}

function CardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="h-28 animate-pulse bg-surface-2" />
      <div className="space-y-2 p-3.5">
        <div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const { ar } = useLang();
  const navigate = useNavigate();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [sort, setSort] = useState<SortId | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const cardRefs = useRef(new globalThis.Map<string, HTMLLIElement>());

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    fetchPitches()
      .then((p) => {
        if (!alive) return;
        setPitches(p);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = pitches.filter((p) => {
      const matchesQ = !q || [p.name, p.area, p.city].some((s) => s.toLowerCase().includes(q));
      return matchesQ && matchesFilter(p, filter);
    });
    if (sort === "price") list.sort((a, b) => a.pricePerHour - b.pricePerHour);
    if (sort === "distance") list.sort((a, b) => a.distanceKm - b.distanceKm);
    return list;
  }, [pitches, query, filter, sort]);

  // A marker tap highlights the card and brings it into view.
  const handleMapSelect = (id: string) => {
    setSelectedId(id);
    cardRefs.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  if (!firebaseReady) {
    return (
      <div className="mx-auto h-full w-full max-w-[1400px] px-4 py-6 sm:px-6">
        <SetupNotice
          title={ar ? "اربط قاعدة بيانات Firebase" : "Connect the Firebase database"}
          body={
            ar
              ? "أضف مفاتيح VITE_FIREBASE_API_KEY و VITE_FIREBASE_APP_ID إلى ملف البيئة ثم أعد تحميل الصفحة لعرض الملاعب."
              : "Add VITE_FIREBASE_API_KEY and VITE_FIREBASE_APP_ID to your env file, then reload to see live pitches here."
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col px-4 py-6 sm:px-6">
      {/* Toolbar: title, count, search and filter chips. */}
      <header className="shrink-0">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-black tracking-tight">{ar ? "اكتشف" : "Discover"}</h1>
          <span className="text-sm font-semibold text-muted">
            {loading
              ? ar
                ? "جار التحميل..."
                : "Loading..."
              : `${filtered.length} ${ar ? "ملعب" : filtered.length === 1 ? "pitch" : "pitches"}`}
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={ar ? "ابحث عن ملعب أو منطقة" : "Search a pitch or area"}
            className="w-full rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-electric/50 focus:ring-4 focus:ring-electric/10 sm:max-w-xs"
          />
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scroll-thin sm:pb-0">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                className="chip"
                data-active={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {ar ? f.ar : f.en}
              </button>
            ))}
            <span className="h-5 w-px shrink-0 bg-border" aria-hidden />
            {SORTS.map((s) => (
              <button
                key={s.id}
                className="chip"
                data-active={sort === s.id}
                onClick={() => setSort(sort === s.id ? null : s.id)}
              >
                {ar ? s.ar : s.en}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Body: list pane + map pane. Stacks on small screens. */}
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto scroll-thin lg:grid lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-5 lg:overflow-hidden">
        <section className="scroll-thin lg:min-h-0 lg:overflow-y-auto lg:pe-1.5">
          {error ? (
            <div className="card p-5 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button className="btn btn-ghost mt-4" onClick={() => setReloadKey((k) => k + 1)}>
                {ar ? "أعد المحاولة" : "Try again"}
              </button>
            </div>
          ) : loading ? (
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              {ar ? "لا توجد ملاعب مطابقة." : "No pitches match."}
            </p>
          ) : (
            <ul className="space-y-3 pb-1">
              {filtered.map((p) => (
                <li
                  key={p.id}
                  className="fade-up"
                  ref={(el) => {
                    if (el) cardRefs.current.set(p.id, el);
                    else cardRefs.current.delete(p.id);
                  }}
                >
                  <PitchCard
                    pitch={p}
                    selected={selectedId === p.id}
                    onClick={() => navigate(`/pitch/${p.id}`)}
                    onHover={(hovering) => setHoveredId(hovering ? p.id : null)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card relative mt-4 h-[300px] shrink-0 overflow-hidden lg:mt-0 lg:h-auto">
          {mapsReady ? (
            <DiscoverMap
              pitches={filtered}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onSelect={handleMapSelect}
            />
          ) : (
            <SetupNotice
              title={ar ? "أضف مفتاح خرائط Google" : "Add a Google Maps key"}
              body={
                ar
                  ? "عيّن VITE_GOOGLE_MAPS_KEY لعرض خريطة الملاعب هنا. القائمة تعمل بدون الخريطة."
                  : "Set VITE_GOOGLE_MAPS_KEY to show the pitch map here. The list keeps working without it."
              }
            />
          )}
        </section>
      </div>
    </div>
  );
}
