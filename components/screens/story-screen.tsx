"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plate } from "@/components/plate";
import { PendingStamp, Stamp } from "@/components/stamp";
import { VideoPlayer } from "@/components/video-player";
import { useArchive } from "@/lib/archive";
import { districtName } from "@/lib/districts";
import { paragraphs } from "@/lib/format";
import { publicationOf, verificationOf } from "@/lib/status";
import type { Restaurant } from "@/lib/types";

export function StoryScreen({ slug }: { slug: string }) {
  const { restaurants, ready } = useArchive();
  const [preview, setPreview] = useState<{ slug: string; restaurant: Restaurant | null } | null>(null);
  const listed = restaurants.find((item) => item.slug === slug) ?? null;
  const previewForSlug = preview?.slug === slug ? preview.restaurant : undefined;

  useEffect(() => {
    if (!ready || listed) return;
    let cancel = false;
    void fetch("/api/archive-management/restaurants", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = (await response.json()) as { restaurants?: Restaurant[] };
        return data.restaurants?.find((item) => item.slug === slug) ?? null;
      })
      .then((found) => {
        if (!cancel) setPreview({ slug, restaurant: found });
      })
      .catch(() => {
        if (!cancel) setPreview({ slug, restaurant: null });
      });
    return () => {
      cancel = true;
    };
  }, [listed, ready, slug]);

  const restaurant = listed ?? (previewForSlug === undefined ? null : previewForSlug);

  if (!restaurant) {
    if (!ready || previewForSlug === undefined) return <div className="min-h-full bg-white" />;
    return (
      <div className="px-6 py-16 text-center">
        <h1 className="font-serif text-2xl font-bold">這一頁不在檔案裡</h1>
        <Link href="/directory" className="mt-4 inline-block text-xs font-semibold">
          返回目錄
        </Link>
      </div>
    );
  }

  const story = paragraphs(restaurant.story);
  const verification = verificationOf(restaurant);
  const mark = verification === "verified" ? "已核實" : verification === "visited" ? "已到訪" : null;
  const video = embedUrl(restaurant.videoUrl);

  return (
    <article>
      <div className="relative h-56 bg-paper-deep">
        {restaurant.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={restaurant.coverImage} alt="" className="h-full w-full object-cover" />
        ) : (
          <Plate motif={restaurant.motif} tone={restaurant.tone} className="absolute inset-0" label="" />
        )}
        {mark ? (
          <div className="absolute top-4 left-4 -rotate-6 rounded-full border border-stamp bg-white px-2.5 py-1 font-serif text-[11px] font-bold text-stamp">
            {mark}
          </div>
        ) : null}
      </div>
      <div className="space-y-8 py-6 pr-12 pl-6">
        <header>
          <h1 className="font-serif text-2xl leading-tight font-bold">{restaurant.name}</h1>
          <p className="mt-1 text-sm text-ink-soft">{restaurant.nameEn}</p>
          <p className="mt-1 flex gap-x-2 font-serif text-sm text-ink-soft">
            <span>{districtName(restaurant.districtId)}</span>
            <span>{restaurant.established}</span>
          </p>
        </header>
        {publicationOf(restaurant) !== "published" ? (
          <p className="text-sm leading-6 text-ink-soft">這頁還未出版，未放入藏書。</p>
        ) : null}
        <Link href={`/map?pin=${restaurant.slug}`} className="pressable inline-block text-sm font-medium text-accent">
          在地圖上
        </Link>
        <section className="space-y-3">
          <h2 className="font-serif text-base font-bold">故事</h2>
          <div className="space-y-3 font-serif text-[15px] leading-7">
            {story.map((paragraph, index) => (
              <p key={paragraph} className={index === 0 ? "drop-cap" : undefined}>
                {paragraph}
              </p>
            ))}
          </div>
        </section>
        <section className="space-y-1">
          <h2 className="font-serif text-base font-bold">招牌</h2>
          {restaurant.dishes.length === 0 ? (
            <p className="text-sm text-ink-soft">未登記</p>
          ) : (
            <ul>
              {restaurant.dishes.map((dish) => (
                <li key={dish.name} className="border-b border-paper-deep py-3">
                  <span className="block font-serif text-sm font-bold">{dish.name}</span>
                  {dish.note ? <span className="mt-0.5 block text-xs leading-5 text-ink-soft">{dish.note}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="space-y-3">
          <h2 className="font-serif text-base font-bold">短片</h2>
          <p className="font-serif text-sm font-bold">{restaurant.videoTitle || "未題名"}</p>
          {video ? (
            video.kind === "file" ? (
              <video className="w-full rounded-2xl bg-binding" controls src={video.src} />
            ) : (
              <iframe className="aspect-video w-full rounded-2xl" src={video.src} title={restaurant.videoTitle || restaurant.name} allowFullScreen />
            )
          ) : (
            <VideoPlayer
              title={restaurant.videoTitle || "未題名"}
              duration={restaurant.videoDuration}
              motif={restaurant.motif}
              tone={restaurant.tone}
            />
          )}
        </section>
        <section className="space-y-4 border-t border-paper-deep pt-6 text-sm">
          <div>
            <p className="text-xs text-ink-soft">地址</p>
            <p className="mt-1 font-serif leading-6">{restaurant.address}</p>
          </div>
          <div>
            <p className="text-xs text-ink-soft">時間</p>
            <p className="mt-1 font-serif leading-6 whitespace-pre-line">{restaurant.hours}</p>
          </div>
          {restaurant.owner ? (
            <div>
              <p className="text-xs text-ink-soft">受訪</p>
              <p className="mt-1 font-serif leading-6">{restaurant.owner}</p>
            </div>
          ) : null}
          {restaurant.contact ? (
            <div>
              <p className="text-xs text-ink-soft">聯絡</p>
              <p className="mt-1 font-serif leading-6">{restaurant.contact}</p>
            </div>
          ) : null}
          <div>
            <p className="text-xs text-ink-soft">登錄</p>
            <p className="mt-1 font-serif leading-6">{restaurant.catalogNo}</p>
          </div>
          {mark ? (
            <div>
              {verification === "verified" ? <Stamp /> : <PendingStamp />}
              {restaurant.visitedOn ? <p className="mt-2 text-xs text-ink-soft">{restaurant.visitedOn}</p> : null}
            </div>
          ) : null}
        </section>
        {restaurant.gallery && restaurant.gallery.length > 0 ? (
          <section className="space-y-3">
            <h2 className="font-serif text-base font-bold">圖片</h2>
            <div className="grid grid-cols-2 gap-2">
              {restaurant.gallery.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}

function embedUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.slice(1);
      return id ? { kind: "frame" as const, src: `https://www.youtube.com/embed/${id}` } : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop();
      return id ? { kind: "frame" as const, src: `https://www.youtube.com/embed/${id}` } : null;
    }
    if (host === "vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean).pop();
      return id ? { kind: "frame" as const, src: `https://player.vimeo.com/video/${id}` } : null;
    }
    return { kind: "file" as const, src: value };
  } catch {
    return null;
  }
}
