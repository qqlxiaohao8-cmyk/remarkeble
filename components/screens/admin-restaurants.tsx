"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DeleteRestaurant } from "@/components/admin/delete-restaurant";
import { useAdmin } from "@/components/admin/admin-provider";
import { fieldClass } from "@/components/admin/fields";
import { RecordMark } from "@/components/record-mark";
import { DISTRICTS, districtName } from "@/lib/districts";
import { folio } from "@/lib/format";
import { ARCHIVE_ROUTE } from "@/lib/routes";
import { PUBLICATION_LABELS, publicationOf, VERIFICATION_LABELS, verificationOf } from "@/lib/status";

export function AdminRestaurants() {
  const { restaurants, ready, loadError } = useAdmin();
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("all");
  const ordered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...restaurants]
      .filter((restaurant) => {
        if (district !== "all" && restaurant.districtId !== district) return false;
        if (!needle) return true;
        return [restaurant.name, restaurant.nameEn, districtName(restaurant.districtId), restaurant.slug]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      })
      .sort((a, b) => a.page - b.page);
  }, [district, query, restaurants]);

  if (loadError) return <p className="px-4 py-10 text-sm text-stamp">{loadError}</p>;
  if (!ready) return <p className="px-4 py-10 text-sm text-ink-soft">讀取檔案…</p>;

  return (
    <div className="px-4 py-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-3xl">餐廳</h2>
        <Link href={`${ARCHIVE_ROUTE}/restaurants/new`} className="text-sm font-medium text-accent">
          新入藏
        </Link>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px]">
        <input
          className={fieldClass}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索店名或代號"
          aria-label="搜索餐廳"
        />
        <select className={fieldClass} value={district} aria-label="地區" onChange={(event) => setDistrict(event.target.value)}>
          <option value="all">全部地區</option>
          {DISTRICTS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      {ordered.length === 0 ? <p className="mt-6 text-sm text-ink-soft">沒有符合的餐廳。</p> : null}
      <ul className="mt-4">
        {ordered.map((restaurant) => (
          <li key={restaurant.id} className="flex items-center justify-between gap-3 border-b border-line py-3">
            <Link href={`${ARCHIVE_ROUTE}/restaurants/${restaurant.id}`} className="min-w-0">
              <span className="flex items-baseline justify-between gap-3">
                <span className="truncate font-serif text-xl">{restaurant.name}</span>
                <span className="font-editorial text-sm text-ink-faint">{folio(restaurant.page)}</span>
              </span>
              <span className="mt-1 block truncate text-[12px] text-ink-soft">
                {districtName(restaurant.districtId)} · {restaurant.nameEn || restaurant.slug}
              </span>
              <span className="mt-2 flex gap-2">
                <RecordMark tone={publicationOf(restaurant) === "published" ? "ink" : "quiet"}>
                  {PUBLICATION_LABELS[publicationOf(restaurant)]}
                </RecordMark>
                <RecordMark tone={verificationOf(restaurant) === "verified" ? "stamp" : "quiet"}>
                  {VERIFICATION_LABELS[verificationOf(restaurant)]}
                </RecordMark>
              </span>
            </Link>
            <span className="flex shrink-0 flex-col items-end gap-2">
              <Link href={`${ARCHIVE_ROUTE}/restaurants/${restaurant.id}`} className="text-sm font-medium text-accent">
                編輯
              </Link>
              <DeleteRestaurant id={restaurant.id} name={restaurant.name} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
