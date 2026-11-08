"use client";

import Link from "next/link";
import { RecordMark } from "@/components/record-mark";
import { useArchive } from "@/lib/archive";
import { districtName } from "@/lib/districts";
import { folio } from "@/lib/format";

export function AdminRestaurants() {
  const { restaurants } = useArchive();
  const ordered = [...restaurants].sort((a, b) => a.page - b.page);
  return (
    <div className="px-4 py-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-3xl">餐廳</h2>
        <Link href="/admin/restaurants/new" className="text-[12px] tracking-[0.14em]">
          新入藏
        </Link>
      </div>
      <ul className="mt-4">
        {ordered.map((restaurant) => (
          <li key={restaurant.id} className="border-b border-line">
            <Link href={`/admin/restaurants/${restaurant.id}`} className="block py-3">
              <span className="flex items-baseline justify-between gap-3">
                <span className="font-serif text-xl">{restaurant.name}</span>
                <span className="font-editorial text-sm text-ink-faint">{folio(restaurant.page)}</span>
              </span>
              <span className="mt-1 block text-[12px] text-ink-soft">
                {districtName(restaurant.districtId)} · {restaurant.nameEn}
              </span>
              <span className="mt-2 flex gap-2">
                <RecordMark tone={restaurant.published ? "ink" : "quiet"}>
                  {restaurant.published ? "已出版" : "草稿"}
                </RecordMark>
                <RecordMark tone={restaurant.verified ? "stamp" : "quiet"}>
                  {restaurant.verified ? "已核實" : "待核實"}
                </RecordMark>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
