"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteRestaurant } from "@/components/admin/delete-restaurant";
import { Field, InkButton, QuietButton, fieldClass } from "@/components/admin/fields";
import { useAdmin } from "@/components/admin/admin-provider";
import { Plate } from "@/components/plate";
import { DISTRICTS, type DistrictId } from "@/lib/districts";
import { folio, slugify } from "@/lib/format";
import { inputFromRestaurant, type RestaurantInput } from "@/lib/restaurant-input";
import { ARCHIVE_ROUTE } from "@/lib/routes";
import {
  MOTIF_LABELS,
  MOTIFS,
  PUBLICATION_STATUSES,
  TONE_LABELS,
  TONES,
  VERIFICATION_STATUSES,
  type Dish,
  type Draft,
  type Motif,
  type PublicationStatus,
  type Restaurant,
  type Tone,
  type VerificationStatus,
} from "@/lib/types";
import { PUBLICATION_LABELS, VERIFICATION_LABELS } from "@/lib/status";

function emptyDraft(): Draft {
  return {
    name: "",
    nameEn: "",
    slug: "",
    districtId: "central",
    address: "",
    lat: "",
    lng: "",
    hours: "",
    established: "",
    excerpt: "",
    story: "",
    motif: "tea",
    tone: "sepia",
    videoTitle: "",
    videoDuration: "03:00",
    videoUrl: "",
    coverImage: "",
    gallery: "",
    owner: "",
    contact: "",
    visitedOn: "",
    dishes: [{ name: "", note: "" }],
    publication: "draft",
    verification: "unverified",
  };
}

