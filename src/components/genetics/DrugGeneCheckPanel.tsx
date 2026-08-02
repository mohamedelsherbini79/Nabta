"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import type { DrugGeneCheckResult } from "@/types";

export function DrugGeneCheckPanel({ patientProfileId }: { patientProfileId: string }) {
  const { t } = useTranslation();

  const [drugName, setDrugName] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DrugGeneCheckResult | null>(null);

  async function handleCheck() {
    if (!drugName.trim()) return;
    setChecking(true);
    setError(null);
    setResult(null);

    const res = await fetch("/api/genetics/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientProfileId, input: { drugName: drugName.trim() } }),
    });

    setChecking(false);

    if (!res.ok) {
      setError(t("genetics.error"));
      return;
    }

    const data = await res.json();
    setResult(data.result);
  }

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{t("genetics.check.title")}</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("genetics.check.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            id="drugGeneCheck"
            label={t("genetics.check.drugLabel")}
            placeholder={t("genetics.check.drugPlaceholder")}
            value={drugName}
            onChange={(e) => setDrugName(e.target.value)}
          />
        </div>
        <Button onClick={handleCheck} disabled={checking || !drugName.trim()}>
          {checking && <Spinner className="h-4 w-4" />}
          {checking ? t("genetics.check.checking") : t("genetics.check.submit")}
        </Button>
      </div>

      {error && (
        <p className="flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </p>
      )}

      {result && (
        <div
          className={`flex flex-col gap-2 rounded-lg border px-3 py-3 text-sm ${
            result.safe
              ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200"
              : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
          }`}
        >
          <p className="font-medium">{result.summary}</p>
          {result.warnings.map((warning) => (
            <div key={warning.gene} className="text-xs">
              <p>
                <span className="font-medium">{warning.gene}</span> ({warning.phenotype}): {warning.message}
              </p>
              <p className="mt-0.5 opacity-90">{warning.recommendation}</p>
            </div>
          ))}
          <p className="text-xs italic opacity-75">{t("genetics.disclaimer")}</p>
        </div>
      )}
    </Card>
  );
}
