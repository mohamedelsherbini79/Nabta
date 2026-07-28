"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { TagListInput } from "@/components/ui/TagListInput";

const FLOW_OPTIONS = ["LIGHT", "MEDIUM", "HEAVY"] as const;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CycleLogForm({ patientProfileId }: { patientProfileId: string }) {
  const { t } = useTranslation();
  const router = useRouter();

  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState("");
  const [flow, setFlow] = useState<(typeof FLOW_OPTIONS)[number] | "">("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/cycle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientProfileId,
        input: {
          startDate,
          endDate: endDate || null,
          flow: flow || null,
          symptoms,
        },
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(t("cycle.error"));
      return;
    }

    setStartDate(today());
    setEndDate("");
    setFlow("");
    setSymptoms([]);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          id="cycleStartDate"
          type="date"
          label={t("cycle.startDateLabel")}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          id="cycleEndDate"
          type="date"
          label={t("cycle.endDateLabel")}
          value={endDate}
          min={startDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("cycle.flowLabel")}</label>
          <select
            value={flow}
            onChange={(e) => setFlow(e.target.value as typeof flow)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">—</option>
            {FLOW_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`cycle.flow.${option.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <TagListInput
        label={t("cycle.symptomsLabel")}
        value={symptoms}
        onChange={setSymptoms}
        placeholder={t("assessment.addPlaceholder")}
      />

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Button onClick={handleSubmit} disabled={submitting || !startDate} className="self-start">
        {submitting && <Spinner className="h-4 w-4" />}
        {submitting ? t("cycle.submitting") : t("cycle.submit")}
      </Button>
    </div>
  );
}
