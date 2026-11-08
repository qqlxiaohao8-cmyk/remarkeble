"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { createContext, useContext } from "react";
import { getDistrict } from "@/lib/districts";
import { folio, normalizeDuration, slugify } from "@/lib/format";
import { SEED } from "@/lib/seed";
import { MOTIFS, TONES, type Draft, type Restaurant } from "@/lib/types";

const STORAGE_KEY = "remarkeble.archive.v1";
const SAVED_KEY = "remarkeble.saved.v1";
const ADMIN_KEY = "remarkeble.admin";
const PASSPHRASE = "archive";

type Snapshot = {
  restaurants: Restaurant[];
  savedIds: string[];
  unlocked: boolean;
  ready: boolean;
};

type ArchiveValue = {
  ready: boolean;
  restaurants: Restaurant[];
  published: Restaurant[];
  savedIds: string[];
  unlocked: boolean;
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  addRestaurant: (draft: Draft) => Restaurant;
  updateRestaurant: (id: string, patch: Partial<Restaurant>) => void;
  removeRestaurant: (id: string) => void;
  unlock: (passphrase: string) => boolean;
  lock: () => void;
  resetArchive: () => void;
};

const SERVER_SNAPSHOT: Snapshot = {
  restaurants: SEED,
  savedIds: [],
  unlocked: false,
  ready: false,
};

let snapshot: Snapshot = SERVER_SNAPSHOT;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

function replace(next: Snapshot) {
  snapshot = next;
  emit();
}

function isRestaurant(value: unknown): value is Restaurant {
  if (!value || typeof value !== "object") return false;
  const record = value as Restaurant;
  return (
    typeof record.id === "string" &&
    typeof record.slug === "string" &&
    typeof record.name === "string" &&
    typeof record.districtId === "string" &&
    Boolean(getDistrict(record.districtId)) &&
    (MOTIFS as readonly string[]).includes(record.motif) &&
    (TONES as readonly string[]).includes(record.tone) &&
    Array.isArray(record.dishes)
  );
}

function readRestaurants() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isRestaurant)) return SEED;
    return parsed;
  } catch {
    return SEED;
  }
}

function readSaved() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string")) return [];
    return parsed;
  } catch {
    return [];
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  replace({
    restaurants: readRestaurants(),
    savedIds: readSaved(),
    unlocked: window.sessionStorage.getItem(ADMIN_KEY) === "1",
    ready: true,
  });
}

function writeRestaurants(next: Restaurant[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  replace({ ...snapshot, restaurants: next });
}

function writeSaved(next: string[]) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  replace({ ...snapshot, savedIds: next });
}

const ArchiveContext = createContext<ArchiveValue | null>(null);

export function ArchiveProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    hydrate();
  }, []);

  const published = useMemo(
    () =>
      state.restaurants
        .filter((restaurant) => restaurant.published)
        .sort((a, b) => a.page - b.page || a.name.localeCompare(b.name, "zh-Hant")),
    [state.restaurants],
  );

  const value = useMemo<ArchiveValue>(() => {
    return {
      ready: state.ready,
      restaurants: state.restaurants,
      published,
      savedIds: state.savedIds,
      unlocked: state.unlocked,
      toggleSaved: (id: string) => {
        hydrate();
        const current = snapshot.savedIds;
        writeSaved(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
      },
      isSaved: (id: string) => state.savedIds.includes(id),
      addRestaurant: (draft: Draft) => {
        hydrate();
        const restaurants = snapshot.restaurants;
        const page = restaurants.reduce((max, restaurant) => Math.max(max, restaurant.page), 0) + 1;
        const base = slugify(draft.nameEn);
        const slugs = new Set(restaurants.map((restaurant) => restaurant.slug));
        let slug = base;
        let suffix = 2;
        while (slugs.has(slug)) {
          slug = `${base}-${suffix}`;
          suffix += 1;
        }
        const restaurant: Restaurant = {
          ...draft,
          dishes: draft.dishes.filter((dish) => dish.name.trim()),
          videoDuration: normalizeDuration(draft.videoDuration),
          id: `local-${crypto.randomUUID()}`,
          slug,
          page,
          catalogNo: `HK-${draft.established || "0000"}-${folio(page)}`,
          addedAt: new Date().toISOString(),
        };
        writeRestaurants([...restaurants, restaurant]);
        return restaurant;
      },
      updateRestaurant: (id: string, patch: Partial<Restaurant>) => {
        hydrate();
        writeRestaurants(
          snapshot.restaurants.map((restaurant) =>
            restaurant.id === id ? { ...restaurant, ...patch } : restaurant,
          ),
        );
      },
      removeRestaurant: (id: string) => {
        hydrate();
        writeRestaurants(snapshot.restaurants.filter((restaurant) => restaurant.id !== id));
        writeSaved(snapshot.savedIds.filter((item) => item !== id));
      },
      unlock: (passphrase: string) => {
        hydrate();
        if (passphrase.trim().toLowerCase() !== PASSPHRASE) return false;
        sessionStorage.setItem(ADMIN_KEY, "1");
        replace({ ...snapshot, unlocked: true });
        return true;
      },
      lock: () => {
        hydrate();
        sessionStorage.removeItem(ADMIN_KEY);
        replace({ ...snapshot, unlocked: false });
      },
      resetArchive: () => {
        hydrate();
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SAVED_KEY);
        replace({ ...snapshot, restaurants: SEED, savedIds: [] });
      },
    };
  }, [published, state]);

  return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>;
}

export function useArchive() {
  const value = useContext(ArchiveContext);
  if (!value) throw new Error("useArchive must be used within ArchiveProvider");
  return value;
}
