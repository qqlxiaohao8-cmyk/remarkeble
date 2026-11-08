"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArchiveMap, type DistrictFlash, type MapView } from "@/components/map/archive-map";
import { Plate } from "@/components/plate";
import { useArchive } from "@/lib/archive";
import { HONG_KONG_BOUNDS, districtShape } from "@/lib/district-geometry";
import { DISTRICTS, districtName, getDistrict } from "@/lib/districts";
import { cn } from "@/lib/cn";

export function MapScreen() {
  const searchParams = useSearchParams();
  const pin = searchParams.get("pin");
  const { published } = useArchive();
  const [district, setDistrict] = useState("all");
  const [picked, setPicked] = useState<string | null | undefined>(undefined);
  const [frame, setFrame] = useState(0);
  const [flash, setFlash] = useState<DistrictFlash>(null);

  const filtered = useMemo(
    () => published.filter((restaurant) => district === "all" || restaurant.districtId === district),
    [district, published],
  );
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
    <div className="flex h-full flex-col">
      <div className="scroll-thin flex gap-1.5 overflow-x-auto border-b border-paper-deep bg-white/70 px-4 py-2">
        <FilterChip active={district === "all"} onClick={() => selectDistrict("all")}>
          全港
        </FilterChip>
        {DISTRICTS.map((item) => (
          <FilterChip key={item.id} active={district === item.id} color={item.color} onClick={() => selectDistrict(item.id)}>
            {item.name}
          </FilterChip>
        ))}
      </div>
      <div className="relative min-h-0 flex-1">
        <ArchiveMap restaurants={filtered} selectedId={selected} onSelect={setPicked} view={view} flash={flash} />
        {current ? (
          <Link
            href={`/restaurant/${current.slug}`}
            className="pressable material-card absolute right-4 bottom-4 left-4 z-10 flex items-center gap-3 rounded-2xl border border-paper-deep p-2.5"
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
        ) : (
          <div className="material-card pointer-events-none absolute right-4 bottom-4 left-4 z-10 flex items-baseline justify-between gap-3 rounded-2xl border border-paper-deep px-3 py-3 text-sm">
            <p>點一個地標，打開那一頁。</p>
            <p className="shrink-0 text-xs text-ink-soft">{filtered.length} 間</p>
          </div>
        )}
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
        "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap",
        active && !color && "bg-accent text-white",
        !active && "border border-paper-deep bg-white text-ink",
        active && color && "text-white",
      )}
      style={active && color ? { backgroundColor: color } : undefined}
    >
      {color && !active ? (
        <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      ) : null}
      {children}
    </button>
  );
}
