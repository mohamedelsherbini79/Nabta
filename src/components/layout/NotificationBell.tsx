"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";

interface Receipt {
  receiptId: string;
  title: string;
  body: string;
  createdAt: string;
}

export function NotificationBell() {
  const { t } = useTranslation();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [open, setOpen] = useState(false);

  function load() {
    fetch("/api/admin/notifications/receipts")
      .then((res) => res.json())
      .then((body) => setReceipts(body?.receipts ?? []))
      .catch(() => setReceipts([]));
  }

  useEffect(() => {
    const timeout = setTimeout(load, 0);
    return () => clearTimeout(timeout);
  }, []);

  async function handleMarkRead(receiptId: string) {
    setReceipts((prev) => prev.filter((r) => r.receiptId !== receiptId));
    await fetch("/api/admin/notifications/receipts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiptId }),
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("notifications.bell.label")}
        className="relative rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        🔔
        {receipts.length > 0 && (
          <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium text-white">
            {receipts.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 top-full z-10 mt-2 w-72 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          {receipts.length === 0 ? (
            <p className="p-2 text-sm text-zinc-400">{t("notifications.bell.empty")}</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {receipts.map((r) => (
                <li key={r.receiptId} className="rounded-lg p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{r.title}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{r.body}</p>
                  <button
                    type="button"
                    onClick={() => handleMarkRead(r.receiptId)}
                    className="mt-1 text-xs text-green-600 hover:underline dark:text-green-400"
                  >
                    {t("notifications.bell.markRead")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
