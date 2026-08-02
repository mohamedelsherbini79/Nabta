"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { TRIMESTER_BADGE_CLASSES } from "@/lib/pregnancyWeeks";
import { PregnancyWeekBar } from "@/components/pregnancy/PregnancyWeekBar";
import type { PregnancySummary } from "@/types";

export function PregnancyProgressCard({ pregnancy }: { pregnancy: PregnancySummary }) {
  const { t, locale } = useTranslation();
  const router = useRouter();

  const [notes, setNotes] = useState(pregnancy.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  const dateFormatter = new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" });

  async function saveNotes() {
    setSaving(true);
    const res = await fetch(`/api/pregnancy/${pregnancy.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notes.trim() || null }),
    });
    setSaving(false);
    if (res.ok) router.refresh();
  }

  async function markComplete() {
    setBusy(true);
    const res = await fetch(`/api/pregnancy/${pregnancy.id}/complete`, { method: "POST" });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  async function handleDelete() {
    setBusy(true);
    const res = await fetch(`/api/pregnancy/${pregnancy.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            {t("pregnancy.week")} {pregnancy.currentWeek} · {t("pregnancy.day")} {pregnancy.currentDay}
          </p>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{pregnancy.babySize}</h2>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${TRIMESTER_BADGE_CLASSES[pregnancy.trimester]}`}
        >
          {t(`pregnancy.trimester.${pregnancy.trimester}`)}
        </span>
      </div>

      <PregnancyWeekBar currentWeek={pregnancy.currentWeek} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("pregnancy.dueDate")}</p>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            {dateFormatter.format(new Date(pregnancy.dueDate))}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("pregnancy.daysUntilDue")}</p>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{pregnancy.daysUntilDue}</p>
        </div>
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100">
        <p className="text-xs font-medium uppercase tracking-wide opacity-75">{t("pregnancy.tip.title")}</p>
        <p className="mt-0.5">{pregnancy.tip}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("pregnancy.notesLabel")}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <Button onClick={saveNotes} disabled={saving} variant="secondary" className="self-start !px-3 !py-1.5 text-xs">
          {saving && <Spinner className="h-3.5 w-3.5" />}
          {t("pregnancy.saveNotes")}
        </Button>
      </div>

      <p className="text-xs italic text-zinc-500 dark:text-zinc-400">{t("pregnancy.disclaimer")}</p>

      <div className="flex items-center gap-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
        <Button type="button" variant="secondary" onClick={markComplete} disabled={busy} className="!px-3 !py-1.5 text-xs">
          {t("pregnancy.markComplete")}
        </Button>
        <Button type="button" variant="danger" onClick={handleDelete} disabled={busy} className="!px-3 !py-1.5 text-xs">
          {t("pregnancy.delete")}
        </Button>
      </div>
    </Card>
  );
}
