"use client";

import Link from "next/link";
import { OpenBook } from "@/components/book/open-book";
import { RecentSlips } from "@/components/book/recent-slips";
import { useArchive } from "@/lib/archive";
import { chineseCount } from "@/lib/format";

export function CollectionHome() {
  const { published } = useArchive();
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-end justify-between px-4 pt-[max(0.85rem,env(safe-area-inset-top))] pb-1">
        <div>
          <p className="font-editorial text-[1.65rem] leading-none italic">remarkeble</p>
          <p className="mt-1 text-[10px] tracking-[0.22em] text-ink-faint">香港飲食檔案</p>
        </div>
        <div className="text-right">
          <p className="font-serif text-sm">藏書 {chineseCount(published.length)}</p>
          <Link href="/admin" className="text-[10px] tracking-[0.18em] text-ink-faint">
            檔案室
          </Link>
        </div>
      </header>
      <div className="min-h-0 flex-1 px-3 py-2">
        <OpenBook />
      </div>
      <RecentSlips />
    </div>
  );
}
