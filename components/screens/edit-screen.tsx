"use client";

import Link from "next/link";
import { RestaurantForm } from "@/components/admin/restaurant-form";
import { useArchive } from "@/lib/archive";

export function EditScreen({ id }: { id: string }) {
  const { restaurants } = useArchive();
  const restaurant = restaurants.find((item) => item.id === id);
  if (!restaurant) {
    return (
      <div className="px-4 py-16">
        <h2 className="font-serif text-3xl">找不到這份登記</h2>
        <Link href="/admin/restaurants" className="mt-4 inline-block text-[12px] tracking-[0.16em]">
          返回餐廳
        </Link>
      </div>
    );
  }
  return (
    <div>
      <div className="flex justify-end px-4 pt-4">
        <Link href={`/restaurant/${restaurant.slug}`} className="text-[12px] tracking-[0.14em] text-ink-soft">
          閱讀版面
        </Link>
      </div>
      <RestaurantForm key={restaurant.id} mode="edit" restaurant={restaurant} />
    </div>
  );
}
