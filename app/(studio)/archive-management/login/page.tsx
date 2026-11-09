import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getSession } from "@/lib/server/current-admin";
import { ARCHIVE_ROUTE } from "@/lib/routes";

export const metadata: Metadata = {
  title: "登入",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-0 flex-1 bg-paper" />}>
      <LoginGate />
    </Suspense>
  );
}

async function LoginGate() {
  const session = await getSession();
  if (session) redirect(ARCHIVE_ROUTE);
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-6">
      <LoginForm />
    </div>
  );
}
