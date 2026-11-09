"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, InkButton, fieldClass } from "@/components/admin/fields";
import { ARCHIVE_ROUTE } from "@/lib/routes";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="w-full max-w-sm space-y-5 rounded-2xl bg-white p-6 shadow-[0_14px_30px_-6px_rgba(0,0,0,0.12)]"
      onSubmit={(event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        void fetch("/api/archive-management/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password }),
        })
          .then(async (response) => {
            if (!response.ok) {
              const data = (await response.json().catch(() => null)) as { error?: string } | null;
              setError(data?.error || "電郵或密碼不正確。");
              setBusy(false);
              return;
            }
            router.replace(ARCHIVE_ROUTE);
            router.refresh();
          })
          .catch(() => {
            setError("現在連不上檔案室。");
            setBusy(false);
          });
      }}
    >
      <div>
        <h1 className="font-editorial text-[1.75rem] leading-none font-bold tracking-[-0.03em]">remarkeble</h1>
        <p className="mt-2 text-sm text-ink-soft">電郵可以隨便填。密碼正確就會成為管理員。</p>
      </div>
      <Field label="電郵">
        <input
          className={fieldClass}
          type="text"
          autoComplete="username"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </Field>
      <Field label="密碼">
        <input
          className={fieldClass}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </Field>
      {error ? <p className="text-sm text-stamp">{error}</p> : null}
      <InkButton type="submit" className="w-full" disabled={busy}>
        {busy ? "登入中" : "登入"}
      </InkButton>
      <Link href="/" className="block text-center text-sm text-ink-faint">
        返回
      </Link>
    </form>
  );
}
