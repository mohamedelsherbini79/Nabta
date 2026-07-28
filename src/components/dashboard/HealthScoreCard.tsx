"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { Card } from "@/components/ui/Card";
import type { HealthScoreBreakdown } from "@/lib/healthScore";

const BREAKDOWN_KEYS: { key: keyof HealthScoreBreakdown; labelKey: string }[] = [
  { key: "adherence", labelKey: "healthScore.breakdown.adherence" },
  { key: "assessment", labelKey: "healthScore.breakdown.assessment" },
  { key: "vitals", labelKey: "healthScore.breakdown.vitals" },
  { key: "activity", labelKey: "healthScore.breakdown.activity" },
];

function scoreColor(score: number): string {
  if (score >= 75) return "text-teal-600 dark:text-teal-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function HealthScoreCard({
  score,
  breakdown,
}: {
  score: number;
  breakdown: HealthScoreBreakdown;
}) {
  const { t } = useTranslation();

  return (
    <Card>
      <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t("healthScore.title")}</h2>
      <p className={`mt-1 text-4xl font-semibold ${scoreColor(score)}`}>{score}</p>
      <div className="mt-4 flex flex-col gap-2.5">
        {BREAKDOWN_KEYS.map(({ key, labelKey }) => (
          <div key={key}>
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>{t(labelKey)}</span>
              <span>{breakdown[key]}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-teal-500"
                style={{ width: `${breakdown[key]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
