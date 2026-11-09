"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/admin-provider";
import { Field, InkButton, QuietButton, fieldClass } from "@/components/admin/fields";

type AdminAccount = {
  id: string;
  email: string;
  name: string;
  role: "super" | "admin";
  createdAt: string;
};

export function AdminUsers() {
  const { session } = useAdmin();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [actorId, setActorId] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "super">("admin");
  const [busy, setBusy] = useState(false);
  const superUser = session.role === "super";

  useEffect(() => {
    let cancel = false;
    void fetch("/api/archive-management/admins", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json().catch(() => null)) as { admins?: AdminAccount[]; actorId?: string; error?: string } | null;
        if (cancel) return;
        if (!response.ok || !data?.admins) {
          setError(data?.error || "未能讀取帳戶。");
          return;
        }
        setAdmins(data.admins);
        setActorId(data.actorId || "");
        setReady(true);
      })
      .catch(() => {
        if (!cancel) setError("未能讀取帳戶。");
      });
    return () => {
      cancel = true;
    };
  }, []);

  if (!ready && !error) return <p className="px-4 py-10 text-sm text-ink-soft">讀取帳戶…</p>;

  return (
    <div className="mx-auto max-w-xl px-4 py-5">
      <h2 className="font-serif text-3xl">帳戶</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">
        {superUser ? "主管可以新增或移除管理員。管理員不能更改帳戶。" : "你是管理員，可以處理餐廳，不能更改帳戶。"}
      </p>
      {error ? <p className="mt-3 text-sm text-stamp">{error}</p> : null}
      <ul className="mt-5">
        {admins.map((admin) => (
          <li key={admin.id} className="flex items-center justify-between gap-3 border-b border-line py-3">
            <span className="min-w-0">
              <span className="block truncate font-serif text-lg">{admin.name}</span>
              <span className="block truncate text-[12px] text-ink-soft">
                {admin.email} · {admin.role === "super" ? "主管" : "管理員"}
              </span>
            </span>
            {superUser && admin.id !== actorId ? (
              <QuietButton
                className="shrink-0 rounded-2xl px-3 py-2 text-stamp"
                onClick={() => {
                  const confirmed = window.confirm(`移除「${admin.name}」的檔案室權限？`);
                  if (!confirmed) return;
                  setError("");
                  void fetch(`/api/archive-management/admins/${admin.id}`, { method: "DELETE" })
                    .then(async (response) => {
                      const data = (await response.json().catch(() => null)) as { admins?: AdminAccount[]; error?: string } | null;
                      if (!response.ok || !data?.admins) {
                        setError(data?.error || "未能移除。");
                        return;
                      }
                      setAdmins(data.admins);
                      setStatus("已移除。");
                    });
                }}
              >
                移除
              </QuietButton>
            ) : null}
          </li>
        ))}
      </ul>
      {superUser ? (
        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            setStatus("");
            void fetch("/api/archive-management/admins", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ email, name, password, role }),
            })
              .then(async (response) => {
                const data = (await response.json().catch(() => null)) as { admins?: AdminAccount[]; error?: string } | null;
                if (!response.ok || !data?.admins) {
                  setError(data?.error || "未能新增。");
                  return;
                }
                setAdmins(data.admins);
                setEmail("");
                setName("");
                setPassword("");
                setRole("admin");
                setStatus("已新增帳戶。");
              })
              .finally(() => setBusy(false));
          }}
        >
          <h3 className="font-serif text-2xl">新增帳戶</h3>
          <Field label="電郵">
            <input className={fieldClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </Field>
          <Field label="名稱">
            <input className={fieldClass} value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field label="密碼">
            <input className={fieldClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={10} />
          </Field>
          <Field label="角色">
            <select className={fieldClass} value={role} onChange={(event) => setRole(event.target.value === "super" ? "super" : "admin")}>
              <option value="admin">管理員</option>
              <option value="super">主管</option>
            </select>
          </Field>
          {status ? <p className="text-sm text-ink-soft">{status}</p> : null}
          <InkButton type="submit" disabled={busy}>
            {busy ? "新增中" : "新增帳戶"}
          </InkButton>
        </form>
      ) : null}
    </div>
  );
}
