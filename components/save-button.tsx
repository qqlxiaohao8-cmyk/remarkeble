"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { BookmarkIcon } from "@/components/icons";
import { useArchive } from "@/lib/archive";
import { cn } from "@/lib/cn";

export function SaveButton({ id, compact = false }: { id: string; compact?: boolean }) {
  const { ready, isSaved, toggleSaved } = useArchive();
  const saved = ready && isSaved(id);
  const [pulse, setPulse] = useState(0);
  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={() => {
        toggleSaved(id);
        setPulse((value) => value + 1);
      }}
      className={cn(
        "inline-flex items-center gap-2 active:opacity-70",
        compact ? "p-1" : "rounded-full border border-paper-deep bg-white px-4 py-2 text-xs font-medium",
        saved ? "text-stamp" : "text-taupe",
      )}
    >
      <motion.span
        key={pulse}
        initial={false}
        animate={pulse === 0 ? undefined : { y: [0, -6, 0], scale: [1, 0.86, 1], rotate: [0, -8, 0] }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="inline-flex"
      >
        <BookmarkIcon className="h-[18px] w-[18px]" />
      </motion.span>
      {compact ? <span className="sr-only">{saved ? "已蓋印典藏" : "典藏加入印記"}</span> : saved ? "已蓋印典藏" : "典藏加入印記"}
    </button>
  );
}
