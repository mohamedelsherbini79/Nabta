"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export function PregnancyStartForm({ patientProfileId }: { patientProfileId: string }) {
  const { t } = useTranslation();
  const router = useRouter();

  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!lastPeriodDate) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/pregnancy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientProfileId,
        input: { lastPeriodDate: new Date(lastPeriodDate).toISOString(), notes: notes.trim() || null },
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      if (res.status === 409) {
        // Another request already started tracking (e.g. a second tab) —
        // just show the resulting pregnancy instead of an error.
        router.refresh();
        return;
      }
      setError(t("pregnancy.error"));
      return;
    }

    router.refresh();
  }

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{t("pregnancy.start.title")}</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("pregnancy.start.subtitle")}</p>
      </div>

      <Input
        id="lastPeriodDate"
        type="date"
        label={t("pregnancy.start.lastPeriodLabel")}
        value={lastPeriodDate}
        onChange={(e) => setLastPeriodDate(e.target.value)}
      />

      <Input
        id="pregnancyStartNotes"
        label={t("pregnancy.notesLabel")}
        placeholder={t("pregnancy.start.notesPlaceholder")}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {error && (
        <p className="flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </p>
      )}

      <Button onClick={handleSubmit} disabled={submitting || !lastPeriodDate} className="self-start">
        {submitting && <Spinner className="h-4 w-4" />}
        {submitting ? t("pregnancy.start.submitting") : t("pregnancy.start.submit")}
      </Button>
    </Card>
  );
}
