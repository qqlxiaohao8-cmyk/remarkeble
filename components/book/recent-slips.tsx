"use client";

import Link from "next/link";
import { Plate } from "@/components/plate";
import { useArchive } from "@/lib/archive";
import { districtName } from "@/lib/districts";

export function RecentSlips() {
  const { published } = useArchive();
  const recent = [...published].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 4);

  return (
    <section className="shrink-0 px-4 pb-3">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-[11px] tracking-[0.2em] text-ink-soft">新入藏</h2>
        <p className="font-editorial text-[11px] italic text-ink-faint">Recent accessions</p>
      </div>
      <ul className="scroll-thin flex gap-3 overflow-x-auto">
        {recent.map((restaurant) => (
          <li key={restaurant.id} className="w-[4.6rem] shrink-0">
            <Link href={`/restaurant/${restaurant.slug}`} className="block">
              <div className="relative aspect-[3/4] border border-line">
                <Plate
                  motif={restaurant.motif}
                  tone={restaurant.tone}
                  className="absolute inset-0"
                  label={restaurant.name}
                />
              </div>
              <p className="mt-1 truncate text-[11px]">{restaurant.name}</p>
              <p className="truncate text-[10px] text-ink-faint">{districtName(restaurant.districtId)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
