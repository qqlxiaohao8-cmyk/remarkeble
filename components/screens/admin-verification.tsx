"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdmin } from "@/components/admin/admin-provider";
import { QuietButton } from "@/components/admin/fields";
import { districtName } from "@/lib/districts";
import { ARCHIVE_ROUTE } from "@/lib/routes";
import { verificationOf } from "@/lib/status";
import type { Restaurant, VerificationStatus } from "@/lib/types";

export function AdminVerification() {
  const { restaurants, ready, loadError, updateRestaurant } = useAdmin();
  const [error, setError] = useState("");
  if (loadError) return <p className="px-4 py-10 text-sm text-stamp">{loadError}</p>;
  if (!ready) return <p className="px-4 py-10 text-sm text-ink-soft">讀取檔案…</p>;

  function setStatus(id: string, verification: VerificationStatus) {
    setError("");
    void updateRestaurant(id, { verification }).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "未能更新。");
    });
  }

  return (
    <div className="px-4 py-5">
      <h2 className="font-serif text-3xl">核實</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">未核實不會在公開頁顯示印記。已到訪和已核實會出現在故事頁。</p>
      {error ? <p className="mt-3 text-sm text-stamp">{error}</p> : null}
      <Section
        title="未核實"
        restaurants={restaurants.filter((item) => verificationOf(item) === "unverified")}
        empty="沒有未核實的紀錄。"
        action="記為已到訪"
        onAction={(id) => setStatus(id, "visited")}
      />
      <Section
        title="已到訪"
        restaurants={restaurants.filter((item) => verificationOf(item) === "visited")}
        empty="還沒有到訪紀錄。"
        action="核實"
        onAction={(id) => setStatus(id, "verified")}
      />
      <Section
        title="已核實"
        restaurants={restaurants.filter((item) => verificationOf(item) === "verified")}
        empty="尚未有核實紀錄。"
        action="撤回"
        onAction={(id) => setStatus(id, "unverified")}
      />
    </div>
  );
}

function Section({
  title,
  restaurants,
  empty,
  action,
  onAction,
}: {
  title: string;
  restaurants: Restaurant[];
  empty: string;
  action: string;
  onAction: (id: string) => void;
}) {
  return (
    <section className="mt-8">
      <h3 className="font-serif text-2xl">{title}</h3>
      {restaurants.length === 0 ? (
        <p className="mt-3 text-sm text-ink-faint">{empty}</p>
      ) : (
        <ul className="mt-2">
          {restaurants.map((restaurant) => (
            <li key={restaurant.id} className="flex items-center justify-between gap-3 border-b border-line py-3">
              <Link href={`${ARCHIVE_ROUTE}/restaurants/${restaurant.id}`} className="min-w-0">
                <span className="block truncate font-serif text-lg">{restaurant.name}</span>
                <span className="block text-[12px] text-ink-soft">{districtName(restaurant.districtId)}</span>
              </Link>
              <QuietButton className="shrink-0 rounded-2xl px-3 py-2" onClick={() => onAction(restaurant.id)}>
                {action}
              </QuietButton>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
