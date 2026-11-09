"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { createContext, useContext } from "react";
import { getDistrict } from "@/lib/districts";
import { SEED } from "@/lib/seed";
import { isPublicRestaurant, normalizeRestaurant } from "@/lib/status";
import { MOTIFS, TONES, type Restaurant } from "@/lib/types";

const SAVED_KEY = "remarkeble.saved.v1";

type Snapshot = {
  restaurants: Restaurant[];
  savedIds: string[];
  ready: boolean;
};

type ArchiveValue = {
  ready: boolean;
  restaurants: Restaurant[];
  published: Restaurant[];
  savedIds: string[];
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
};

const publishedSeed = SEED.map((restaurant) => normalizeRestaurant(restaurant)).filter(isPublicRestaurant);

const SERVER_SNAPSHOT: Snapshot = {
  restaurants: publishedSeed,
  savedIds: [],
  ready: false,
};

let snapshot: Snapshot = SERVER_SNAPSHOT;
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

function writeSaved(next: string[]) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  replace({ ...snapshot, savedIds: next });
}

async function loadCatalog() {
  try {
    const response = await fetch("/api/catalog", { cache: "no-store" });
    if (!response.ok) return publishedSeed;
    const data = (await response.json()) as { restaurants?: unknown };
    if (!Array.isArray(data.restaurants) || !data.restaurants.every(isRestaurant)) return publishedSeed;
    return data.restaurants.map((restaurant) => normalizeRestaurant(restaurant)).filter(isPublicRestaurant);
  } catch {
    return publishedSeed;
  }
}

const ArchiveContext = createContext<ArchiveValue | null>(null);

export function ArchiveProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    let cancel = false;
    async function refresh() {
      const restaurants = await loadCatalog();
      if (cancel) return;
      replace({ restaurants, savedIds: readSaved(), ready: true });
    }
    void refresh();
    window.addEventListener("focus", refresh);
    return () => {
      cancel = true;
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const published = useMemo(
    () =>
      state.restaurants
        .filter(isPublicRestaurant)
        .sort((a, b) => a.page - b.page || a.name.localeCompare(b.name, "zh-Hant")),
    [state.restaurants],
  );

  const value = useMemo<ArchiveValue>(() => {
    return {
      ready: state.ready,
      restaurants: state.restaurants,
      published,
      savedIds: state.savedIds,
      toggleSaved: (id: string) => {
        const current = snapshot.savedIds;
        writeSaved(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
      },
      isSaved: (id: string) => state.savedIds.includes(id),
    };
  }, [published, state]);

  return <ArchiveContext.Provider value={value}>{children}</ArchiveContext.Provider>;
}

export function useArchive() {
  const value = useContext(ArchiveContext);
  if (!value) throw new Error("useArchive must be used within ArchiveProvider");
  return value;
}
