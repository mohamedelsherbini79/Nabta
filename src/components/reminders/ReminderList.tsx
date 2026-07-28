"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import type { ReminderSummary } from "@/types";

export function ReminderList({ reminders, now }: { reminders: ReminderSummary[]; now: string }) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  async function toggleActive(reminder: ReminderSummary) {
    setBusyId(reminder.id);
    const res = await fetch(`/api/reminders/${reminder.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !reminder.active }),
    });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  if (reminders.length === 0) {
    return <p className="text-sm text-zinc-400">{t("reminders.empty")}</p>;
  }

  const nowMs = new Date(now).getTime();

  return (
    <ul className="flex flex-col gap-3">
      {reminders.map((reminder) => {
        const isDue = reminder.active && reminder.scheduledFor !== null && new Date(reminder.scheduledFor).getTime() <= nowMs;

        return (
          <li
            key={reminder.id}
            className={`flex flex-col gap-2 rounded-xl border p-4 ${
              reminder.active
                ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                : "border-zinc-200 bg-zinc-50 opacity-60 dark:border-zinc-800 dark:bg-zinc-950"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{reminder.label}</p>
                  {isDue && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950 dark:text-red-200">
                      {t("reminders.due")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {reminder.scheduledFor ? dateFormatter.format(new Date(reminder.scheduledFor)) : "—"} ·{" "}
                  {t(`reminders.type.${reminder.type.toLowerCase()}`)}
                  {reminder.recurrenceRule && reminder.recurrenceRule !== "NONE" && (
                    <> · {t(`reminders.recurrence.${reminder.recurrenceRule.toLowerCase()}`)}</>
                  )}
                  {" · "}
                  {t(`reminders.channel.${reminder.channel.toLowerCase()}`)}
                </p>
                {reminder.locationLabel && <p className="text-xs text-zinc-400">{reminder.locationLabel}</p>}
              </div>
              <div className="flex shrink-0 gap-3">
                <button
                  type="button"
                  onClick={() => toggleActive(reminder)}
                  disabled={busyId === reminder.id}
                  className="text-xs text-teal-600 hover:underline disabled:opacity-50 dark:text-teal-400"
                >
                  {reminder.active ? t("reminders.deactivate") : t("reminders.activate")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(reminder.id)}
                  disabled={busyId === reminder.id}
                  className="text-xs text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                >
                  {t("reminders.delete")}
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
