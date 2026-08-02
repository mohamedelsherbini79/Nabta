"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import type { ReminderChannel, ReminderSummary } from "@/types";

const CHANNEL_BADGE_CLASSES: Record<ReminderChannel, string> = {
  SMS: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  VOICE: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  PUSH: "border border-dashed border-amber-300 bg-transparent text-amber-700 dark:border-amber-800 dark:text-amber-400",
};

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
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-400">{t("reminders.empty")}</p>
      </div>
    );
  }

  const nowMs = new Date(now).getTime();

  return (
    <ul className="flex flex-col gap-3">
      {reminders.map((reminder) => {
        const isDue = reminder.active && reminder.scheduledFor !== null && new Date(reminder.scheduledFor).getTime() <= nowMs;

        return (
          <li
            key={reminder.id}
            className={`flex flex-col gap-2 rounded-xl border p-4 shadow-sm transition-colors ${
              reminder.active
                ? "border-zinc-200 bg-white hover:border-green-300 dark:border-zinc-800 dark:bg-zinc-900"
                : "border-zinc-200 bg-zinc-50 opacity-60 dark:border-zinc-800 dark:bg-zinc-950"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{reminder.label}</p>
                  {isDue && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950 dark:text-red-200">
                      {t("reminders.due")}
                    </span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CHANNEL_BADGE_CLASSES[reminder.channel]}`}>
                    {t(`reminders.channel.${reminder.channel.toLowerCase()}`)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {reminder.scheduledFor ? dateFormatter.format(new Date(reminder.scheduledFor)) : "—"} ·{" "}
                  {t(`reminders.type.${reminder.type.toLowerCase()}`)}
                  {reminder.recurrenceRule && reminder.recurrenceRule !== "NONE" && (
                    <> · {t(`reminders.recurrence.${reminder.recurrenceRule.toLowerCase()}`)}</>
                  )}
                </p>
                {reminder.locationLabel && <p className="text-xs text-zinc-400">{reminder.locationLabel}</p>}
                {reminder.channel === "PUSH" && (
                  <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">{t("reminders.channel.pushNote")}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => toggleActive(reminder)}
                  disabled={busyId === reminder.id}
                  className="!px-2.5 !py-1 text-xs"
                >
                  {reminder.active ? t("reminders.deactivate") : t("reminders.activate")}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => handleDelete(reminder.id)}
                  disabled={busyId === reminder.id}
                  className="!px-2.5 !py-1 text-xs"
                >
                  {t("reminders.delete")}
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
