"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { TagListInput } from "@/components/ui/TagListInput";

export function SymptomLogForm({ patientProfileId }: { patientProfileId: string }) {
  const { t } = useTranslation();
  const router = useRouter();

  const [severity, setSeverity] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/symptoms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientProfileId,
        input: { severity, tags, note: note.trim() || null },
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(t("symptoms.error"));
      return;
    }

    setTags([]);
    setNote("");
    setSeverity(5);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="severity" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("symptoms.severityLabel")}
          </label>
          <span className="text-lg font-semibold text-green-600 dark:text-green-400">{severity}</span>
        </div>
        <input
          id="severity"
          type="range"
          min={1}
          max={10}
          value={severity}
          onChange={(e) => setSeverity(Number(e.target.value))}
          className="mt-2 w-full accent-green-600"
        />
        <div className="mt-1 flex justify-between text-xs text-zinc-400">
          <span>{t("symptoms.severityLow")}</span>
          <span>{t("symptoms.severityHigh")}</span>
        </div>
      </div>

      <TagListInput
        label={t("symptoms.tagsLabel")}
        value={tags}
        onChange={setTags}
        placeholder={t("symptoms.tagsPlaceholder")}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="note" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("symptoms.noteLabel")}
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Button onClick={handleSubmit} disabled={submitting} className="self-start">
        {submitting && <Spinner className="h-4 w-4" />}
        {submitting ? t("symptoms.submitting") : t("symptoms.submit")}
      </Button>
    </div>
  );
}
