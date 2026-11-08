"use client";

import Link from "next/link";
import { useState } from "react";
import { QuietButton } from "@/components/admin/fields";
import { RecordMark } from "@/components/record-mark";
import { useArchive } from "@/lib/archive";
import { districtName } from "@/lib/districts";

export function AdminDashboard() {
  const { restaurants, published, resetArchive } = useArchive();
  const drafts = restaurants.filter((restaurant) => !restaurant.published);
  const pending = restaurants.filter((restaurant) => !restaurant.verified);
  const recent = [...restaurants].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 5);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="px-4 py-5">
      <p className="text-sm leading-6 text-ink-soft">
        藏書是已出版的頁。草稿留在檔案室，核實印要另外蓋。
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat href="/admin/restaurants" label="藏書" value={published.length} />
        <Stat href="/admin/publication" label="草稿" value={drafts.length} />
        <Stat href="/admin/verification" label="待核實" value={pending.length} />
        <Stat href="/admin/verification" label="已核實" value={restaurants.length - pending.length} />
      </div>
      <h2 className="mt-8 font-serif text-2xl">最近入藏</h2>
      <ul className="mt-3">
        {recent.map((restaurant) => (
          <li key={restaurant.id} className="border-b border-line py-3">
            <Link href={`/admin/restaurants/${restaurant.id}`} className="block">
              <span className="font-serif text-lg">{restaurant.name}</span>
              <span className="mt-1 flex items-center justify-between gap-3">
                <span className="text-[12px] text-ink-soft">{districtName(restaurant.districtId)}</span>
                <span className="flex gap-2">
                  <RecordMark tone={restaurant.published ? "ink" : "quiet"}>
                    {restaurant.published ? "已出版" : "草稿"}
                  </RecordMark>
                  <RecordMark tone={restaurant.verified ? "stamp" : "quiet"}>
                    {restaurant.verified ? "已核實" : "待核實"}
                  </RecordMark>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <QuietButton
          onClick={() => {
            if (!confirming) {
              setConfirming(true);
              return;
            }
            resetArchive();
            setConfirming(false);
          }}
        >
          {confirming ? "再按一次以還原" : "還原示範藏書"}
        </QuietButton>
        <p className="mt-3 text-[12px] leading-5 text-ink-faint">
          還原會清掉這部瀏覽器上的修改和收藏，回到內置的示範頁。
        </p>
      </div>
    </div>
  );
}

function Stat({ href, label, value }: { href: string; label: string; value: number }) {
  return (
    <Link href={href} className="border border-line px-3 py-3">
      <span className="block font-serif text-4xl leading-none">{value}</span>
      <span className="mt-2 block text-[11px] tracking-[0.16em] text-ink-soft">{label}</span>
    </Link>
  );
}
