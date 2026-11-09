"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { BookTabs } from "@/components/book/book-tabs";
import { cn } from "@/lib/cn";

export function BookShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const reduce = useReducedMotion();
  const map = path === "/map";

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col bg-paper">
      <header className="z-30 px-6 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3">
        <h1 className="font-editorial text-[1.75rem] leading-none font-bold tracking-[-0.03em]">remarkeble</h1>
      </header>
      <main className="relative flex min-h-0 flex-1 flex-col px-5 pt-1 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="notebook relative min-h-0 flex-1">
          <div className="notebook-board" aria-hidden />
          <div className="notebook-spine" aria-hidden />
          <div className="notebook-rings" aria-hidden />
          <div className="notebook-under notebook-under-b" aria-hidden />
          <div className="notebook-under notebook-under-a" aria-hidden />
          <div className="notebook-sheet">
            <div className="notebook-gutter" aria-hidden />
            <div className="relative h-full">
              <AnimatePresence initial={false}>
                <motion.div
                  key={path}
                  className={cn("absolute inset-0", map ? "overflow-hidden" : "overflow-y-auto scroll-thin")}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, pointerEvents: "auto" }}
                  exit={{ opacity: 0, pointerEvents: "none" }}
                  transition={reduce ? { duration: 0.2 } : { type: "spring", bounce: 0, duration: 0.35 }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <BookTabs path={path} />
        </div>
      </main>
    </div>
  );
}
