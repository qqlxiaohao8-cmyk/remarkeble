"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IndexTabs } from "@/components/book/index-tabs";
import { SaveButton } from "@/components/save-button";
import { Plate } from "@/components/plate";
import { useArchive } from "@/lib/archive";
import { districtName, getDistrict, getRegion, type RegionId } from "@/lib/districts";
import { chineseCount, folio } from "@/lib/format";

export function OpenBook() {
  const { published } = useArchive();
  const reduce = useReducedMotion();
  const [region, setRegion] = useState<RegionId | "all">("all");
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [turned, setTurned] = useState(false);

  const list = useMemo(() => {
    if (region === "all") return published;
    return published.filter((restaurant) => getDistrict(restaurant.districtId)?.regionId === region);
  }, [published, region]);

  const activeIndex = list.length === 0 ? 0 : Math.min(index, list.length - 1);
  const current = list[activeIndex];
  const regionLabel = region === "all" ? "全冊" : (getRegion(region)?.name ?? "全冊");

  const go = useCallback(
    (nextDirection: 1 | -1) => {
      setTurned(true);
      setDirection(nextDirection);
      setIndex((currentIndex) => {
        const max = Math.max(list.length - 1, 0);
        const base = Math.min(currentIndex, max);
        return Math.min(max, Math.max(0, base + nextDirection));
      });
    },
    [list.length],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const windowed = useMemo(() => {
    const size = 5;
    if (list.length <= size) return list.map((restaurant, itemIndex) => ({ restaurant, itemIndex }));
    let start = Math.max(0, activeIndex - 2);
    if (start + size > list.length) start = list.length - size;
    return list.slice(start, start + size).map((restaurant, offset) => ({
      restaurant,
      itemIndex: start + offset,
    }));
  }, [activeIndex, list]);

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const startX = Number(event.currentTarget.dataset.x);
    const startY = Number(event.currentTarget.dataset.y);
    if (!Number.isFinite(startX) || !Number.isFinite(startY)) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy)) return;
    go(dx < 0 ? 1 : -1);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className="relative min-h-0 flex-1 touch-none"
        data-x="0"
        data-y="0"
        onPointerDown={(event) => {
          event.currentTarget.dataset.x = String(event.clientX);
          event.currentTarget.dataset.y = String(event.clientY);
        }}
        onPointerUp={onPointerUp}
      >
        <div className="pointer-events-none absolute inset-y-3 right-7 left-0 translate-y-2 rounded-[3px] bg-binding" />
        <div className="relative z-10 mr-7 flex h-full min-w-0 shadow-[0_14px_28px_rgba(36,31,28,0.16)]">
          <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-l-[2px] border border-[#e4dac8] bg-sheet">
            <div className="paper-grain absolute inset-0" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-5 bg-gradient-to-l from-ink/10 to-transparent" />
            <div className="relative flex h-full flex-col px-3 py-3 md:px-7 md:py-7">
              <p className="font-editorial text-[11px] italic text-ink-soft md:text-sm">remarkeble</p>
              <p className="mt-2 text-[10px] tracking-[0.2em] text-ink-faint">{regionLabel}</p>
              <p className="mt-2 font-serif text-4xl leading-none md:text-6xl">{chineseCount(list.length)}</p>
              <p className="text-[11px] text-ink-soft">間食肆</p>
              <p className="mt-4 hidden text-sm leading-7 text-ink-soft md:block">
                一間餐廳，一頁。相片、故事、短片與日常，釘在同一冊裡。
              </p>
              <ul className="mt-3 min-h-0 flex-1 space-y-1 overflow-hidden">
                {windowed.map(({ restaurant, itemIndex }) => (
                  <li key={restaurant.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setTurned(true);
                        setDirection(itemIndex > activeIndex ? 1 : -1);
                        setIndex(itemIndex);
                      }}
                      className="flex w-full min-w-0 items-baseline gap-2 text-left"
                    >
                      <span className="w-5 shrink-0 font-editorial text-[11px] text-ink-faint">
                        {folio(restaurant.page)}
                      </span>
                      <span
                        className={
                          itemIndex === activeIndex
                            ? "truncate font-serif text-[13px] md:text-base"
                            : "truncate text-[12px] text-ink-soft md:text-sm"
                        }
                      >
                        {restaurant.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="font-editorial text-[11px] text-ink-faint">
                {current ? `${folio(current.page)} / ${folio(list[list.length - 1]?.page ?? current.page)}` : "—"}
              </p>
            </div>
          </section>
          <div className="relative w-3 shrink-0 bg-[linear-gradient(90deg,#cbbfaa_0%,#f4efe4_28%,#b7ab98_50%,#f7f3ea_74%,#cfc3ae_100%)] shadow-[inset_0_0_8px_rgba(36,31,28,0.25)]">
            <div className="absolute inset-y-4 left-1/2 w-px -translate-x-1/2 bg-ink/15" />
          </div>
          <section className="relative min-w-0 flex-1 overflow-hidden rounded-r-[2px] border border-[#e4dac8] bg-leaf">
            <div className="paper-grain absolute inset-0" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-ink/10 to-transparent" />
            {current ? (
              <motion.div
                key={current.id}
                className="page-turn relative flex h-full flex-col"
                initial={turned && !reduce ? { opacity: 0, x: direction * 16 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex min-h-0 flex-1 items-start justify-center px-2.5 pt-2.5 md:px-5 md:pt-5">
                  <div className="relative aspect-[20/26] h-full max-h-full w-auto max-w-full">
                    <Plate motif={current.motif} tone={current.tone} className="absolute inset-0" label={current.name} />
                    <SavedRibbon id={current.id} />
                  </div>
                </div>
                <div className="relative shrink-0 px-3 py-2 md:px-6 md:py-4">
                  <p className="text-[10px] tracking-[0.16em] text-ink-faint">{current.catalogNo}</p>
                  <h2 className="mt-1 truncate font-serif text-[1.05rem] leading-tight md:text-3xl">{current.name}</h2>
                  <p className="mt-1 truncate text-[10px] text-ink-soft md:text-xs">
                    {districtName(current.districtId)} · {current.established}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <Link href={`/restaurant/${current.slug}`} className="text-[11px] tracking-[0.16em]">
                      閱讀此頁
                    </Link>
                    <SaveButton id={current.id} compact />
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center">
                <p className="font-serif text-lg">此區尚未入藏</p>
              </div>
            )}
          </section>
        </div>
        <IndexTabs
          active={region}
          onChange={(next) => {
            setRegion(next);
            setIndex(0);
            setTurned(true);
            setDirection(1);
          }}
        />
        <p className="sr-only" aria-live="polite">
          {current ? `${current.name}，第 ${current.page} 頁` : "此區尚未入藏"}
        </p>
      </div>
      <div className="mt-2 flex shrink-0 items-center justify-center gap-5">
        <button
          type="button"
          aria-label="上一頁"
          disabled={!current || activeIndex <= 0}
          onClick={() => go(-1)}
          className="px-3 py-1 font-editorial text-xl disabled:opacity-30"
        >
          ‹
        </button>
        <span className="font-editorial text-sm tabular-nums text-ink-soft">
          {current ? folio(current.page) : "—"}
        </span>
        <button
          type="button"
          aria-label="下一頁"
          disabled={!current || activeIndex >= list.length - 1}
          onClick={() => go(1)}
          className="px-3 py-1 font-editorial text-xl disabled:opacity-30"
        >
          ›
        </button>
      </div>
    </div>
  );
}

function SavedRibbon({ id }: { id: string }) {
  const { ready, isSaved } = useArchive();
  if (!ready || !isSaved(id)) return null;
  return <span className="absolute left-3 top-0 z-10 h-12 w-2 bg-stamp" aria-hidden />;
}
