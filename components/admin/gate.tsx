"use client";

import Link from "next/link";
import { useState } from "react";
import { InkButton } from "@/components/admin/fields";
import { useArchive } from "@/lib/archive";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { ready, unlocked } = useArchive();
  if (!ready) return <div className="min-h-0 flex-1 bg-paper" />;
  if (!unlocked) return <LockScreen />;
  return children;
}

function LockScreen() {
  const { unlock } = useArchive();
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="bg-binding px-6 py-10 text-paper">
          <p className="font-editorial text-3xl italic">remarkeble</p>
          <p className="mt-3 text-[11px] tracking-[0.28em]">檔案室</p>
        </div>
        <form
          className="border border-t-0 border-line bg-paper px-6 py-6"
          onSubmit={(event) => {
            event.preventDefault();
            const ok = unlock(passphrase);
            setError(!ok);
          }}
        >
          <label className="block">
            <span className="text-[11px] tracking-[0.18em] text-ink-soft">試作密碼</span>
            <input
              type="password"
              autoComplete="off"
              value={passphrase}
              onChange={(event) => {
                setPassphrase(event.target.value);
                setError(false);
              }}
              className="mt-2 w-full border-b border-line bg-transparent py-2 outline-none focus:border-ink"
            />
          </label>
          <p className="mt-3 text-[12px] leading-5 text-ink-faint">
            試作門鎖，尚未接上帳戶。密碼 archive。
          </p>
          {error && <p className="mt-2 text-[12px] text-stamp">密碼不符</p>}
          <InkButton type="submit" className="mt-5 w-full">
            開啟
          </InkButton>
          <Link href="/" className="mt-4 block text-center text-[11px] tracking-[0.16em] text-ink-faint">
            返回藏書
          </Link>
        </form>
      </div>
    </div>
  );
}
