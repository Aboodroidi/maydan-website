import { useEffect } from "react";
import { APIProvider, AdvancedMarker, Map, Marker, useMap } from "@vis.gl/react-google-maps";
import { mapId, mapsKey } from "../../lib/firebase";
import { omr } from "../../lib/data";
import type { Pitch } from "../../lib/types";

const MUSCAT = { lat: 23.588, lng: 58.3829 };

/** Pans to the selected pitch whenever the selection changes. */
function PanToSelection({ pitch }: { pitch: Pitch | null }) {
  const map = useMap();
  useEffect(() => {
    if (map && pitch) map.panTo({ lat: pitch.latitude, lng: pitch.longitude });
  }, [map, pitch]);
  return null;
}

export function DiscoverMap({
  pitches,
  selectedId,
  hoveredId,
  onSelect,
}: {
  pitches: Pitch[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
}) {
  const selected = pitches.find((p) => p.id === selectedId) ?? null;

  return (
    <APIProvider apiKey={mapsKey}>
      <Map
        defaultCenter={MUSCAT}
        defaultZoom={11.5}
        mapId={mapId || undefined}
        colorScheme="LIGHT"
        gestureHandling="greedy"
        disableDefaultUI
        zoomControl
        className="h-full w-full"
      >
        <PanToSelection pitch={selected} />
        {pitches.map((p) => {
          const active = p.id === selectedId || p.id === hoveredId;
          // Price-bubble markers need a Map ID; fall back to classic pins.
          return mapId ? (
            <AdvancedMarker
              key={p.id}
              position={{ lat: p.latitude, lng: p.longitude }}
              zIndex={active ? 2 : 1}
              onClick={() => onSelect(p.id)}
            >
              <div
                className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-bold transition-transform ${
                  active
                    ? "scale-110 border-transparent bg-electric text-white shadow-[0_4px_14px_rgba(37,99,235,0.45)]"
                    : "border-electric/30 bg-white text-electric shadow-[0_2px_10px_rgba(13,27,50,0.14)]"
                }`}
              >
                {omr(p.pricePerHour)}
              </div>
            </AdvancedMarker>
          ) : (
            <Marker
              key={p.id}
              position={{ lat: p.latitude, lng: p.longitude }}
              zIndex={active ? 2 : 1}
              onClick={() => onSelect(p.id)}
              label={{
                text: String(Math.round(p.pricePerHour)),
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: "700",
              }}
            />
          );
        })}
      </Map>
    </APIProvider>
  );
}
