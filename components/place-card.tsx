"use client";

import { useEffect, useRef, useState } from "react";
import { Plate } from "@/components/plate";
import { districtName } from "@/lib/districts";
import { paragraphs } from "@/lib/format";
import { playbackFrom, type Playback } from "@/lib/playback";
import { cn } from "@/lib/cn";
import type { Restaurant } from "@/lib/types";

const PAGES = [
  { id: "overview", label: "概覽" },
  { id: "story", label: "故事" },
  { id: "details", label: "詳情" },
  { id: "features", label: "特色" },
] as const;

export function PlaceCard({ restaurant, onClose }: { restaurant: Restaurant; onClose: () => void }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<"x" | "y" | null>(null);
  const suppressClick = useRef(false);
  const busy = useRef(false);
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [instant, setInstant] = useState(false);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function slide(direction: 1 | -1, next: number) {
    if (busy.current) return;
    if (next === index) {
      setOffset(0);
      return;
    }
    if (reduce) {
      setIndex(next);
      setOffset(0);
      return;
    }
    const width = frameRef.current?.clientWidth ?? 280;
    busy.current = true;
    setInstant(false);
    setOffset(-direction * width);
    window.setTimeout(() => {
      setInstant(true);
      setIndex(next);
      setOffset(direction * width);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setInstant(false);
          setOffset(0);
          busy.current = false;
        });
      });
    }, 220);
  }

  function jump(next: number) {
    if (next === index) return;
    slide(next > index ? 1 : -1, next);
  }

  return (
    <div className="absolute inset-0 z-40">
      <button type="button" className="absolute inset-0 bg-black/55" aria-label="關閉" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={restaurant.name}
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 py-5"
      >
        <div
          ref={frameRef}
          className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-[0_22px_44px_-18px_rgba(0,0,0,0.45)]"
          style={{ touchAction: "pan-y" }}
          onPointerDown={(event) => {
            if (busy.current) return;
            origin.current = { x: event.clientX, y: event.clientY };
            axis.current = null;
            suppressClick.current = false;
          }}
          onPointerMove={(event) => {
            if (!origin.current || busy.current) return;
            const dx = event.clientX - origin.current.x;
            const dy = event.clientY - origin.current.y;
            if (!axis.current) {
              if (Math.hypot(dx, dy) < 8) return;
              axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
            }
            if (axis.current !== "x") return;
            suppressClick.current = true;
            const atStart = index === 0 && dx > 0;
            const atEnd = index === PAGES.length - 1 && dx < 0;
            setOffset(atStart || atEnd ? dx * 0.35 : dx);
          }}
          onPointerUp={(event) => {
            if (!origin.current) return;
            const dx = event.clientX - origin.current.x;
            const horizontal = axis.current === "x";
            origin.current = null;
            axis.current = null;
            if (!horizontal) return;
            if (dx <= -64) slide(1, Math.min(PAGES.length - 1, index + 1));
            else if (dx >= 64) slide(-1, Math.max(0, index - 1));
            else setOffset(0);
          }}
          onPointerCancel={() => {
            origin.current = null;
            axis.current = null;
            setOffset(0);
          }}
        >
          <div
            className="h-[min(62dvh,28rem)]"
            style={{
              transform: `translateX(${offset}px)`,
              transition: instant ? "none" : "transform 220ms cubic-bezier(.2,.8,.2,1)",
            }}
          >
            {PAGES[index].id === "overview" ? (
              <Overview restaurant={restaurant} suppressClick={suppressClick} />
            ) : null}
            {PAGES[index].id === "story" ? <StoryPage restaurant={restaurant} /> : null}
            {PAGES[index].id === "details" ? <DetailsPage restaurant={restaurant} /> : null}
            {PAGES[index].id === "features" ? <FeaturesPage restaurant={restaurant} /> : null}
          </div>
        </div>
        <nav className="pointer-events-auto mt-3 flex gap-1 rounded-full bg-white/95 p-1 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]" aria-label="介紹">
          {PAGES.map((page, pageIndex) => (
            <button
              key={page.id}
              type="button"
              aria-current={pageIndex === index ? "page" : undefined}
              onClick={() => jump(pageIndex)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-medium",
                pageIndex === index ? "bg-ink text-white" : "text-ink-soft",
              )}
            >
              {page.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);
  return reduce;
}

function Overview({
  restaurant,
  suppressClick,
}: {
  restaurant: Restaurant;
  suppressClick: React.MutableRefObject<boolean>;
}) {
  const playback = playbackFrom(restaurant.videoUrl);
  const [playing, setPlaying] = useState(false);
  const [run, setRun] = useState(0);
  const [error, setError] = useState("");

  return (
    <div className="relative h-full bg-paper">
      {playing && playback ? (
        <Player
          key={run}
          playback={playback}
          poster={restaurant.coverImage || ""}
          onEnded={() => setPlaying(false)}
          onError={() => {
            setPlaying(false);
            setError("這條影片無法在這裡播放。");
          }}
        />
      ) : (
        <button
          type="button"
          className="relative block h-full w-full"
          aria-label={playback ? `播放${restaurant.name}` : restaurant.name}
          onClick={() => {
            if (suppressClick.current) {
              suppressClick.current = false;
              return;
            }
            if (!playback) {
              if (restaurant.videoUrl) setError("這條 Instagram 連結無法播放。");
              return;
            }
            setError("");
            setRun((value) => value + 1);
            setPlaying(true);
          }}
        >
          <Poster restaurant={restaurant} />
          {playback ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-lg text-ink shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)]">
                ▶
              </span>
            </span>
          ) : null}
        </button>
      )}
      {error ? <p className="absolute inset-x-3 bottom-3 text-center text-xs text-stamp">{error}</p> : null}
    </div>
  );
}

