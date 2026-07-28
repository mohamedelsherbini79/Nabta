"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";
import type { MedicationSummary } from "@/types";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MedicationCard({ medication }: { medication: MedicationSummary }) {
  const { t } = useTranslation();
  const name = medication.drugCatalog?.tradeName ?? medication.customName ?? "—";
  const schedule = medication.schedules[0];
  const stock = medication.stock;
  const lowStock = stock ? stock.quantityOnHand <= stock.lowStockThreshold : false;

  return (
    <Link
      href={`/medications/${medication.id}`}
      className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-teal-300 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-zinc-900 dark:text-zinc-50">{name}</h3>
          {(medication.dosageForm || medication.strength) && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {[medication.dosageForm, medication.strength].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        {lowStock && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            {t("medications.card.lowStock")}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
        <span>
          {t("medications.card.schedule")}:{" "}
          {schedule
            ? `${schedule.timesOfDay.join(", ")} · ${
                schedule.daysOfWeek.length === 0
                  ? t("medications.card.daily")
                  : schedule.daysOfWeek.map((d) => DAY_LABELS[d]).join(", ")
              }`
            : t("medications.card.noSchedule")}
        </span>
        {stock && (
          <span>
            {t("medications.card.stock")}: {stock.quantityOnHand} {stock.unit}
          </span>
        )}
      </div>
    </Link>
  );
}
