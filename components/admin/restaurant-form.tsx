"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, InkButton, QuietButton, fieldClass } from "@/components/admin/fields";
import { Plate } from "@/components/plate";
import { useArchive } from "@/lib/archive";
import { DISTRICTS, type DistrictId } from "@/lib/districts";
import { folio, normalizeDuration } from "@/lib/format";
import {
  MOTIF_LABELS,
  MOTIFS,
  TONE_LABELS,
  TONES,
  type Dish,
  type Draft,
  type Motif,
  type Restaurant,
  type Tone,
} from "@/lib/types";

function emptyDraft(): Draft {
  return {
    name: "",
    nameEn: "",
    districtId: "central",
    address: "",
    hours: "",
    established: "",
    excerpt: "",
    story: "",
    motif: "tea",
    tone: "sepia",
    videoTitle: "",
    videoDuration: "03:00",
    dishes: [{ name: "", note: "" }],
    verified: false,
    published: false,
  };
}

function fromRestaurant(restaurant: Restaurant): Draft {
  return {
    name: restaurant.name,
    nameEn: restaurant.nameEn,
    districtId: restaurant.districtId,
    address: restaurant.address,
    hours: restaurant.hours,
    established: restaurant.established,
    excerpt: restaurant.excerpt,
    story: restaurant.story,
    motif: restaurant.motif,
    tone: restaurant.tone,
    videoTitle: restaurant.videoTitle,
    videoDuration: restaurant.videoDuration,
    dishes: restaurant.dishes.length ? restaurant.dishes : [{ name: "", note: "" }],
    verified: restaurant.verified,
    published: restaurant.published,
  };
}

function isDistrict(value: string): value is DistrictId {
  return DISTRICTS.some((district) => district.id === value);
}

function isMotif(value: string): value is Motif {
  return (MOTIFS as readonly string[]).includes(value);
}

function isTone(value: string): value is Tone {
  return (TONES as readonly string[]).includes(value);
}

