"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { TRIMESTER_BAR_COLOR } from "@/lib/pregnancyWeeks";

const MAX_WEEK = 42;
const TRIMESTER_RANGES: { trimester: 1 | 2 | 3; weeks: number }[] = [
  { trimester: 1, weeks: 13 },
  { trimester: 2, weeks: 14 },
  { trimester: 3, weeks: 15 },
];

export function PregnancyWeekBar({ currentWeek }: { currentWeek: number }) {
  const { t } = useTranslation();
  const markerPercent = Math.min(Math.max(currentWeek, 1), MAX_WEEK) / MAX_WEEK * 100;

  return (
    // Forced LTR: this is a chronological timeline (week 1 -> 42), so it always
    // reads left-to-right regardless of page direction — same convention as
    // the SVG trend charts (SeverityTrendChart, MoodTrendChart) elsewhere in
    // the app, which never mirror for RTL either. Without this, the flex row's
    // automatic RTL reversal would flip the trimester segments while the
    // marker's physical `left` position stayed put, misaligning the two.
    <div dir="ltr" className="flex flex-col gap-2">
      <div className="relative pt-2">
        <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full">
          {TRIMESTER_RANGES.map((range) => (
            <div
              key={range.trimester}
              className={TRIMESTER_BAR_COLOR[range.trimester]}
              style={{ width: `${(range.weeks / MAX_WEEK) * 100}%` }}
              title={t(`pregnancy.trimester.${range.trimester}`)}
            />
          ))}
        </div>
        <div
          className="absolute top-0 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-white bg-zinc-900 shadow dark:border-zinc-950 dark:bg-zinc-100"
          style={{ left: `${markerPercent}%` }}
          title={`${t("pregnancy.week")} ${currentWeek}`}
        />
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        {TRIMESTER_RANGES.map((range) => (
          <span key={range.trimester} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${TRIMESTER_BAR_COLOR[range.trimester]}`} aria-hidden="true" />
            {t(`pregnancy.trimester.${range.trimester}`)}
          </span>
        ))}
      </div>
    </div>
  );
}
