"use client";

import Link from "next/link";
import { useAdmin } from "@/components/admin/admin-provider";
import { RecordMark } from "@/components/record-mark";
import { districtName } from "@/lib/districts";
import { ARCHIVE_ROUTE } from "@/lib/routes";
import { PUBLICATION_LABELS, publicationOf, VERIFICATION_LABELS, verificationOf } from "@/lib/status";

export function AdminDashboard() {
  const { restaurants, ready, loadError, logout } = useAdmin();
  if (loadError) return <p className="px-4 py-10 text-sm text-stamp">{loadError}</p>;
  if (!ready) return <p className="px-4 py-10 text-sm text-ink-soft">讀取檔案…</p>;

  const published = restaurants.filter((restaurant) => publicationOf(restaurant) === "published");
  const drafts = restaurants.filter((restaurant) => publicationOf(restaurant) === "draft");
  const archived = restaurants.filter((restaurant) => publicationOf(restaurant) === "archived");
  const recent = [...restaurants].sort((a, b) => (b.updatedAt || b.addedAt).localeCompare(a.updatedAt || a.addedAt)).slice(0, 5);

  return (
    <div className="px-4 py-5">
      <p className="text-sm leading-6 text-ink-soft">只有已出版的頁會出現在藏書、地圖和目錄。</p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat href={`${ARCHIVE_ROUTE}/restaurants`} label="全部" value={restaurants.length} />
        <Stat href={`${ARCHIVE_ROUTE}/publication`} label="已出版" value={published.length} />
        <Stat href={`${ARCHIVE_ROUTE}/publication`} label="草稿" value={drafts.length} />
        <Stat href={`${ARCHIVE_ROUTE}/publication`} label="封存" value={archived.length} />
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`${ARCHIVE_ROUTE}/restaurants/new`} className="rounded-2xl bg-accent px-4 py-3 text-[13px] font-medium text-white">
          新入藏
        </Link>
        <Link href={`${ARCHIVE_ROUTE}/restaurants`} className="rounded-2xl border border-line px-4 py-3 text-[13px] font-medium">
          管理餐廳
        </Link>
        <button type="button" className="rounded-2xl border border-line px-4 py-3 text-[13px] font-medium" onClick={() => void logout()}>
          登出
        </button>
      </div>
      <h2 className="mt-8 font-serif text-2xl">最近更新</h2>
      <ul className="mt-3">
        {recent.map((restaurant) => (
          <li key={restaurant.id} className="border-b border-line py-3">
            <Link href={`${ARCHIVE_ROUTE}/restaurants/${restaurant.id}`} className="block">
              <span className="font-serif text-lg">{restaurant.name}</span>
              <span className="mt-1 flex items-center justify-between gap-3">
                <span className="text-[12px] text-ink-soft">{districtName(restaurant.districtId)}</span>
                <span className="flex gap-2">
                  <RecordMark tone={publicationOf(restaurant) === "published" ? "ink" : "quiet"}>
                    {PUBLICATION_LABELS[publicationOf(restaurant)]}
                  </RecordMark>
                  <RecordMark tone={verificationOf(restaurant) === "verified" ? "stamp" : "quiet"}>
                    {VERIFICATION_LABELS[verificationOf(restaurant)]}
                  </RecordMark>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ href, label, value }: { href: string; label: string; value: number }) {
  return (
    <Link href={href} className="rounded-2xl border border-line bg-white px-3 py-3">
      <span className="block font-serif text-4xl leading-none">{value}</span>
      <span className="mt-2 block text-[12px] text-ink-soft">{label}</span>
    </Link>
  );
}
