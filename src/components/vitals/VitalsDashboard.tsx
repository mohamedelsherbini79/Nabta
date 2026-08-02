"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Card } from "@/components/ui/Card";
import { LogVitalForm } from "@/components/vitals/LogVitalForm";
import { VitalsHistoryList } from "@/components/vitals/VitalsHistoryList";
import { VitalSparkline } from "@/components/vitals/VitalSparkline";
import {
  VITAL_TYPES,
  classifyVital,
  formatVitalValue,
  primaryMetric,
  vitalUnitLabel,
  type VitalRangeLevel,
} from "@/lib/vitalsRange";
import type { VitalRecordSummary, VitalsType } from "@/types";

const TYPE_LABEL_KEYS: Record<VitalsType, string> = {
  BLOOD_PRESSURE: "vitals.type.bloodPressure",
  GLUCOSE: "vitals.type.glucose",
  TEMPERATURE: "vitals.type.temperature",
  WEIGHT: "vitals.type.weight",
  SPO2: "vitals.type.spo2",
  HEART_RATE: "vitals.type.heartRate",
};

const LEVEL_CLASSES: Record<VitalRangeLevel, string> = {
  LOW: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  NORMAL: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  ELEVATED: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
};

const LEVEL_LABEL_KEYS: Record<VitalRangeLevel, string> = {
  LOW: "vitals.level.low",
  NORMAL: "vitals.level.normal",
  ELEVATED: "vitals.level.elevated",
  HIGH: "vitals.level.high",
  CRITICAL: "vitals.level.critical",
};

export function VitalsDashboard({
  patientProfileId,
  initialRecords,
}: {
  patientProfileId: string;
  initialRecords: VitalRecordSummary[];
}) {
  const { t } = useTranslation();
  const [records, setRecords] = useState(initialRecords);
  const [activeType, setActiveType] = useState<VitalsType>("BLOOD_PRESSURE");

  const recordsForActiveType = useMemo(
    () => records.filter((r) => r.type === activeType).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
    [records, activeType],
  );

  const latest = recordsForActiveType[0] ?? null;
  const level = latest ? classifyVital(latest.type, latest.value) : null;

  const sparklineValues = useMemo(
    () =>
      [...recordsForActiveType]
        .reverse()
        .map((r) => primaryMetric(r.type, r.value)),
    [recordsForActiveType],
  );

  function handleCreated(record: VitalRecordSummary) {
    setRecords((prev) => [record, ...prev]);
  }

  function handleDeleted(id: string) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5">
        {VITAL_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setActiveType(type)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeType === type
                ? "bg-green-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {t(TYPE_LABEL_KEYS[type])}
          </button>
        ))}
      </div>

      <Card>
        <div className="flex items-start justify-between">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t(TYPE_LABEL_KEYS[activeType])}</h2>
          {level && (
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${LEVEL_CLASSES[level]}`}>
              {t(LEVEL_LABEL_KEYS[level])}
            </span>
          )}
        </div>
        {latest ? (
          <>
            <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {formatVitalValue(latest.type, latest.value)}{" "}
              <span className="text-base font-normal text-zinc-500 dark:text-zinc-400">
                {vitalUnitLabel(latest.type, latest.value)}
              </span>
            </p>
            <p className="text-xs text-zinc-400">
              {new Date(latest.recordedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-zinc-400">{t("vitals.empty")}</p>
        )}
        {sparklineValues.length >= 2 && (
          <div className="mt-3">
            <VitalSparkline values={sparklineValues} />
          </div>
        )}
      </Card>

      <LogVitalForm patientProfileId={patientProfileId} type={activeType} onCreated={handleCreated} />

      <section>
        <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("vitals.history.title")}</h3>
        <VitalsHistoryList records={recordsForActiveType} onDeleted={handleDeleted} />
      </section>
    </div>
  );
}
