"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteRestaurant } from "@/components/admin/delete-restaurant";
import { PinMap } from "@/components/admin/pin-map";
import { Field, InkButton, fieldClass } from "@/components/admin/fields";
import { useAdmin } from "@/components/admin/admin-provider";
import { nearestDistrict } from "@/lib/districts";
import { slugify } from "@/lib/format";
import { inputFromRestaurant, type RestaurantInput } from "@/lib/restaurant-input";
import { ARCHIVE_ROUTE } from "@/lib/routes";
import type { Restaurant } from "@/lib/types";

export function RestaurantForm({ mode, restaurant }: { mode: "create" | "edit"; restaurant?: Restaurant }) {
  const router = useRouter();
  const { restaurants, createRestaurant, updateRestaurant } = useAdmin();
  const base = restaurant ? inputFromRestaurant(restaurant) : null;
  const [name, setName] = useState(base?.name ?? "");
  const [hours, setHours] = useState(base?.hours ?? "");
  const [story, setStory] = useState(base?.story ?? "");
  const [videoUrl, setVideoUrl] = useState(base?.videoUrl ?? "");
  const [coverImage, setCoverImage] = useState(base?.coverImage ?? "");
  const [lat, setLat] = useState<number | null>(base?.lat ?? null);
  const [lng, setLng] = useState<number | null>(base?.lng ?? null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  function upload(file: File) {
    const body = new FormData();
    body.set("file", file);
    setUploading(true);
    setError("");
    void fetch("/api/archive-management/media", { method: "POST", body })
      .then(async (response) => {
        const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
        if (!response.ok || !data?.url) {
          setError(data?.error || "海報未能上傳。");
          return;
        }
        setCoverImage(data.url);
      })
      .catch(() => setError("海報未能上傳。"))
      .finally(() => setUploading(false));
  }

  function save() {
    if (!name.trim()) {
      setError("請填餐廳名稱。");
      return;
    }
    if (!coverImage) {
      setError("請上傳海報。");
      return;
    }
    if (lat === null || lng === null) {
      setError("請在地圖上標出位置。");
      return;
    }
    const taken = new Set(restaurants.filter((item) => item.id !== restaurant?.id).map((item) => item.slug));
    const input: RestaurantInput = {
      name: name.trim(),
      nameEn: base?.nameEn ?? "",
      slug: base?.slug || makeSlug(name, taken),
      districtId: nearestDistrict(lat, lng),
      address: base?.address ?? "",
      lat,
      lng,
      hours: hours.trim(),
      established: base?.established ?? "",
      excerpt: base?.excerpt || story.trim().replace(/\s+/g, " ").slice(0, 80),
      story: story.trim(),
      motif: base?.motif ?? "tea",
      tone: base?.tone ?? "sepia",
      videoTitle: base?.videoTitle || name.trim(),
      videoDuration: base?.videoDuration || "03:00",
      videoUrl: videoUrl.trim(),
      coverImage,
      gallery: base?.gallery ?? [],
      owner: base?.owner ?? "",
      contact: base?.contact ?? "",
      visitedOn: base?.visitedOn ?? "",
      dishes: base?.dishes ?? [],
      publication: "published",
      verification: base?.verification ?? "unverified",
    };
    setBusy(true);
    setError("");
    setStatus("");
    const action =
      mode === "create" || !restaurant
        ? createRestaurant(input).then(() => router.push(ARCHIVE_ROUTE))
        : updateRestaurant(restaurant.id, input).then(() => {
            setStatus("已儲存。地圖上會看到這個地點。");
            setBusy(false);
          });
    void action.catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "未能儲存。");
      setBusy(false);
    });
  }

  return (
    <form
      className="mx-auto max-w-xl space-y-5 px-4 py-5"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <h2 className="font-serif text-3xl">{mode === "create" ? "新增" : "編輯"}</h2>
      <Field label="海報">
        <label className="mt-1 flex aspect-[3/4] max-h-80 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-line bg-white">
          {coverImage ? (
            <img src={coverImage} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="px-6 text-center text-sm text-ink-soft">{uploading ? "上傳中" : "上傳海報，原圖不會壓縮"}</span>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={uploading || busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) upload(file);
            }}
          />
        </label>
      </Field>
      <Field label="餐廳名稱">
        <input className={fieldClass} value={name} onChange={(event) => setName(event.target.value)} required />
      </Field>
      <Field label="餐廳地點">
        <p className="mb-2 text-xs leading-5 text-ink-soft">在地圖上點一下，標出準確位置。</p>
        <PinMap
          lat={lat}
          lng={lng}
          onPick={(nextLat, nextLng) => {
            setLat(nextLat);
            setLng(nextLng);
            setError("");
          }}
        />
        {lat !== null && lng !== null ? (
          <p className="mt-2 text-xs text-ink-faint">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
        ) : null}
      </Field>
      <Field label="開放時間">
        <textarea className={`${fieldClass} min-h-16 resize-y`} value={hours} onChange={(event) => setHours(event.target.value)} />
      </Field>
      <Field label="Instagram 影片">
        <input
          className={fieldClass}
          value={videoUrl}
          onChange={(event) => setVideoUrl(event.target.value)}
          placeholder="https://www.instagram.com/reel/…"
          inputMode="url"
        />
      </Field>
      <Field label="簡介">
        <textarea className={`${fieldClass} min-h-32 resize-y`} value={story} onChange={(event) => setStory(event.target.value)} />
      </Field>
      {error ? <p className="text-sm text-stamp">{error}</p> : null}
      {status ? <p className="text-sm text-ink-soft">{status}</p> : null}
      <div className="flex flex-wrap gap-3 pt-2">
        <InkButton type="submit" disabled={busy || uploading}>
          {busy ? "儲存中" : "儲存"}
        </InkButton>
        {restaurant ? (
          <DeleteRestaurant id={restaurant.id} name={restaurant.name} onDeleted={() => router.push(ARCHIVE_ROUTE)} />
        ) : null}
      </div>
    </form>
  );
}

function makeSlug(name: string, taken: Set<string>) {
  const base = slugify(name);
  const stem = base === "entry" ? `place-${crypto.randomUUID().slice(0, 8)}` : base;
  let slug = stem;
  let count = 2;
  while (taken.has(slug)) slug = `${stem}-${count++}`;
  return slug;
}
