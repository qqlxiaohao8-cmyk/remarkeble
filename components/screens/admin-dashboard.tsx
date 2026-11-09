"use client";

import Link from "next/link";
import { useAdmin } from "@/components/admin/admin-provider";
import { Plate } from "@/components/plate";
import { districtName } from "@/lib/districts";
import { ARCHIVE_ROUTE } from "@/lib/routes";

export function AdminDashboard() {
  const { restaurants, ready, loadError } = useAdmin();
  if (loadError) return <p className="px-4 py-10 text-sm text-stamp">{loadError}</p>;
  if (!ready) return <p className="px-4 py-10 text-sm text-ink-soft">讀取檔案…</p>;
  const ordered = [...restaurants].sort((a, b) => (b.updatedAt || b.addedAt).localeCompare(a.updatedAt || a.addedAt));

  return (
    <div className="px-4 py-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-3xl">概覽</h2>
        <Link
          href={`${ARCHIVE_ROUTE}/restaurants/new`}
          aria-label="新增地點"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-3xl leading-none text-white"
        >
          +
        </Link>
      </div>
      {ordered.length === 0 ? <p className="mt-6 text-sm text-ink-soft">還沒有地點。</p> : null}
      <ul className="mt-5 grid grid-cols-2 gap-3">
        {ordered.map((restaurant) => (
          <li key={restaurant.id}>
            <Link href={`${ARCHIVE_ROUTE}/restaurants/${restaurant.id}`} className="block overflow-hidden rounded-2xl border border-line bg-white">
              <span className="relative block aspect-[3/4] bg-paper">
                {restaurant.coverImage ? (
                  <img src={restaurant.coverImage} alt="" className="h-full w-full object-contain" />
                ) : (
                  <Plate motif={restaurant.motif} tone={restaurant.tone} className="absolute inset-0" label="" />
                )}
              </span>
              <span className="block px-3 py-2">
                <span className="block truncate font-serif text-base">{restaurant.name}</span>
                <span className="mt-0.5 block truncate text-[12px] text-ink-soft">{districtName(restaurant.districtId)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
