"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import type { DoseStatus, DoseSummary } from "@/types";

export function TodaysDoseChecklist({ initialDoses }: { initialDoses: DoseSummary[] }) {
  const { t } = useTranslation();
  const [doses, setDoses] = useState(initialDoses);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [lowStockNote, setLowStockNote] = useState<string | null>(null);

  async function updateStatus(doseId: string, status: DoseStatus) {
    setPendingId(doseId);
    const res = await fetch(`/api/medications/doses/${doseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setPendingId(null);

    if (!res.ok) return;
    const data = (await res.json()) as { lowStock: boolean };

    setDoses((prev) => prev.map((d) => (d.id === doseId ? { ...d, status } : d)));
    if (data.lowStock) {
      const dose = doses.find((d) => d.id === doseId);
      setLowStockNote(dose?.schedule.medication.customName ?? dose?.schedule.medication.drugCatalog?.tradeName ?? "");
    }
  }

  if (doses.length === 0) {
    return <p className="text-sm text-zinc-400">{t("medications.today.empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {lowStockNote !== null && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {lowStockNote} — {t("medications.card.lowStock")}
        </div>
      )}
      <ul className="flex flex-col gap-2">
        {doses.map((dose) => {
          const name = dose.schedule.medication.drugCatalog?.tradeName ?? dose.schedule.medication.customName ?? "—";
          const time = new Date(dose.scheduledFor).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <li
              key={dose.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {time} · {t(`medications.dose.${dose.status.toLowerCase()}`)}
                </p>
              </div>
              {dose.status === "PENDING" && (
                <div className="flex gap-1.5">
                  <Button
                    variant="primary"
                    className="px-2.5 py-1 text-xs"
                    disabled={pendingId === dose.id}
                    onClick={() => updateStatus(dose.id, "TAKEN")}
                  >
                    {t("medications.dose.markTaken")}
                  </Button>
                  <Button
                    variant="secondary"
                    className="px-2.5 py-1 text-xs"
                    disabled={pendingId === dose.id}
                    onClick={() => updateStatus(dose.id, "SKIPPED")}
                  >
                    {t("medications.dose.markSkipped")}
                  </Button>
                  <Button
                    variant="ghost"
                    className="px-2.5 py-1 text-xs"
                    disabled={pendingId === dose.id}
                    onClick={() => updateStatus(dose.id, "MISSED")}
                  >
                    {t("medications.dose.markMissed")}
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
