"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { MOOD_OPTIONS } from "@/lib/moodConstants";
import type { MoodLevel } from "@/types";

export function MoodEntryForm({ patientProfileId }: { patientProfileId: string }) {
  const { t } = useTranslation();
  const router = useRouter();

  const [mood, setMood] = useState<MoodLevel>("NEUTRAL");
  const [sleepHours, setSleepHours] = useState("");
  const [stressLevel, setStressLevel] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/mental-health", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientProfileId,
        input: {
          mood,
          sleepHours: sleepHours ? Number(sleepHours) : null,
          stressLevel: stressLevel ? Number(stressLevel) : null,
          note: note.trim() || null,
        },
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(t("mentalHealth.error"));
      return;
    }

    setSleepHours("");
    setStressLevel("");
    setNote("");
    setMood("NEUTRAL");
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 3000);
    router.refresh();
  }

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{t("mentalHealth.form.title")}</h2>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("mentalHealth.moodLabel")}</label>
        <div className="flex gap-2">
          {MOOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMood(option.value)}
              aria-label={t(`mentalHealth.mood.${option.value.toLowerCase()}`)}
              className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-colors ${
                mood === option.value
                  ? "bg-green-600 ring-2 ring-green-300"
                  : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              }`}
            >
              {option.emoji}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t(`mentalHealth.mood.${mood.toLowerCase()}`)}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          id="sleepHours"
          type="number"
          min={0}
          max={24}
          step={0.5}
          label={t("mentalHealth.sleepLabel")}
          value={sleepHours}
          onChange={(e) => setSleepHours(e.target.value)}
        />
        <Input
          id="stressLevel"
          type="number"
          min={1}
          max={10}
          label={t("mentalHealth.stressLabel")}
          value={stressLevel}
          onChange={(e) => setStressLevel(e.target.value)}
        />
      </div>

      <Input
        id="moodNote"
        label={t("mentalHealth.noteLabel")}
        placeholder={t("mentalHealth.notePlaceholder")}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      {error && (
        <p className="flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting && <Spinner className="h-4 w-4" />}
          {submitting ? t("mentalHealth.submitting") : t("mentalHealth.submit")}
        </Button>
        {justAdded && <span className="text-sm text-green-600 dark:text-green-400">{t("mentalHealth.success")}</span>}
      </div>
    </Card>
  );
}