function Poster({ restaurant }: { restaurant: Restaurant }) {
  if (restaurant.coverImage) {
    return <img src={restaurant.coverImage} alt="" className="h-full w-full object-contain" />;
  }
  return <Plate motif={restaurant.motif} tone={restaurant.tone} className="absolute inset-0" label={restaurant.name} />;
}

function Player({
  playback,
  poster,
  onEnded,
  onError,
}: {
  playback: Playback;
  poster: string;
  onEnded: () => void;
  onError: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onEndedRef = useRef(onEnded);
  const onErrorRef = useRef(onError);
  onEndedRef.current = onEnded;
  onErrorRef.current = onError;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => onErrorRef.current());
  }, []);

  useEffect(() => {
    if (playback.kind === "file") return;
    function onMessage(event: MessageEvent) {
      const origin = String(event.origin);
      const text = typeof event.data === "string" ? event.data : JSON.stringify(event.data ?? "");
      if (playback.kind === "youtube" && origin.includes("youtube.com")) {
        let data: { event?: string; info?: number } | null = null;
        try {
          data = typeof event.data === "string" ? (JSON.parse(event.data) as { event?: string; info?: number }) : event.data;
        } catch {
          return;
        }
        if (data?.event === "onStateChange" && data.info === 0) onEndedRef.current();
      }
      if (playback.kind === "instagram" && origin.includes("instagram.com") && /ended|video_ended|finish/i.test(text)) {
        onEndedRef.current();
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [playback.kind]);

  if (playback.kind === "file" && !playback.src.includes("player.vimeo.com")) {
    return (
      <video
        ref={videoRef}
        className="h-full w-full bg-black object-contain"
        src={playback.src}
        poster={poster || undefined}
        playsInline
        controls={false}
        onEnded={onEnded}
        onError={onError}
      />
    );
  }

  return (
    <iframe
      title="影片"
      src={playback.src}
      className="h-full w-full border-0 bg-black"
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      onLoad={(event) => {
        if (playback.kind !== "youtube") return;
        event.currentTarget.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1 }), "*");
      }}
    />
  );
}

function StoryPage({ restaurant }: { restaurant: Restaurant }) {
  const story = paragraphs(restaurant.story);
  return (
    <article className="h-full overflow-y-auto px-5 py-6">
      <h2 className="font-serif text-2xl font-bold">{restaurant.name}</h2>
      {story.length === 0 ? <p className="mt-4 text-sm text-ink-soft">還沒有故事。</p> : null}
      <div className="mt-4 space-y-3 font-serif text-[15px] leading-7">
        {story.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}

function DetailsPage({ restaurant }: { restaurant: Restaurant }) {
  const hours = restaurant.hours.split("\n").map((line) => line.trim()).filter(Boolean);
  return (
    <article className="h-full overflow-y-auto px-5 py-6">
      <h2 className="font-serif text-2xl font-bold">詳情</h2>
      <dl className="mt-4 space-y-4">
        <div>
          <dt className="text-xs text-ink-soft">地點</dt>
          <dd className="mt-1 font-serif leading-6">{districtName(restaurant.districtId)}</dd>
          {restaurant.address ? <dd className="font-serif leading-6">{restaurant.address}</dd> : null}
        </div>
        <div>
          <dt className="text-xs text-ink-soft">開放時間</dt>
          {hours.length === 0 ? <dd className="mt-1 font-serif leading-6">未登記</dd> : null}
          {hours.map((line) => (
            <dd key={line} className="mt-1 font-serif leading-6">
              {line}
            </dd>
          ))}
        </div>
        {restaurant.established ? (
          <div>
            <dt className="text-xs text-ink-soft">始於</dt>
            <dd className="mt-1 font-serif leading-6">{restaurant.established}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}

function FeaturesPage({ restaurant }: { restaurant: Restaurant }) {
  return (
    <article className="h-full overflow-y-auto px-5 py-6">
      <h2 className="font-serif text-2xl font-bold">特色</h2>
      {restaurant.dishes.length === 0 ? <p className="mt-4 text-sm text-ink-soft">還沒有寫上特色。</p> : null}
      <ul className="mt-2">
        {restaurant.dishes.map((dish) => (
          <li key={dish.name} className="border-b border-paper-deep py-3">
            <span className="block font-serif text-sm font-bold">{dish.name}</span>
            {dish.note ? <span className="mt-0.5 block text-xs leading-5 text-ink-soft">{dish.note}</span> : null}
          </li>
        ))}
      </ul>
    </article>
  );
}
