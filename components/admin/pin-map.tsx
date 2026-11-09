"use client";

import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

const STYLE = "https://tiles.openfreemap.org/styles/positron";
const LIMIT: [[number, number], [number, number]] = [
  [113.78, 22.12],
  [114.5, 22.6],
];

export function PinMap({
  lat,
  lng,
  onPick,
}: {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onPickRef = useRef(onPick);
  const pointRef = useRef({ lat, lng });
  onPickRef.current = onPick;
  pointRef.current = { lat, lng };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let map: import("maplibre-gl").Map | null = null;
    let marker: import("maplibre-gl").Marker | null = null;

    (async () => {
      const maplibregl = await import("maplibre-gl");
      maplibregl.setWorkerUrl(`${location.origin}/maplibre-gl-worker.mjs`);
      if (cancelled || !containerRef.current) return;
      const start = pointRef.current;
      const placed = typeof start.lat === "number" && typeof start.lng === "number";
      map = new maplibregl.Map({
        container,
        style: STYLE,
        center: placed ? [start.lng as number, start.lat as number] : [114.15, 22.35],
        zoom: placed ? 15 : 10.5,
        minZoom: 9,
        maxZoom: 18,
        maxBounds: LIMIT,
        attributionControl: false,
        pitchWithRotate: false,
        dragRotate: false,
      });
      map.getCanvas().style.cursor = "crosshair";
      const dot = document.createElement("div");
      dot.style.cssText =
        "width:16px;height:16px;border-radius:999px;background:#ff3b30;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)";
      marker = new maplibregl.Marker({ element: dot, anchor: "center" });
      if (placed) marker.setLngLat([start.lng as number, start.lat as number]).addTo(map);
      map.on("click", (event) => {
        const nextLng = event.lngLat.lng;
        const nextLat = event.lngLat.lat;
        marker?.setLngLat([nextLng, nextLat]).addTo(map as import("maplibre-gl").Map);
        onPickRef.current(nextLat, nextLng);
      });
      map.once("load", () => map?.resize());
    })();

    return () => {
      cancelled = true;
      marker?.remove();
      map?.remove();
    };
  }, []);

  return <div ref={containerRef} className="h-56 overflow-hidden rounded-2xl border border-line bg-paper-deep" />;
}
