"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { Card } from "@/components/ui/Card";
import type { BmiCategory } from "@/lib/bmi";

const CATEGORY_CLASSES: Record<BmiCategory, string> = {
  UNDERWEIGHT: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  NORMAL: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  OVERWEIGHT: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  OBESE: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
};

const CATEGORY_KEYS: Record<BmiCategory, string> = {
  UNDERWEIGHT: "healthScore.bmi.underweight",
  NORMAL: "healthScore.bmi.normal",
  OVERWEIGHT: "healthScore.bmi.overweight",
  OBESE: "healthScore.bmi.obese",
};

export function BmiSummaryCard({
  bmi,
  category,
}: {
  bmi: number | null;
  category: BmiCategory | null;
}) {
  const { t } = useTranslation();

  return (
    <Card>
      <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t("healthScore.bmi.title")}</h2>
      {bmi === null || category === null ? (
        <p className="mt-2 text-sm text-zinc-400">{t("healthScore.bmi.empty")}</p>
      ) : (
        <div className="mt-1 flex items-center gap-3">
          <p className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{bmi}</p>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${CATEGORY_CLASSES[category]}`}>
            {t(CATEGORY_KEYS[category])}
          </span>
        </div>
      )}
    </Card>
  );
}