export function RestaurantForm({ mode, restaurant }: { mode: "create" | "edit"; restaurant?: Restaurant }) {
  const router = useRouter();
  const { addRestaurant, updateRestaurant, removeRestaurant } = useArchive();
  const [draft, setDraft] = useState<Draft>(() => (restaurant ? fromRestaurant(restaurant) : emptyDraft()));
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [confirming, setConfirming] = useState(false);

  function patch(partial: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...partial }));
    setStatus("");
  }

  function updateDish(index: number, partial: Partial<Dish>) {
    patch({
      dishes: draft.dishes.map((dish, dishIndex) => (dishIndex === index ? { ...dish, ...partial } : dish)),
    });
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.name.trim() || !draft.nameEn.trim() || !draft.story.trim()) {
      setError("名稱、英文名和故事都要填。");
      return;
    }
    setError("");
    const next = {
      ...draft,
      name: draft.name.trim(),
      nameEn: draft.nameEn.trim(),
      videoDuration: normalizeDuration(draft.videoDuration),
      dishes: draft.dishes.filter((dish) => dish.name.trim()),
    };
    if (mode === "create") {
      const created = addRestaurant(next);
      router.push(`/admin/restaurants/${created.id}`);
      return;
    }
    if (!restaurant) return;
    updateRestaurant(restaurant.id, next);
    setStatus("已寫入這部瀏覽器");
  }

  return (
    <form onSubmit={submit} className="space-y-5 px-4 py-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-ink-faint">入藏登記</p>
          <h2 className="mt-1 font-serif text-3xl">{mode === "create" ? "新的一頁" : restaurant?.name}</h2>
          {restaurant && (
            <p className="mt-1 font-editorial text-sm text-ink-soft">
              {restaurant.catalogNo} · 第 {folio(restaurant.page)} 頁
            </p>
          )}
        </div>
        <div className="relative aspect-[3/4] w-20 shrink-0 border border-line">
          <Plate motif={draft.motif} tone={draft.tone} className="absolute inset-0" label="圖版預覽" />
        </div>
      </div>
      <Field label="名稱">
        <input className={fieldClass} value={draft.name} onChange={(event) => patch({ name: event.target.value })} />
      </Field>
      <Field label="英文">
        <input className={fieldClass} value={draft.nameEn} onChange={(event) => patch({ nameEn: event.target.value })} />
      </Field>
      <Field label="地區">
        <select
          className={fieldClass}
          value={draft.districtId}
          onChange={(event) => {
            if (isDistrict(event.target.value)) patch({ districtId: event.target.value });
          }}
        >
          {DISTRICTS.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="地址">
        <input className={fieldClass} value={draft.address} onChange={(event) => patch({ address: event.target.value })} />
      </Field>
      <Field label="營業">
        <textarea className={fieldClass} rows={2} value={draft.hours} onChange={(event) => patch({ hours: event.target.value })} />
      </Field>
      <Field label="始於">
        <input className={fieldClass} value={draft.established} onChange={(event) => patch({ established: event.target.value })} placeholder="1962" />
      </Field>
      <Field label="提要">
        <input className={fieldClass} value={draft.excerpt} onChange={(event) => patch({ excerpt: event.target.value })} />
      </Field>
      <Field label="故事">
        <textarea className={fieldClass} rows={8} value={draft.story} onChange={(event) => patch({ story: event.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="圖版">
          <select
            className={fieldClass}
            value={draft.motif}
            onChange={(event) => {
              if (isMotif(event.target.value)) patch({ motif: event.target.value });
            }}
          >
            {MOTIFS.map((motif) => (
              <option key={motif} value={motif}>
                {MOTIF_LABELS[motif]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="色調">
          <select
            className={fieldClass}
            value={draft.tone}
            onChange={(event) => {
              if (isTone(event.target.value)) patch({ tone: event.target.value });
            }}
          >
            {TONES.map((tone) => (
              <option key={tone} value={tone}>
                {TONE_LABELS[tone]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="短片標題">
        <input className={fieldClass} value={draft.videoTitle} onChange={(event) => patch({ videoTitle: event.target.value })} />
      </Field>
      <Field label="片長">
        <input className={fieldClass} value={draft.videoDuration} onChange={(event) => patch({ videoDuration: event.target.value })} placeholder="03:40" />
      </Field>
      <fieldset>
        <legend className="text-[11px] tracking-[0.18em] text-ink-soft">招牌</legend>
        <div className="mt-2 space-y-3">
          {draft.dishes.map((dish, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input
                className={fieldClass}
                value={dish.name}
                placeholder="名稱"
                onChange={(event) => updateDish(index, { name: event.target.value })}
              />
              <input
                className={fieldClass}
                value={dish.note}
                placeholder="註"
                onChange={(event) => updateDish(index, { note: event.target.value })}
              />
              <button
                type="button"
                className="text-[12px] text-ink-faint"
                onClick={() => patch({ dishes: draft.dishes.filter((_, dishIndex) => dishIndex !== index) })}
              >
                移除
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-3 text-[12px] tracking-[0.14em]"
          onClick={() => patch({ dishes: [...draft.dishes, { name: "", note: "" }] })}
        >
          加一項
        </button>
      </fieldset>
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={draft.verified} onChange={(event) => patch({ verified: event.target.checked })} />
          已核實
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={draft.published} onChange={(event) => patch({ published: event.target.checked })} />
          出版
        </label>
      </div>
      {error && <p className="text-sm text-stamp">{error}</p>}
      {status && <p className="text-sm text-ink-soft">{status}</p>}
      <div className="flex flex-wrap gap-3 pt-2">
        <InkButton type="submit">{mode === "create" ? "收入檔案" : "儲存"}</InkButton>
        {restaurant && (
          <QuietButton
            onClick={() => {
              if (!confirming) {
                setConfirming(true);
                return;
              }
              router.push("/admin/restaurants");
              removeRestaurant(restaurant.id);
            }}
          >
            {confirming ? "再按一次以移出" : "移出檔案"}
          </QuietButton>
        )}
      </div>
      <p className="text-[12px] leading-5 text-ink-faint">
        改動寫在這部瀏覽器。接上 Supabase 之前，換一部機就不會看見。
      </p>
    </form>
  );
}
