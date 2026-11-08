"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { useArchive } from "@/lib/archive";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "概覽" },
  { href: "/admin/restaurants", label: "餐廳" },
  { href: "/admin/restaurants/new", label: "入藏" },
  { href: "/admin/media", label: "圖版" },
  { href: "/admin/verification", label: "核實" },
  { href: "/admin/publication", label: "出版" },
];

function active(href: string, path: string) {
  if (href === "/admin") return path === "/admin";
  if (href === "/admin/restaurants") {
    return path === "/admin/restaurants" || /^\/admin\/restaurants\/(?!new$)[^/]+$/.test(path);
  }
  return path === href || path.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { lock } = useArchive();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <div>
          <p className="text-[10px] tracking-[0.22em] text-ink-faint">ARCHIVE ROOM</p>
          <h1 className="font-serif text-2xl leading-none">檔案室</h1>
        </div>
        <div className="flex items-center gap-4 text-[11px] tracking-[0.14em] text-ink-soft">
          <button type="button" onClick={lock}>
            鎖上
          </button>
          <Link href="/">藏書</Link>
        </div>
      </header>
      <Suspense fallback={<div className="h-10 shrink-0 border-y border-line" />}>
        <AdminNav />
      </Suspense>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-none">{children}</div>
    </div>
  );
}

function AdminNav() {
  const path = usePathname();
  return (
    <nav className="shrink-0 border-y border-line" aria-label="檔案室">
      <ul className="scroll-thin flex gap-1 overflow-x-auto px-3 py-2">
        {NAV.map((item) => {
          const selected = active(item.href, path);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "block px-3 py-1.5 text-[12px] tracking-[0.14em]",
                  selected ? "rounded-full bg-accent text-white" : "text-ink-soft",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
