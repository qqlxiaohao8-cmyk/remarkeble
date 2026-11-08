import type { RegionId } from "@/lib/districts";
import { cn } from "@/lib/cn";

const TABS: Array<{ id: RegionId | "all"; label: string; cloth: string }> = [
  { id: "all", label: "全冊", cloth: "#241f1c" },
  { id: "hk", label: "港島", cloth: "#6d5344" },
  { id: "kln", label: "九龍", cloth: "#3e5160" },
  { id: "nt", label: "新界", cloth: "#3e5346" },
  { id: "islands", label: "離島", cloth: "#5c4e68" },
];

export function IndexTabs({
  active,
  onChange,
}: {
  active: RegionId | "all";
  onChange: (id: RegionId | "all") => void;
}) {
  return (
    <div className="absolute bottom-6 right-0 top-6 z-20 flex flex-col justify-center gap-1.5">
      {TABS.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex h-14 items-center justify-center rounded-r-2xl text-[11px] tracking-[0.18em] transition-[width,background-color] duration-300",
              selected ? "w-8 bg-sheet text-ink" : "w-6 text-paper",
            )}
            style={{
              writingMode: "vertical-rl",
              background: selected ? undefined : tab.cloth,
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
