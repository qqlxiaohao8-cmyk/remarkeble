"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { SearchIcon } from "@/components/icons";
import { ArchiveMap, type DistrictFlash, type MapHandle, type MapView } from "@/components/map/archive-map";
import { Plate } from "@/components/plate";
import { useArchive } from "@/lib/archive";
import { HONG_KONG_BOUNDS, districtShape } from "@/lib/district-geometry";
import { DISTRICTS, districtName, getDistrict } from "@/lib/districts";
import { MOTIF_LABELS } from "@/lib/types";
import { cn } from "@/lib/cn";

export function MapScreen() {
  const searchParams = useSearchParams();
  const pin = searchParams.get("pin");
  const { published } = useArchive();
  const [district, setDistrict] = useState("all");
  const [picked, setPicked] = useState<string | null | undefined>(undefined);
  const [frame, setFrame] = useState(0);
  const [flash, setFlash] = useState<DistrictFlash>(null);
  const [query, setQuery] = useState("");
  const mapHandle = useRef<MapHandle | null>(null);
  const needle = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return published.filter((restaurant) => {
      if (district !== "all" && restaurant.districtId !== district) return false;
      if (!needle) return true;
      return [restaurant.name, restaurant.nameEn, districtName(restaurant.districtId), restaurant.excerpt, MOTIF_LABELS[restaurant.motif]]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [district, needle, published]);
  const pinRestaurant = pin ? published.find((restaurant) => restaurant.slug === pin) : undefined;
  const selected =
    picked !== undefined
      ? picked && filtered.some((restaurant) => restaurant.id === picked)
        ? picked
        : null
      : pinRestaurant && filtered.some((restaurant) => restaurant.id === pinRestaurant.id)
        ? pinRestaurant.id
        : null;
  const current = filtered.find((restaurant) => restaurant.id === selected);

  const view = useMemo<MapView>(() => {
    if (current) {
      if (typeof current.lng === "number" && typeof current.lat === "number") {
        return { mode: "point", lng: current.lng, lat: current.lat, zoom: 15, frame };
      }
      const place = getDistrict(current.districtId);
      if (place) return { mode: "point", lng: place.lng, lat: place.lat, zoom: 15, frame };
    }
    const bounds = district === "all" ? HONG_KONG_BOUNDS : districtShape(district)?.bounds ?? HONG_KONG_BOUNDS;
    const [west, south, east, north] = bounds;
    return { mode: "bounds", west, south, east, north, frame };
  }, [current, district, frame]);

  function selectDistrict(next: string) {
    setDistrict(next);
    setPicked(null);
    setFrame((value) => value + 1);
    setFlash(next === "all" ? null : { id: next, token: Date.now() });
  }

  return (
    <div className="relative h-full">
      <ArchiveMap
        restaurants={filtered}
        selectedId={selected}
        onSelect={setPicked}
        view={view}
        flash={flash}
        onMap={(handle) => {
          mapHandle.current = handle;
        }}
      />
      <div className="pointer-events-none absolute top-3 right-4 left-4 z-20 space-y-2">
        <label className="pointer-events-auto flex items-center rounded-2xl border border-black/5 bg-white/95 p-3 shadow-[0_14px_30px_-6px_rgba(0,0,0,0.12)] backdrop-blur-md">
          <SearchIcon className="h-4 w-4 shrink-0 text-[#636366]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索店名、招牌或地區"
            aria-label="搜索店名、招牌或地區"
            className="min-w-0 flex-1 bg-transparent pl-2.5 text-xs font-bold outline-none placeholder:font-medium placeholder:text-[#8E8E93]"
          />
        </label>
        <div className="pointer-events-auto scroll-thin flex gap-2 overflow-x-auto py-1">
          <FilterChip active={district === "all"} onClick={() => selectDistrict("all")}>
            全港
          </FilterChip>
          {DISTRICTS.map((item) => (
            <FilterChip key={item.id} active={district === item.id} color={item.color} onClick={() => selectDistrict(item.id)}>
              {item.name}
            </FilterChip>
          ))}
        </div>
      </div>
      <div
        className={cn(
          "absolute left-4 z-10 flex flex-col overflow-hidden rounded-2xl bg-white/95 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.06),0_2px_6px_-1px_rgba(0,0,0,0.04)] backdrop-blur-md",
          current ? "bottom-28" : "bottom-6",
        )}
      >
        <button
          type="button"
          aria-label="放大"
          onClick={() => mapHandle.current?.zoomBy(1)}
          className="flex h-9 w-9 items-center justify-center border-b border-black/5 text-lg font-bold"
        >
          +
        </button>
        <button
          type="button"
          aria-label="縮小"
          onClick={() => mapHandle.current?.zoomBy(-1)}
          className="flex h-9 w-9 items-center justify-center text-lg font-bold"
        >
          −
        </button>
      </div>
      <button
        type="button"
        aria-label="回到這個範圍"
        onClick={() => {
          setPicked(null);
          setFrame((value) => value + 1);
        }}
        className={cn(
          "absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#698E7B] text-white shadow-[0_14px_30px_-6px_rgba(0,0,0,0.12)]",
          current ? "bottom-28" : "bottom-6",
        )}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M12 3.2 20.2 19.4 12 16.2 3.8 19.4 12 3.2Z" />
        </svg>
      </button>
      <div className="pointer-events-none absolute inset-0">
        {current ? (
          <Link
            href={`/restaurant/${current.slug}`}
            className="pressable pointer-events-auto material-card absolute right-4 bottom-4 left-4 z-10 flex items-center gap-3 rounded-2xl border border-paper-deep p-2.5"
          >
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-paper-deep">
              <Plate motif={current.motif} tone={current.tone} className="absolute inset-0" label="" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-serif text-base font-bold">{current.name}</span>
              <span className="mt-1 flex gap-x-2 text-xs text-ink-soft">
                <span>{districtName(current.districtId)}</span>
                <span>{current.established}</span>
              </span>
            </span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap shadow-[0_8px_24px_-4px_rgba(0,0,0,0.06)]",
        active ? "bg-[#1C1C1A] text-white" : "bg-white/90 text-[#3A3A3C] backdrop-blur-md",
      )}
    >
      <span
        className="h-5 w-5 shrink-0 rounded-full"
        style={{ backgroundColor: color ?? "#DCE7DA" }}
      />
      {children}
    </button>
  );
}
