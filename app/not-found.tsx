import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <h1 className="font-serif text-3xl font-bold">這一頁是空白</h1>
      <p className="mt-3 max-w-xs font-serif text-sm leading-7 text-ink-soft">目錄裡沒有這個位址。</p>
      <Link href="/" className="mt-8 text-sm font-medium text-accent">
        返回藏書
      </Link>
    </div>
  );
}
