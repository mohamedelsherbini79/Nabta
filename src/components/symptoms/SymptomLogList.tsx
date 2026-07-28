"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import type { SymptomLogSummary } from "@/types";

export function SymptomLogList({ logs }: { logs: SymptomLogSummary[] }) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/symptoms/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) router.refresh();
  }

  if (logs.length === 0) {
    return <p className="text-sm text-zinc-400">{t("symptoms.list.empty")}</p>;
  }

  const sorted = [...logs].sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());

  return (
    <ul className="flex flex-col gap-3">
      {sorted.map((log) => (
        <li
          key={log.id}
          className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                {log.severity}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {dateFormatter.format(new Date(log.loggedAt))}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(log.id)}
              disabled={deletingId === log.id}
              className="text-xs text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
            >
              {deletingId === log.id ? t("symptoms.list.deleting") : t("symptoms.list.delete")}
            </button>
          </div>

          {log.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {log.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {log.note && <p className="text-sm text-zinc-700 dark:text-zinc-300">{log.note}</p>}

          {log.medications.length > 0 && (
            <p className="text-xs text-zinc-400">
              {t("symptoms.list.medications")}: {log.medications.join(", ")}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
