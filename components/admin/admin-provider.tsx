"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ARCHIVE_ROUTE } from "@/lib/routes";
import type { RestaurantInput } from "@/lib/restaurant-input";
import type { Restaurant } from "@/lib/types";

export type AdminSession = {
  id: string;
  email: string;
  name: string;
  role: "super" | "admin";
};

type AdminValue = {
  session: AdminSession;
  ready: boolean;
  loadError: string;
  restaurants: Restaurant[];
  createRestaurant: (input: RestaurantInput) => Promise<Restaurant>;
  updateRestaurant: (id: string, patch: Partial<RestaurantInput>) => Promise<void>;
  removeRestaurant: (id: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminContext = createContext<AdminValue | null>(null);

async function readError(response: Response) {
  const data = (await response.json().catch(() => null)) as { error?: string } | null;
  return data?.error || "未能完成。";
}

export function AdminProvider({ session, children }: { session: AdminSession; children: React.ReactNode }) {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancel = false;
    async function load() {
      const response = await fetch("/api/archive-management/restaurants", { cache: "no-store" });
      if (response.status === 401) {
        router.replace(`${ARCHIVE_ROUTE}/login`);
        return;
      }
      if (!response.ok) {
        if (!cancel) setLoadError(await readError(response));
        return;
      }
      const data = (await response.json()) as { restaurants: Restaurant[] };
      if (!cancel) {
        setRestaurants(data.restaurants);
        setReady(true);
      }
    }
    void load();
    return () => {
      cancel = true;
    };
  }, [router]);

  const value = useMemo<AdminValue>(() => {
    return {
      session,
      ready,
      loadError,
      restaurants,
      createRestaurant: async (input) => {
        const response = await fetch("/api/archive-management/restaurants", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!response.ok) throw new Error(await readError(response));
        const data = (await response.json()) as { restaurant: Restaurant; restaurants: Restaurant[] };
        setRestaurants(data.restaurants);
        return data.restaurant;
      },
      updateRestaurant: async (id, patch) => {
        const response = await fetch(`/api/archive-management/restaurants/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!response.ok) throw new Error(await readError(response));
        const data = (await response.json()) as { restaurants: Restaurant[] };
        setRestaurants(data.restaurants);
      },
      removeRestaurant: async (id) => {
        const response = await fetch(`/api/archive-management/restaurants/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error(await readError(response));
        const data = (await response.json()) as { restaurants: Restaurant[] };
        setRestaurants(data.restaurants);
      },
      logout: async () => {
        await fetch("/api/archive-management/logout", { method: "POST" });
        router.replace(`${ARCHIVE_ROUTE}/login`);
        router.refresh();
      },
    };
  }, [loadError, ready, restaurants, router, session]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error("useAdmin must be used within AdminProvider");
  return value;
}
