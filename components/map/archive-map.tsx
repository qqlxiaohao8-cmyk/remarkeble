"use client";

import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MlMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { districtName, getDistrict } from "@/lib/districts";
import { districtShape } from "@/lib/district-geometry";
import type { Restaurant } from "@/lib/types";

const STYLE = "https://tiles.openfreemap.org/styles/positron";
const HONG_KONG_LIMIT: [[number, number], [number, number]] = [
  [113.78, 22.12],
  [114.5, 22.6],
];
const EMPTY: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

export type MapView =
  | { mode: "point"; lng: number; lat: number; zoom: number; frame: number }
  | { mode: "bounds"; west: number; south: number; east: number; north: number; frame: number };

export type DistrictFlash = { id: string; token: number } | null;

export type MapHandle = {
  zoomBy: (delta: number) => void;
};

export function ArchiveMap({
  restaurants,
  selectedId,
  onSelect,
  view,
  flash,
  onMap,
}: {
  restaurants: Restaurant[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  view: MapView;
  flash: DistrictFlash;
  onMap?: (handle: MapHandle | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const onSelectRef = useRef(onSelect);
  const onMapRef = useRef(onMap);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    onMapRef.current = onMap;
  }, [onMap]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let map: MlMap | null = null;
    let cancelled = false;

    (async () => {
      const maplibregl = await import("maplibre-gl");
      maplibregl.setWorkerUrl(`${location.origin}/maplibre-gl-worker.mjs`);
      if (cancelled || !containerRef.current) return;
      const nextMap = new maplibregl.Map({
        container,
        style: STYLE,
        center: [114.14, 22.35],
        zoom: 9.4,
        minZoom: 8,
        maxZoom: 17,
        maxBounds: HONG_KONG_LIMIT,
        renderWorldCopies: false,
        attributionControl: false,
        pitchWithRotate: false,
        dragRotate: false,
      });
      map = nextMap;
      onMapRef.current?.({
        zoomBy(delta) {
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          nextMap.easeTo({ zoom: nextMap.getZoom() + delta, duration: reduce ? 0 : 200, essential: true });
        },
      });
      nextMap.on("style.load", () => {
        if (cancelled) return;
        for (const layer of nextMap.getStyle().layers ?? []) {
          const id = layer.id.toLowerCase();
          if (layer.type === "hillshade" || id.includes("hillshade") || id.includes("shaded")) {
            nextMap.setLayoutProperty(layer.id, "visibility", "none");
          }
          if (layer.type !== "symbol" || !layer.layout?.["text-field"]) continue;
          try {
            nextMap.setLayoutProperty(layer.id, "text-field", [
              "coalesce",
              ["get", "name:zh-Hant"],
              ["get", "name:zh"],
              ["get", "name:nonlatin"],
              ["get", "name"],
            ]);
          } catch {
            // A formatted label can refuse this rewrite. The default name stays.
          }
        }
        const before = (nextMap.getStyle().layers ?? []).find((layer) => layer.type === "symbol")?.id;
        nextMap.addSource("district-flash", { type: "geojson", data: EMPTY });
        nextMap.addLayer(
          {
            id: "district-flash-fill",
            type: "fill",
            source: "district-flash",
            paint: { "fill-color": "#007AFF", "fill-opacity": 0 },
          },
          before,
        );
        nextMap.addLayer(
          {
            id: "district-flash-line",
            type: "line",
            source: "district-flash",
            paint: { "line-color": "#007AFF", "line-width": 2, "line-opacity": 0 },
          },
          before,
        );
        setReady(true);
      });
      nextMap.on("error", () => {
        if (nextMap.getStyle()?.layers?.length) return;
        setFailed(true);
      });
      mapRef.current = nextMap;
    })();

    const observer = new ResizeObserver(() => mapRef.current?.resize());
    observer.observe(container);

    return () => {
      cancelled = true;
      observer.disconnect();
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map?.remove();
      mapRef.current = null;
      onMapRef.current?.(null);
      setReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    let cancelled = false;

    (async () => {
      const maplibregl = await import("maplibre-gl");
      if (cancelled) return;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      const groups = new Map<string, Restaurant[]>();
      for (const restaurant of restaurants) {
        const list = groups.get(restaurant.districtId) ?? [];
        list.push(restaurant);
        groups.set(restaurant.districtId, list);
      }

      for (const restaurant of restaurants) {
        const district = getDistrict(restaurant.districtId);
        if (!district) continue;
        const siblings = groups.get(restaurant.districtId) ?? [restaurant];
        const index = siblings.findIndex((item) => item.id === restaurant.id);
        const spread = (index - (siblings.length - 1) / 2) * 0.01;
        const selected = restaurant.id === selectedId;
        const button = document.createElement("button");
        button.type = "button";
        button.className = selected ? "archive-pin archive-pin-selected" : "archive-pin";
        const name = document.createElement("span");
        name.className = "pin-name";
        name.textContent = restaurant.name;
        const dot = document.createElement("span");
        dot.className = "pin-dot";
        button.append(name, dot);
        button.setAttribute("aria-label", `${restaurant.name}，${districtName(restaurant.districtId)}`);
        button.setAttribute("aria-pressed", String(selected));
        if (restaurant.verification ? restaurant.verification === "unverified" : !restaurant.verified) {
          button.dataset.pending = "true";
        }
        button.addEventListener("click", () => onSelectRef.current(restaurant.id));
        const placed = typeof restaurant.lng === "number" && typeof restaurant.lat === "number";
        const marker = new maplibregl.Marker({ element: button, anchor: "bottom" })
          .setLngLat(placed ? [restaurant.lng as number, restaurant.lat as number] : [district.lng + spread, district.lat])
          .addTo(map);
        markersRef.current.push(marker);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, restaurants, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? 0 : 700;
    map.stop();
    if (view.mode === "point") {
      map.flyTo({ center: [view.lng, view.lat], zoom: view.zoom, essential: true, duration });
      return;
    }
    map.fitBounds(
      [
        [view.west, view.south],
        [view.east, view.north],
      ],
      { padding: { top: 124, bottom: 108, left: 36, right: 20 }, maxZoom: 14, duration, essential: true },
    );
  }, [ready, view]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const source = map.getSource("district-flash") as GeoJSONSource | undefined;
    if (!source) return;
    if (!flash) {
      source.setData(EMPTY);
      return;
    }
    const shape = districtShape(flash.id);
    const color = getDistrict(flash.id)?.color ?? "#007AFF";
    if (!shape) return;
    source.setData({ type: "Feature", geometry: shape.geometry, properties: {} });
    map.setPaintProperty("district-flash-fill", "fill-color", color);
    map.setPaintProperty("district-flash-line", "line-color", color);
    map.setPaintProperty("district-flash-fill", "fill-opacity", 0.38);
    map.setPaintProperty("district-flash-line", "line-opacity", 0.9);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hold = reduce ? 80 : 420;
    const fade = reduce ? 180 : 760;
    const started = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - started;
      const opacity = elapsed <= hold ? 0.38 : 0.38 * Math.max(0, 1 - (elapsed - hold) / fade);
      map.setPaintProperty("district-flash-fill", "fill-opacity", opacity);
      map.setPaintProperty("district-flash-line", "line-opacity", Math.min(0.9, opacity * 2.4));
      if (elapsed >= hold + fade) {
        window.clearInterval(timer);
        source.setData(EMPTY);
      }
    }, 32);
    return () => window.clearInterval(timer);
  }, [flash, ready]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" />
      {failed ? (
        <p className="pointer-events-none absolute inset-x-6 top-16 text-center text-[13px] text-ink-soft">
          地圖暫時無法展開。
        </p>
      ) : null}
    </div>
  );
}
