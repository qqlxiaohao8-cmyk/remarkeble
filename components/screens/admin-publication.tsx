"use client";

import Link from "next/link";
import { QuietButton } from "@/components/admin/fields";
import { useArchive } from "@/lib/archive";
import { districtName } from "@/lib/districts";

export function AdminPublication() {
  const { restaurants, updateRestaurant } = useArchive();
  const drafts = restaurants.filter((restaurant) => !restaurant.published);
  const published = restaurants.filter((restaurant) => restaurant.published);

  return (
    <div className="px-4 py-5">
      <h2 className="font-serif text-3xl">出版</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">只有已出版的頁會出現在藏書、地圖和目錄。</p>
      <Group title="草稿" restaurants={drafts} empty="沒有草稿。" action="出版" published={false} onToggle={updateRestaurant} />
      <Group title="已出版" restaurants={published} empty="藏書是空的。" action="改為草稿" published onToggle={updateRestaurant} />
    </div>
  );
}

function Group({
  title,
  restaurants,
  empty,
  action,
  published,
  onToggle,
}: {
  title: string;
  restaurants: { id: string; name: string; districtId: string }[];
  empty: string;
  action: string;
  published: boolean;
  onToggle: (id: string, patch: { published: boolean }) => void;
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
              <Link href={`/admin/restaurants/${restaurant.id}`} className="min-w-0">
                <span className="block truncate font-serif text-lg">{restaurant.name}</span>
                <span className="block text-[12px] text-ink-soft">{districtName(restaurant.districtId)}</span>
              </Link>
              <QuietButton className="shrink-0 px-3 py-2" onClick={() => onToggle(restaurant.id, { published: !published })}>
                {action}
              </QuietButton>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
