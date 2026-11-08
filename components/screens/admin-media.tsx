"use client";

import { Plate } from "@/components/plate";
import { fieldClass } from "@/components/admin/fields";
import { useArchive } from "@/lib/archive";
import { MOTIF_LABELS, MOTIFS, TONE_LABELS, TONES, type Motif, type Tone } from "@/lib/types";

function isMotif(value: string): value is Motif {
  return (MOTIFS as readonly string[]).includes(value);
}

function isTone(value: string): value is Tone {
  return (TONES as readonly string[]).includes(value);
}

export function AdminMedia() {
  const { restaurants, updateRestaurant } = useArchive();
  const ordered = [...restaurants].sort((a, b) => a.page - b.page);
  return (
    <div className="px-4 py-5">
      <h2 className="font-serif text-3xl">圖版</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">
        每間餐廳一塊製版。上傳原件會在接上媒體庫之後開放，現在先指定圖樣和色調。
      </p>
      <ul className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
        {ordered.map((restaurant) => (
          <li key={restaurant.id} className="border border-line p-2">
            <div className="relative aspect-[3/4]">
              <Plate motif={restaurant.motif} tone={restaurant.tone} className="absolute inset-0" label={restaurant.name} />
            </div>
            <p className="mt-2 truncate font-serif">{restaurant.name}</p>
            <label className="mt-2 block">
              <span className="text-[10px] tracking-[0.14em] text-ink-faint">圖樣</span>
              <select
                className={fieldClass}
                value={restaurant.motif}
                onChange={(event) => {
                  if (isMotif(event.target.value)) updateRestaurant(restaurant.id, { motif: event.target.value });
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
              <span className="text-[10px] tracking-[0.14em] text-ink-faint">色調</span>
              <select
                className={fieldClass}
                value={restaurant.tone}
                onChange={(event) => {
                  if (isTone(event.target.value)) updateRestaurant(restaurant.id, { tone: event.target.value });
                }}
              >
                {TONES.map((tone) => (
                  <option key={tone} value={tone}>
                    {TONE_LABELS[tone]}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-2 text-[11px] leading-5 text-ink-faint">
              短片 · {restaurant.videoTitle || "未題名"} · {restaurant.videoDuration}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
