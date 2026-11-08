"use client";

import Link from "next/link";
import { Plate } from "@/components/plate";
import { PendingStamp, Stamp } from "@/components/stamp";
import { VideoPlayer } from "@/components/video-player";
import { useArchive } from "@/lib/archive";
import { districtName } from "@/lib/districts";
import { paragraphs } from "@/lib/format";

export function StoryScreen({ slug }: { slug: string }) {
  const { restaurants } = useArchive();
  const restaurant = restaurants.find((item) => item.slug === slug);

  if (!restaurant) {
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

  return (
    <article>
      <div className="relative h-56 bg-paper-deep">
        <Plate motif={restaurant.motif} tone={restaurant.tone} className="absolute inset-0" label="" />
        <div className="absolute top-4 left-4 -rotate-6 rounded-full border border-stamp bg-white px-2.5 py-1 font-serif text-[11px] font-bold text-stamp">
          {restaurant.verified ? "已核實" : "待核實"}
        </div>
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
        {!restaurant.published ? <p className="text-sm leading-6 text-ink-soft">這頁還是草稿，未放入藏書。</p> : null}
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
          <VideoPlayer
            title={restaurant.videoTitle || "未題名"}
            duration={restaurant.videoDuration}
            motif={restaurant.motif}
            tone={restaurant.tone}
          />
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
          <div>
            <p className="text-xs text-ink-soft">登錄</p>
            <p className="mt-1 font-serif leading-6">{restaurant.catalogNo}</p>
          </div>
          <div>{restaurant.verified ? <Stamp /> : <PendingStamp />}</div>
        </section>
      </div>
    </article>
  );
}
