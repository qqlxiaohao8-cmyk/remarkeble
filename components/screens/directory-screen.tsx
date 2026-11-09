"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SearchIcon } from "@/components/icons";
import { Plate } from "@/components/plate";
import { useArchive } from "@/lib/archive";
import { districtName } from "@/lib/districts";
import { MOTIFS, MOTIF_LABELS, type Motif } from "@/lib/types";
import { cn } from "@/lib/cn";

export function DirectoryScreen() {
  const { published } = useArchive();
  const [query, setQuery] = useState("");
  const [motif, setMotif] = useState<Motif | "all">("all");
  const needle = query.trim().toLowerCase();

  const motifs = useMemo(
    () => MOTIFS.filter((item) => published.some((restaurant) => restaurant.motif === item)),
    [published],
  );

  const list = useMemo(() => {
    return published.filter((restaurant) => {
      if (motif !== "all" && restaurant.motif !== motif) return false;
      if (!needle) return true;
      return [restaurant.name, restaurant.nameEn, districtName(restaurant.districtId), restaurant.excerpt, MOTIF_LABELS[restaurant.motif]]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [motif, needle, published]);

  return (
    <div className="pt-5 pr-12 pb-8 pl-5">
      <div className="space-y-3">
        <div className="relative">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索店名、招牌或地區"
            className="w-full rounded-2xl border border-paper-deep bg-white py-2.5 pr-4 pl-9 text-sm outline-none placeholder:text-ink-faint focus:ring-1 focus:ring-accent"
          />
          <SearchIcon className="absolute top-3 left-3 h-4 w-4 text-ink-faint" />
        </div>
        <div className="scroll-thin flex gap-2 overflow-x-auto pb-1 text-xs">
          <MotifPill active={motif === "all"} onClick={() => setMotif("all")}>
            全部
          </MotifPill>
          {motifs.map((item) => (
            <MotifPill key={item} active={motif === item} onClick={() => setMotif(item)}>
              {MOTIF_LABELS[item]}
            </MotifPill>
          ))}
        </div>
      </div>
      {list.length === 0 ? (
        <p className="py-10 font-serif text-sm leading-7 text-ink-soft">沒有符合的店。換一個詞，或改看全部。</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {list.map((restaurant) => (
            <li key={restaurant.id}>
              <Link
                href={`/restaurant/${restaurant.slug}`}
                className="pressable flex items-center justify-between gap-3 rounded-2xl bg-[#EFECE6] p-4 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.06),0_2px_6px_-1px_rgba(0,0,0,0.04)]"
              >
                <span className="min-w-0 space-y-2">
                  <span className="block">
                    <span className="block truncate text-sm font-bold">{restaurant.name}</span>
                    <span className="mt-0.5 block truncate text-[11px] font-medium text-[#8E8E93]">{restaurant.nameEn}</span>
                  </span>
                  <span className="inline-flex max-w-full items-center rounded-full bg-[#E2EFE4] px-2.5 py-1 text-xs font-semibold text-[#2D7544]">
                    <span className="truncate">
                      {districtName(restaurant.districtId)} {restaurant.established}
                    </span>
                  </span>
                </span>
                <span className="relative h-20 w-28 shrink-0">
                  <Plate motif={restaurant.motif} tone={restaurant.tone} className="absolute inset-0" label="" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MotifPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap",
        active ? "bg-accent text-white" : "border border-paper-deep bg-white text-ink",
      )}
    >
      {children}
    </button>
  );
}
