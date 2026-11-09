"use client";

import { useState } from "react";
import { QuietButton } from "@/components/admin/fields";
import { useAdmin } from "@/components/admin/admin-provider";

export function DeleteRestaurant({
  id,
  name,
  onDeleted,
}: {
  id: string;
  name: string;
  onDeleted?: () => void;
}) {
  const { removeRestaurant } = useAdmin();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <>
      <QuietButton
        className="px-3 py-2 text-stamp"
        onClick={() => {
          setError("");
          setOpen(true);
        }}
      >
        刪除
      </QuietButton>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-[0_22px_44px_-18px_rgba(0,0,0,0.28)]">
            <h3 className="font-serif text-2xl">刪除「{name}」</h3>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              這一頁會從檔案和公開藏書裡移除。只屬於這間餐廳的圖片也會一併刪除，其他餐廳不受影響。
            </p>
            {error ? <p className="mt-3 text-sm text-stamp">{error}</p> : null}
            <div className="mt-5 flex gap-3">
              <QuietButton className="flex-1" disabled={busy} onClick={() => setOpen(false)}>
                取消
              </QuietButton>
              <QuietButton
                className="flex-1 text-stamp"
                disabled={busy}
                onClick={() => {
                  setBusy(true);
                  void removeRestaurant(id)
                    .then(() => {
                      setOpen(false);
                      onDeleted?.();
                    })
                    .catch((reason: unknown) => {
                      setError(reason instanceof Error ? reason.message : "未能刪除。");
                      setBusy(false);
                    });
                }}
              >
                {busy ? "刪除中" : "確認刪除"}
              </QuietButton>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
