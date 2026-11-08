"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookIcon, MapIcon, TocIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/", label: "藏書", icon: BookIcon },
  { href: "/map", label: "地圖", icon: MapIcon },
  { href: "/directory", label: "目錄", icon: TocIcon },
] as const;

function isActive(href: string, path: string) {
  if (href === "/") return path === "/" || path.startsWith("/restaurant");
  return path === href || path.startsWith(`${href}/`);
}

export function TabBar() {
  const path = usePathname();
  return (
    <nav
      className="shrink-0 border-t border-line bg-paper/85 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="主要"
    >
      <ul className="grid grid-cols-3">
        {TABS.map((tab) => {
          const active = isActive(tab.href, path);
          const Icon = tab.icon;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2",
                  active ? "text-ink" : "text-ink-faint",
                )}
              >
                <Icon className="h-[22px] w-[22px]" />
                <span className={cn("text-[10px] tracking-[0.14em]", active && "border-b border-ink")}>
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
