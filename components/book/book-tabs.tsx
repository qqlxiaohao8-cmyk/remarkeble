"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { MapIcon, NoteIcon, TocIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/map", label: "地圖", icon: MapIcon },
  { href: "/directory", label: "目錄", icon: TocIcon },
  { href: "/about", label: "關於", icon: NoteIcon },
] as const;

function selected(href: string, path: string) {
  if (href === "/map") return path === "/map";
  return path === href || path.startsWith(`${href}/`);
}

export function BookTabs({ path }: { path: string }) {
  const reduce = useReducedMotion();

  return (
    <nav
      className="absolute top-1/2 right-2 z-30 flex -translate-y-1/2 translate-x-3 flex-col gap-4"
      aria-label="索引"
    >
      {TABS.map((tab) => {
        const active = selected(tab.href, path);
        const Icon = tab.icon;
        return (
          <Link key={tab.href} href={tab.href} aria-current={active ? "page" : undefined} className="relative block">
            <motion.span
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-r-2xl border-y border-r border-black/10 px-1.5 py-3 text-xs font-semibold shadow-[2px_0_0_#d1d1d6,0_12px_24px_-16px_rgba(0,0,0,0.2)]",
                active ? "bg-accent text-white" : "bg-paper text-ink",
              )}
              style={{ writingMode: "vertical-rl" }}
              animate={{ x: active ? 6 : 0 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              transition={reduce ? { duration: 0.15 } : { type: "spring", bounce: 0, duration: 0.35 }}
            >
              <Icon className="h-3.5 w-3.5" style={{ writingMode: "horizontal-tb" }} />
              {tab.label}
            </motion.span>
          </Link>
        );
      })}
    </nav>
  );
}
