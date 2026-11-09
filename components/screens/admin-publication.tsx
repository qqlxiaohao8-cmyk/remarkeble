"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdmin } from "@/components/admin/admin-provider";
import { QuietButton } from "@/components/admin/fields";
import { districtName } from "@/lib/districts";
import { ARCHIVE_ROUTE } from "@/lib/routes";
import { publicationOf } from "@/lib/status";
import type { PublicationStatus, Restaurant } from "@/lib/types";

export function AdminPublication() {
  const { restaurants, ready, loadError, updateRestaurant } = useAdmin();
  const [error, setError] = useState("");
  if (loadError) return <p className="px-4 py-10 text-sm text-stamp">{loadError}</p>;
  if (!ready) return <p className="px-4 py-10 text-sm text-ink-soft">讀取檔案…</p>;

  function setStatus(id: string, publication: PublicationStatus) {
    setError("");
    void updateRestaurant(id, { publication }).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "未能更新。");
    });
  }

  return (
    <div className="px-4 py-5">
      <h2 className="font-serif text-3xl">出版</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">只有已出版的頁會出現在藏書、地圖和目錄。封存和草稿都不會公開。</p>
      {error ? <p className="mt-3 text-sm text-stamp">{error}</p> : null}
      <Group title="草稿" restaurants={restaurants.filter((item) => publicationOf(item) === "draft")} empty="沒有草稿。" action="出版" onAction={(id) => setStatus(id, "published")} />
      <Group title="已出版" restaurants={restaurants.filter((item) => publicationOf(item) === "published")} empty="藏書是空的。" action="改為草稿" onAction={(id) => setStatus(id, "draft")} />
      <Group title="封存" restaurants={restaurants.filter((item) => publicationOf(item) === "archived")} empty="沒有封存。" action="重新出版" onAction={(id) => setStatus(id, "published")} />
    </div>
  );
}

function Group({
  title,
  restaurants,
  empty,
  action,
  onAction,
}: {
  title: string;
  restaurants: Restaurant[];
  empty: string;
  action: string;
  onAction: (id: string) => void;
}) {
  return (
    <section className="mt-8">
      <h3 className="font-serif text-2xl">{title}</h3>
      {restaurants.length === 0 ? (
        <p className="mt-3 text-sm text-ink-faint">{empty}</p>
      ) : (
        <ul className="mt-2">
          {restaurants.map((restaurant) => (
            <li key={restaurant.id} className="flex items-center justify-between gap-3 border-b border-line py-3">
              <Link href={`${ARCHIVE_ROUTE}/restaurants/${restaurant.id}`} className="min-w-0">
                <span className="block truncate font-serif text-lg">{restaurant.name}</span>
                <span className="block text-[12px] text-ink-soft">{districtName(restaurant.districtId)}</span>
              </Link>
              <QuietButton className="shrink-0 rounded-2xl px-3 py-2" onClick={() => onAction(restaurant.id)}>
                {action}
              </QuietButton>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
