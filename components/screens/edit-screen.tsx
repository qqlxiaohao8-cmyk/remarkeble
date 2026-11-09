"use client";

import Link from "next/link";
import { useAdmin } from "@/components/admin/admin-provider";
import { RestaurantForm } from "@/components/admin/restaurant-form";
import { ARCHIVE_ROUTE } from "@/lib/routes";

export function EditScreen({ id }: { id: string }) {
  const { restaurants, ready, loadError } = useAdmin();
  if (loadError) return <p className="px-4 py-10 text-sm text-stamp">{loadError}</p>;
  if (!ready) return <p className="px-4 py-10 text-sm text-ink-soft">讀取檔案…</p>;
  const restaurant = restaurants.find((item) => item.id === id);
  if (!restaurant) {
    return (
      <div className="px-4 py-16">
        <h2 className="font-serif text-3xl">找不到這份登記</h2>
        <Link href={`${ARCHIVE_ROUTE}/restaurants`} className="mt-4 inline-block text-sm font-medium text-accent">
          返回餐廳
        </Link>
      </div>
    );
  }
  return (
    <div>
      <div className="flex justify-end px-4 pt-4">
        <Link href={`/restaurant/${restaurant.slug}`} className="text-sm text-ink-soft">
          閱讀版面
        </Link>
      </div>
      <RestaurantForm key={restaurant.updatedAt || restaurant.id} mode="edit" restaurant={restaurant} />
    </div>
  );
}
