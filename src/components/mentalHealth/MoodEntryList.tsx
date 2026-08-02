"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import { MOOD_EMOJI } from "@/lib/moodConstants";
import type { MoodEntrySummary } from "@/types";

export function MoodEntryList({ entries }: { entries: MoodEntrySummary[] }) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const dateFormatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  async function handleDelete(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/mental-health/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-400">{t("mentalHealth.empty")}</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">
              {MOOD_EMOJI[entry.mood]}
            </span>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {t(`mentalHealth.mood.${entry.mood.toLowerCase()}`)}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {dateFormatter.format(new Date(entry.loggedAt))}
                {entry.sleepHours !== null && ` · ${t("mentalHealth.sleepShort")}: ${entry.sleepHours}h`}
                {entry.stressLevel !== null && ` · ${t("mentalHealth.stressShort")}: ${entry.stressLevel}/10`}
              </p>
              {entry.note && <p className="mt-0.5 text-xs text-zinc-400">{entry.note}</p>}
            </div>
          </div>
          <Button
            type="button"
            variant="danger"
            onClick={() => handleDelete(entry.id)}
            disabled={busyId === entry.id}
            className="!px-2.5 !py-1 text-xs"
          >
            {t("mentalHealth.delete")}
          </Button>
        </li>
      ))}
    </ul>
  );
}