function fromRestaurant(restaurant: Restaurant): Draft {
  const input = inputFromRestaurant(restaurant);
  return {
    ...input,
    lat: input.lat === null ? "" : String(input.lat),
    lng: input.lng === null ? "" : String(input.lng),
    gallery: input.gallery.join("\n"),
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

function isPublication(value: string): value is PublicationStatus {
  return (PUBLICATION_STATUSES as readonly string[]).includes(value);
}

function isVerification(value: string): value is VerificationStatus {
  return (VERIFICATION_STATUSES as readonly string[]).includes(value);
}

export function RestaurantForm({ mode, restaurant }: { mode: "create" | "edit"; restaurant?: Restaurant }) {
  const router = useRouter();
  const { createRestaurant, updateRestaurant } = useAdmin();
  const [draft, setDraft] = useState<Draft>(() => (restaurant ? fromRestaurant(restaurant) : emptyDraft()));
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function patch(partial: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...partial }));
    setStatus("");
  }

  function updateDish(index: number, partial: Partial<Dish>) {
    patch({
      dishes: draft.dishes.map((dish, dishIndex) => (dishIndex === index ? { ...dish, ...partial } : dish)),
    });
  }

  function toInput(publication: PublicationStatus): RestaurantInput {
    return {
      name: draft.name,
      nameEn: draft.nameEn,
      slug: draft.slug || slugify(draft.nameEn),
      districtId: draft.districtId,
      address: draft.address,
      lat: draft.lat.trim() ? Number(draft.lat) : null,
      lng: draft.lng.trim() ? Number(draft.lng) : null,
      hours: draft.hours,
      established: draft.established,
      excerpt: draft.excerpt,
      story: draft.story,
      motif: draft.motif,
      tone: draft.tone,
      videoTitle: draft.videoTitle,
      videoDuration: draft.videoDuration,
      videoUrl: draft.videoUrl,
      coverImage: draft.coverImage,
      gallery: draft.gallery.split(/\n+/).map((item) => item.trim()).filter(Boolean),
      owner: draft.owner,
      contact: draft.contact,
      visitedOn: draft.visitedOn,
      dishes: draft.dishes,
      publication,
      verification: draft.verification,
    };
  }

  function submit(publication: PublicationStatus) {
    setBusy(true);
    setError("");
    setStatus("");
    const input = toInput(publication);
    const action =
      mode === "create" || !restaurant
        ? createRestaurant(input).then((created) => {
            router.push(`${ARCHIVE_ROUTE}/restaurants/${created.id}`);
          })
        : updateRestaurant(restaurant.id, input).then(() => {
            setStatus(publication === "published" ? "已儲存，公開頁會看到這一頁。" : "已儲存。");
            setBusy(false);
          });
    void action.catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "未能儲存。");
      setBusy(false);
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit(draft.publication);
      }}
      className="mx-auto max-w-xl space-y-5 px-4 py-5"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl">{mode === "create" ? "新的一頁" : restaurant?.name}</h2>
          {restaurant ? (
            <p className="mt-1 text-sm text-ink-soft">
              {restaurant.catalogNo} · 第 {folio(restaurant.page)} 頁
            </p>
          ) : null}
        </div>
        <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-2xl border border-line">
          {draft.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={draft.coverImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <Plate motif={draft.motif} tone={draft.tone} className="absolute inset-0" label="" />
          )}
        </div>
      </div>
      <Field label="名稱">
        <input className={fieldClass} value={draft.name} onChange={(event) => patch({ name: event.target.value })} required />
      </Field>
      <Field label="英文名">
        <input
          className={fieldClass}
          value={draft.nameEn}
          onChange={(event) => {
            const nameEn = event.target.value;
            patch(slugEdited ? { nameEn } : { nameEn, slug: slugify(nameEn) });
          }}
        />
      </Field>
      <Field label="網址代號">
        <input
          className={fieldClass}
          value={draft.slug}
          onChange={(event) => {
            setSlugEdited(true);
            patch({ slug: event.target.value });
          }}
          placeholder="lan-kwai"
        />
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
      <div className="grid grid-cols-2 gap-4">
        <Field label="緯度">
          <input className={fieldClass} inputMode="decimal" value={draft.lat} onChange={(event) => patch({ lat: event.target.value })} placeholder="22.282" />
        </Field>
        <Field label="經度">
          <input className={fieldClass} inputMode="decimal" value={draft.lng} onChange={(event) => patch({ lng: event.target.value })} placeholder="114.153" />
        </Field>
      </div>
      <Field label="封面">
        <input className={fieldClass} value={draft.coverImage} onChange={(event) => patch({ coverImage: event.target.value })} placeholder="https:// 或上傳" />
        <ImageUpload
          onUploaded={(url) => patch({ coverImage: url })}
          onError={setError}
        />
      </Field>
      <Field label="相簿">
        <textarea className={fieldClass} rows={3} value={draft.gallery} onChange={(event) => patch({ gallery: event.target.value })} placeholder="每行一個圖片位址" />
        <ImageUpload
          onUploaded={(url) => patch({ gallery: draft.gallery ? `${draft.gallery}\n${url}` : url })}
          onError={setError}
        />
      </Field>
      <Field label="營業時間">
        <textarea className={fieldClass} rows={2} value={draft.hours} onChange={(event) => patch({ hours: event.target.value })} />
      </Field>
      <Field label="聯絡">
        <input className={fieldClass} value={draft.contact} onChange={(event) => patch({ contact: event.target.value })} />
      </Field>
      <Field label="始於">
        <input className={fieldClass} value={draft.established} onChange={(event) => patch({ established: event.target.value })} placeholder="1962" />
      </Field>
      <Field label="受訪者">
        <input className={fieldClass} value={draft.owner} onChange={(event) => patch({ owner: event.target.value })} />
      </Field>
      <Field label="到訪日期">
        <input className={fieldClass} type="date" value={draft.visitedOn} onChange={(event) => patch({ visitedOn: event.target.value })} />
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
      <Field label="短片位址">
        <input className={fieldClass} value={draft.videoUrl} onChange={(event) => patch({ videoUrl: event.target.value })} placeholder="https://" />
      </Field>
      <fieldset>
        <legend className="text-[11px] tracking-[0.18em] text-ink-soft">招牌</legend>
        <div className="mt-2 space-y-3">
          {draft.dishes.map((dish, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input className={fieldClass} value={dish.name} placeholder="名稱" onChange={(event) => updateDish(index, { name: event.target.value })} />
              <input className={fieldClass} value={dish.note} placeholder="註" onChange={(event) => updateDish(index, { note: event.target.value })} />
              <button type="button" className="text-[12px] text-ink-faint" onClick={() => patch({ dishes: draft.dishes.filter((_, dishIndex) => dishIndex !== index) })}>
                移除
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="mt-3 text-[12px]" onClick={() => patch({ dishes: [...draft.dishes, { name: "", note: "" }] })}>
          加一項
        </button>
      </fieldset>
      <div className="grid grid-cols-2 gap-4">
        <Field label="出版">
          <select
            className={fieldClass}
            value={draft.publication}
            onChange={(event) => {
              if (isPublication(event.target.value)) patch({ publication: event.target.value });
            }}
          >
            {PUBLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {PUBLICATION_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="核實">
          <select
            className={fieldClass}
            value={draft.verification}
            onChange={(event) => {
              if (isVerification(event.target.value)) patch({ verification: event.target.value });
            }}
          >
            {VERIFICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {VERIFICATION_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {error ? <p className="text-sm text-stamp">{error}</p> : null}
      {status ? <p className="text-sm text-ink-soft">{status}</p> : null}
      <div className="flex flex-wrap gap-3 pt-2">
        <InkButton type="submit" disabled={busy}>
          {busy ? "儲存中" : "儲存"}
        </InkButton>
        <QuietButton disabled={busy} onClick={() => submit("draft")}>
          存成草稿
        </QuietButton>
        {restaurant ? (
          <DeleteRestaurant
            id={restaurant.id}
            name={restaurant.name}
            onDeleted={() => router.push(`${ARCHIVE_ROUTE}/restaurants`)}
          />
        ) : null}
      </div>
    </form>
  );
}

function ImageUpload({ onUploaded, onError }: { onUploaded: (url: string) => void; onError: (message: string) => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <label className="mt-2 inline-flex cursor-pointer text-sm font-medium text-accent">
      {busy ? "上傳中" : "上傳圖片"}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          const body = new FormData();
          body.set("file", file);
          setBusy(true);
          void fetch("/api/archive-management/media", { method: "POST", body })
            .then(async (response) => {
              const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
              if (!response.ok || !data?.url) {
                onError(data?.error || "圖片未能上傳。");
                return;
              }
              onUploaded(data.url);
            })
            .catch(() => onError("圖片未能上傳。"))
            .finally(() => setBusy(false));
        }}
      />
    </label>
  );
}
