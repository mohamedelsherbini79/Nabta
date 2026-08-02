"use client";

import { useTranslation } from "@/i18n/useTranslation";
import type { MoodEntrySummary } from "@/types";

const WIDTH = 600;
const HEIGHT = 180;
const PADDING = { top: 10, right: 12, bottom: 20, left: 28 };
const GRID_VALUES = [1, 2, 3, 4, 5];

const MOOD_SCORES: Record<string, number> = {
  TERRIBLE: 1,
  BAD: 2,
  NEUTRAL: 3,
  GOOD: 4,
  EXCELLENT: 5,
};

function moodScore(mood: string): number {
  return MOOD_SCORES[mood] ?? 3;
}

function scaleY(score: number): number {
  const ratio = (score - 1) / 4;
  return HEIGHT - PADDING.bottom - ratio * (HEIGHT - PADDING.top - PADDING.bottom);
}

export function MoodTrendChart({ entries }: { entries: MoodEntrySummary[] }) {
  const { t, locale } = useTranslation();

  if (entries.length === 0) {
    return <p className="text-sm text-zinc-400">{t("mentalHealth.chart.empty")}</p>;
  }

  const chronological = [...entries].reverse();
  const times = chronological.map((e) => new Date(e.loggedAt).getTime());
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  function scaleX(time: number): number {
    if (maxTime === minTime) return PADDING.left + (WIDTH - PADDING.left - PADDING.right) / 2;
    const ratio = (time - minTime) / (maxTime - minTime);
    return PADDING.left + ratio * (WIDTH - PADDING.left - PADDING.right);
  }

  const points = chronological.map((entry) => ({
    x: scaleX(new Date(entry.loggedAt).getTime()),
    y: scaleY(moodScore(entry.mood)),
    entry,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const timeFormatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label={t("mentalHealth.chart.title")}>
      {GRID_VALUES.map((value) => (
        <g key={value}>
          <line
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={scaleY(value)}
            y2={scaleY(value)}
            className="stroke-zinc-100 dark:stroke-zinc-800"
            strokeWidth={1}
          />
          <text x={4} y={scaleY(value) + 3} className="fill-zinc-400 text-[9px]">
            {value}
          </text>
        </g>
      ))}

      {points.length > 1 && (
        <path d={pathD} fill="none" stroke="#16a34a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      )}

      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#16a34a">
          <title>{`${timeFormatter.format(new Date(p.entry.loggedAt))} — ${t(`mentalHealth.mood.${p.entry.mood.toLowerCase()}`)}`}</title>
        </circle>
      ))}
    </svg>
  );
}
