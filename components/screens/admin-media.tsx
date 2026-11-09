"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/admin-provider";
import { fieldClass } from "@/components/admin/fields";
import { Plate } from "@/components/plate";
import { MOTIF_LABELS, MOTIFS, TONE_LABELS, TONES, type Motif, type Tone } from "@/lib/types";

function isMotif(value: string): value is Motif {
  return (MOTIFS as readonly string[]).includes(value);
}

function isTone(value: string): value is Tone {
  return (TONES as readonly string[]).includes(value);
}

export function AdminMedia() {
  const { restaurants, ready, loadError, updateRestaurant } = useAdmin();
  const [error, setError] = useState("");
  if (loadError) return <p className="px-4 py-10 text-sm text-stamp">{loadError}</p>;
  if (!ready) return <p className="px-4 py-10 text-sm text-ink-soft">讀取檔案…</p>;
  const ordered = [...restaurants].sort((a, b) => a.page - b.page);

  function save(id: string, patch: { motif?: Motif; tone?: Tone }) {
    setError("");
    void updateRestaurant(id, patch).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "未能更新。");
    });
  }

  return (
    <div className="px-4 py-5">
      <h2 className="font-serif text-3xl">圖版</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">封面在各餐廳的編輯頁上傳。這裡改的是沒有封面時用的圖樣和色調。</p>
      {error ? <p className="mt-3 text-sm text-stamp">{error}</p> : null}
      <ul className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
        {ordered.map((restaurant) => (
          <li key={restaurant.id} className="rounded-2xl border border-line bg-white p-2">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
              {restaurant.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={restaurant.coverImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <Plate motif={restaurant.motif} tone={restaurant.tone} className="absolute inset-0" label={restaurant.name} />
              )}
            </div>
            <p className="mt-2 truncate font-serif">{restaurant.name}</p>
            <label className="mt-2 block">
              <span className="text-[11px] text-ink-faint">圖樣</span>
              <select
                className={fieldClass}
                value={restaurant.motif}
                onChange={(event) => {
                  if (isMotif(event.target.value)) save(restaurant.id, { motif: event.target.value });
                }}
              >
                {MOTIFS.map((motif) => (
                  <option key={motif} value={motif}>
                    {MOTIF_LABELS[motif]}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-2 block">
              <span className="text-[11px] text-ink-faint">色調</span>
              <select
                className={fieldClass}
                value={restaurant.tone}
                onChange={(event) => {
                  if (isTone(event.target.value)) save(restaurant.id, { tone: event.target.value });
                }}
              >
                {TONES.map((tone) => (
                  <option key={tone} value={tone}>
                    {TONE_LABELS[tone]}
                  </option>
                ))}
              </select>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
