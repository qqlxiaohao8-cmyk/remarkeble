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
        <Link href={ARCHIVE_ROUTE} className="mt-4 inline-block text-sm font-medium text-accent">
          返回概覽
        </Link>
      </div>
    );
  }
  return <RestaurantForm key={restaurant.updatedAt || restaurant.id} mode="edit" restaurant={restaurant} />;
}
