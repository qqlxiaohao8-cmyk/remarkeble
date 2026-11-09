"use client";

import Link from "next/link";

const TABS = [
  { href: "/map", label: "地圖" },
  { href: "/directory", label: "目錄" },
  { href: "/about", label: "關於" },
] as const;

function selected(href: string, path: string) {
  if (href === "/map") return path === "/map";
  return path === href || path.startsWith(`${href}/`);
}

const LAYERS = [
  { z: 20, width: 42, background: "#ffffff" },
  { z: 4, width: 32, background: "#ececef" },
  { z: 3, width: 28, background: "#dedee3" },
] as const;

export function BookTabs({ path }: { path: string }) {
  const activeIndex = TABS.findIndex((tab) => selected(tab.href, path));
  let behind = 0;
  const depth = TABS.map((_, index) => (index === activeIndex ? 0 : Math.min(++behind, 2)));

  return (
    <nav className="pointer-events-none absolute inset-0" aria-label="索引">
      {TABS.map((tab, index) => {
        const layer = LAYERS[depth[index]];
        const active = index === activeIndex;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className="pointer-events-auto absolute flex items-center justify-center border-y border-r border-black/10 text-[11px] font-semibold text-ink transition-[width] duration-200 ease-out motion-reduce:transition-none"
            style={{
              writingMode: "vertical-rl",
              top: `${20 + index * 15}%`,
              left: "calc(100% - 22px)",
              zIndex: layer.z,
              height: 76,
              width: layer.width,
              background: layer.background,
              borderRadius: "0 22px 22px 0",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
