"use client";

import Link from "next/link";
import { useAdmin } from "@/components/admin/admin-provider";

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
          <Link href="/map">地圖</Link>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-none">{children}</div>
    </div>
  );
}
