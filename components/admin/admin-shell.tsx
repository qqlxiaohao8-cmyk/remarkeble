"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { useAdmin } from "@/components/admin/admin-provider";
import { ARCHIVE_ROUTE } from "@/lib/routes";
import { cn } from "@/lib/cn";

const NAV = [
  { href: ARCHIVE_ROUTE, label: "概覽" },
  { href: `${ARCHIVE_ROUTE}/restaurants`, label: "餐廳" },
  { href: `${ARCHIVE_ROUTE}/restaurants/new`, label: "入藏" },
  { href: `${ARCHIVE_ROUTE}/media`, label: "圖版" },
  { href: `${ARCHIVE_ROUTE}/verification`, label: "核實" },
  { href: `${ARCHIVE_ROUTE}/publication`, label: "出版" },
  { href: `${ARCHIVE_ROUTE}/admins`, label: "帳戶" },
];

function active(href: string, path: string) {
  if (href === ARCHIVE_ROUTE) return path === ARCHIVE_ROUTE;
  if (href === `${ARCHIVE_ROUTE}/restaurants`) {
    return path === `${ARCHIVE_ROUTE}/restaurants` || new RegExp(`^${ARCHIVE_ROUTE}/restaurants/(?!new$)[^/]+$`).test(path);
  }
  return path === href || path.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { session, logout } = useAdmin();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl leading-none">檔案室</h1>
          <p className="mt-1 truncate text-xs text-ink-faint">{session.email}</p>
        </div>
        <div className="flex shrink-0 items-center gap-4 text-sm text-ink-soft">
          <button type="button" onClick={() => void logout()}>
            登出
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
                  "block rounded-full px-3 py-1.5 text-[12px] font-medium",
                  selected ? "bg-accent text-white" : "text-ink-soft",
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
