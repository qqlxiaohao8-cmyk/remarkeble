"use client";

import { useArchive } from "@/lib/archive";

export function AboutScreen() {
  const { published } = useArchive();
  const years = published.map((restaurant) => Number(restaurant.established)).filter((year) => Number.isFinite(year) && year > 0);
  const earliest = years.length > 0 ? Math.min(...years) : "—";
  const districts = new Set(published.map((restaurant) => restaurant.districtId)).size;

  return (
    <article className="space-y-5 py-8 pr-12 pl-6">
      <h2 className="font-serif text-2xl leading-snug font-bold">這冊收的是香港的老店</h2>
      <div className="space-y-3 font-serif text-[15px] leading-7">
        <p>飲食寫在瓷杯、鐵皮檔和街角的窗裡。這些店還在，味道也還在。</p>
        <p>地圖和目錄是同一本書的索引貼。每一頁留下圖版、故事、短片，以及地址與時間。</p>
      </div>
      <p className="font-serif text-sm leading-7 text-ink-soft">
        最早的一頁寫於 {earliest}。現在收了 {published.length} 家，分布在 {districts} 個地區。
      </p>
    </article>
  );
}
