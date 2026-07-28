"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { formatVitalValue, vitalUnitLabel } from "@/lib/vitalsRange";
import type { VitalRecordSummary } from "@/types";

export function VitalsHistoryList({
  records,
  onDeleted,
}: {
  records: VitalRecordSummary[];
  onDeleted: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/vitals/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!res.ok) return;
    onDeleted(id);
  }

  if (records.length === 0) {
    return <p className="text-sm text-zinc-400">{t("vitals.history.empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {records.map((record) => (
        <li
          key={record.id}
          className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800"
        >
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {formatVitalValue(record.type, record.value)}{" "}
              <span className="font-normal text-zinc-500 dark:text-zinc-400">
                {vitalUnitLabel(record.type, record.value)}
              </span>
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {new Date(record.recordedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
          <Button
            variant="ghost"
            className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
            disabled={deletingId === record.id}
            onClick={() => handleDelete(record.id)}
          >
            {deletingId === record.id && <Spinner className="h-3.5 w-3.5" />}
            {t("vitals.history.delete")}
          </Button>
        </li>
      ))}
    </ul>
  );
}
