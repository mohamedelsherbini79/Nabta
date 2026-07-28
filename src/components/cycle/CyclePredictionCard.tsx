"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { Card } from "@/components/ui/Card";
import type { CyclePrediction } from "@/lib/cyclePrediction";

export function CyclePredictionCard({ prediction }: { prediction: CyclePrediction }) {
  const { t, locale } = useTranslation();
  const dateFormatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });

  return (
    <Card>
      <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t("cycle.prediction.title")}</h2>

      {!prediction.hasPrediction ? (
        <p className="mt-2 text-sm text-zinc-400">{t("cycle.prediction.empty")}</p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("cycle.prediction.currentDay")}</p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {prediction.currentCycleDay !== null ? prediction.currentCycleDay : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("cycle.prediction.nextPeriod")}</p>
            <p className="text-lg font-semibold text-teal-600 dark:text-teal-400">
              {prediction.predictedNextStart ? dateFormatter.format(new Date(prediction.predictedNextStart)) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("cycle.prediction.fertileWindow")}</p>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {prediction.fertileWindowStart && prediction.fertileWindowEnd
                ? `${dateFormatter.format(new Date(prediction.fertileWindowStart))} – ${dateFormatter.format(new Date(prediction.fertileWindowEnd))}`
                : "—"}
            </p>
          </div>
        </div>
      )}

      {prediction.avgCycleLengthDays !== null && (
        <p className="mt-3 text-xs text-zinc-400">
          {t("cycle.prediction.avgCycleLength")}: {prediction.avgCycleLengthDays} {t("cycle.prediction.days")}
          {prediction.avgPeriodLengthDays !== null && (
            <>
              {" · "}
              {t("cycle.prediction.avgPeriodLength")}: {prediction.avgPeriodLengthDays} {t("cycle.prediction.days")}
            </>
          )}
        </p>
      )}
    </Card>
  );
}
