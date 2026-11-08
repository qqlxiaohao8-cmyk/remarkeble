"use client";

import { useRouter } from "next/navigation";
import { useArchive } from "@/lib/archive";
import { chineseCount } from "@/lib/format";

export function BookCover() {
  const router = useRouter();
  const { published } = useArchive();

  return (
    <button
      type="button"
      onClick={() => router.push("/map")}
      aria-label="打開地圖"
      className="relative flex h-full w-full flex-col overflow-hidden rounded-[18px] bg-paper text-left"
    >
      <span className="absolute inset-y-0 left-0 w-3.5 bg-ink" aria-hidden />
      <span className="paper-grain absolute inset-0" aria-hidden />
      <span className="relative flex flex-1 flex-col justify-between py-8 pr-6 pl-8">
        <span>
          <span className="block text-[10px] tracking-[0.28em] text-ink-faint">VOLUME 01</span>
          <span className="mt-2 block text-[11px] tracking-[0.22em] text-taupe">香港飲食檔案</span>
        </span>
        <span>
          <span className="block font-editorial text-[2.6rem] leading-none italic">remarkeble</span>
          <span className="mt-5 block h-px w-10 bg-sage" />
          <span className="mt-4 block font-serif text-lg leading-7">本地食肆</span>
          <span className="mt-1 block text-[13px] text-ink-soft">一間餐廳，一頁。</span>
        </span>
        <span className="flex items-end justify-between gap-3">
          <span className="text-[12px] tracking-[0.16em] text-ink-faint">輕觸封面</span>
          <span className="text-right font-serif text-sm">藏書 {chineseCount(published.length)}</span>
        </span>
      </span>
    </button>
  );
}
