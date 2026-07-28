"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { MedicationScheduleInput } from "@/lib/validation";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ScheduleBuilder({
  value,
  onChange,
}: {
  value: MedicationScheduleInput;
  onChange: (next: MedicationScheduleInput) => void;
}) {
  const { t } = useTranslation();
  const [newTime, setNewTime] = useState("08:00");

  function addTime() {
    if (value.timesOfDay.includes(newTime)) return;
    onChange({ ...value, timesOfDay: [...value.timesOfDay, newTime].sort() });
  }

  function removeTime(time: string) {
    onChange({ ...value, timesOfDay: value.timesOfDay.filter((t2) => t2 !== time) });
  }

  function toggleDay(day: number) {
    const has = value.daysOfWeek.includes(day);
    onChange({
      ...value,
      daysOfWeek: has ? value.daysOfWeek.filter((d) => d !== day) : [...value.daysOfWeek, day].sort(),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("medications.add.timesLabel")}
        </label>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {value.timesOfDay.map((time) => (
            <span
              key={time}
              className="flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-800 dark:bg-teal-950 dark:text-teal-200"
            >
              {time}
              <button
                type="button"
                onClick={() => removeTime(time)}
                aria-label="Remove"
                className="ms-1 text-teal-600 hover:text-teal-900 dark:text-teal-400"
              >
                ✕
              </button>
            </span>
          ))}
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="rounded-lg border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <Button type="button" variant="secondary" onClick={addTime} className="px-2.5 py-1 text-xs">
            {t("medications.add.addTime")}
          </Button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("medications.add.daysLabel")}
        </label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {DAY_LABELS.map((label, day) => {
            const active = value.daysOfWeek.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-teal-600 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          {value.daysOfWeek.length === 0 ? t("medications.card.daily") : null}
        </p>
      </div>

      <Input
        id="schedule-timezone"
        label="Timezone"
        value={value.timezone}
        onChange={(e) => onChange({ ...value, timezone: e.target.value })}
      />

      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={value.ramadanShift}
          onChange={(e) => onChange({ ...value, ramadanShift: e.target.checked })}
          className="rounded border-zinc-300 dark:border-zinc-700"
        />
        {t("medications.add.ramadanShiftLabel")}
      </label>
    </div>
  );
}
