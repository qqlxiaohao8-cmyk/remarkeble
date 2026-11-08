"use client";

import { useEffect, useState } from "react";
import { PlayIcon } from "@/components/icons";
import { Plate } from "@/components/plate";
import { formatClock, parseDuration } from "@/lib/format";
import type { Motif, Tone } from "@/lib/types";

export function VideoPlayer({
  title,
  duration,
  motif,
  tone,
}: {
  title: string;
  duration: string;
  motif: Motif;
  tone: Tone;
}) {
  const total = parseDuration(duration);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setTime((current) => {
        const next = current + 0.25;
        if (next >= total) {
          setPlaying(false);
          return total;
        }
        return next;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [playing, total]);

  const finished = time >= total && total > 0;

  return (
    <div>
      <div className="bg-binding p-2">
        <div className="flex gap-2">
          <Sprockets />
          <button
            type="button"
            onClick={() => {
              if (finished) setTime(0);
              setPlaying((current) => !current);
            }}
            className="relative aspect-video min-w-0 flex-1 overflow-hidden"
            aria-label={playing ? "暫停短片" : "播放短片"}
          >
            <Plate motif={motif} tone={tone} className="absolute inset-0" label="" />
            <div className={playing ? "absolute inset-0 bg-ink/10" : "absolute inset-0 bg-ink/25"} />
            {!playing && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-paper/90 text-ink">
                  <PlayIcon className="ml-0.5 h-5 w-5" />
                </span>
              </span>
            )}
          </button>
          <Sprockets />
        </div>
      </div>
      <label className="mt-3 block">
        <span className="sr-only">播放進度</span>
        <input
          type="range"
          min={0}
          max={total}
          step={0.1}
          value={Math.min(time, total)}
          onChange={(event) => {
            setTime(Number(event.target.value));
            setPlaying(false);
          }}
          className="w-full accent-ink"
        />
      </label>
      <div className="mt-1 flex items-baseline justify-between gap-3 text-[11px] text-ink-soft">
        <span className="font-serif tabular-nums">{formatClock(time)}</span>
        <span className="min-w-0 truncate">{finished ? "完" : title}</span>
        <span className="font-serif tabular-nums">{duration}</span>
      </div>
    </div>
  );
}

function Sprockets() {
  return (
    <div className="flex w-3 flex-col justify-between py-1" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className="mx-auto h-2 w-2 bg-paper/80" />
      ))}
    </div>
  );
}
