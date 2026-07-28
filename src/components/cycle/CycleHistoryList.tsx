"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import type { CycleEntrySummary } from "@/types";

export function CycleHistoryList({ entries }: { entries: CycleEntrySummary[] }) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const dateFormatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });

  async function handleMarkEnded(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/cycle/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endDate: new Date().toISOString() }),
    });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/cycle/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  if (entries.length === 0) {
    return <p className="text-sm text-zinc-400">{t("cycle.history.empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {dateFormatter.format(new Date(entry.startDate))} –{" "}
                {entry.endDate ? dateFormatter.format(new Date(entry.endDate)) : t("cycle.history.ongoing")}
              </p>
              {entry.flow && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{t(`cycle.flow.${entry.flow.toLowerCase()}`)}</p>
              )}
            </div>
            <div className="flex shrink-0 gap-3">
              {!entry.endDate && (
                <button
                  type="button"
                  onClick={() => handleMarkEnded(entry.id)}
                  disabled={busyId === entry.id}
                  className="text-xs text-teal-600 hover:underline disabled:opacity-50 dark:text-teal-400"
                >
                  {t("cycle.history.markEnded")}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(entry.id)}
                disabled={busyId === entry.id}
                className="text-xs text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
              >
                {t("cycle.history.delete")}
              </button>
            </div>
          </div>

          {entry.symptoms.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entry.symptoms.map((symptom) => (
                <span
                  key={symptom}
                  className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {symptom}
                </span>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
