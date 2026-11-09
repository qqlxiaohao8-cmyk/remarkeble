import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminProvider } from "@/components/admin/admin-provider";
import { AdminShell } from "@/components/admin/admin-shell";
import { getSession } from "@/lib/server/current-admin";
import { ARCHIVE_ROUTE } from "@/lib/routes";

export const metadata: Metadata = {
  title: "檔案室",
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-0 flex-1 bg-paper" />}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}

async function Gate({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect(`${ARCHIVE_ROUTE}/login`);
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden bg-paper">
      <AdminProvider session={session}>
        <AdminShell>{children}</AdminShell>
      </AdminProvider>
    </div>
  );
}
