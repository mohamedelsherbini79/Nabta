"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export function GenerateReportButton({ patientProfileId }: { patientProfileId: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientProfileId }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(t("reports.error"));
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleGenerate} disabled={submitting} className="self-start">
        {submitting && <Spinner className="h-4 w-4" />}
        {submitting ? t("reports.generating") : t("reports.generate")}
      </Button>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
