"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { Card } from "@/components/ui/Card";
import type { DrugGeneWarning } from "@/types";

export function GeneticInsightsCard({ insights }: { insights: DrugGeneWarning[] }) {
  const { t } = useTranslation();

  if (insights.length === 0) {
    return (
      <Card>
        <h2 className="mb-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">{t("genetics.insights.title")}</h2>
        <p className="text-sm text-zinc-400">{t("genetics.insights.empty")}</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{t("genetics.insights.title")}</h2>
      <ul className="flex flex-col gap-2">
        {insights.map((insight) => (
          <li
            key={insight.gene}
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
          >
            <p className="font-medium">
              {insight.gene} — {insight.phenotype}
            </p>
            <p className="mt-0.5">{insight.message}</p>
            <p className="mt-0.5 opacity-90">{insight.recommendation}</p>
          </li>
        ))}
      </ul>
      <p className="text-xs italic text-zinc-500 dark:text-zinc-400">{t("genetics.disclaimer")}</p>
    </Card>
  );
}
