import { Suspense } from "react";
import { BookShell } from "@/components/book/book-shell";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-0 flex-1">
      <Suspense fallback={<div className="h-full bg-white" />}>
        <BookShell>{children}</BookShell>
      </Suspense>
    </div>
  );
}
