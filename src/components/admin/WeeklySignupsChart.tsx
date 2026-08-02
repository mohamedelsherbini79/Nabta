"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import type { AnalyticsWeeklySignup } from "@/types";

const WIDTH = 640;
const HEIGHT = 200;
const PADDING = { top: 12, right: 12, bottom: 28, left: 12 };

export function WeeklySignupsChart({ data }: { data: AnalyticsWeeklySignup[] }) {
  const { t, locale } = useTranslation();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const maxCount = Math.max(1, ...data.map((d) => d.count));
  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const barGap = 4;
  const barWidth = data.length > 0 ? plotWidth / data.length - barGap : 0;

  const dateFormatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {t("admin.analytics.weeklySignups")}
      </h3>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label={t("admin.analytics.weeklySignups")}>
        <line
          x1={PADDING.left}
          y1={HEIGHT - PADDING.bottom}
          x2={WIDTH - PADDING.right}
          y2={HEIGHT - PADDING.bottom}
          className="stroke-zinc-200 dark:stroke-zinc-800"
          strokeWidth={1}
        />
        {data.map((d, i) => {
          const barHeight = (d.count / maxCount) * plotHeight;
          const x = PADDING.left + i * (barWidth + barGap);
          const y = HEIGHT - PADDING.bottom - barHeight;
          const isHovered = hoverIndex === i;
          return (
            <g key={d.weekStart}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 1)}
                rx={3}
                className={isHovered ? "fill-green-700 dark:fill-green-400" : "fill-green-600 dark:fill-green-500"}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <title>
                  {dateFormatter.format(new Date(d.weekStart))}: {d.count}
                </title>
              </rect>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
