"use client";

import { useTranslation } from "@/i18n/useTranslation";
import type { SymptomLogSummary } from "@/types";

const WIDTH = 600;
const HEIGHT = 180;
const PADDING = { top: 10, right: 12, bottom: 20, left: 28 };
const GRID_VALUES = [2, 4, 6, 8, 10];

function scaleY(severity: number): number {
  const ratio = (severity - 1) / 9;
  return HEIGHT - PADDING.bottom - ratio * (HEIGHT - PADDING.top - PADDING.bottom);
}

export function SeverityTrendChart({ logs }: { logs: SymptomLogSummary[] }) {
  const { t, locale } = useTranslation();

  if (logs.length === 0) {
    return <p className="text-sm text-zinc-400">{t("symptoms.chart.empty")}</p>;
  }

  const times = logs.map((l) => new Date(l.loggedAt).getTime());
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  function scaleX(time: number): number {
    if (maxTime === minTime) return PADDING.left + (WIDTH - PADDING.left - PADDING.right) / 2;
    const ratio = (time - minTime) / (maxTime - minTime);
    return PADDING.left + ratio * (WIDTH - PADDING.left - PADDING.right);
  }

  const points = logs.map((log) => ({
    x: scaleX(new Date(log.loggedAt).getTime()),
    y: scaleY(log.severity),
    log,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const dateFormatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });
  const timeFormatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label={t("symptoms.chart.title")}>
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
        <path d={pathD} fill="none" stroke="#0d9488" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      )}

      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#0d9488">
          <title>
            {(p.log.medications.length > 0
              ? timeFormatter.format(new Date(p.log.loggedAt))
              : dateFormatter.format(new Date(p.log.loggedAt))) +
              ` — ${p.log.severity}/10` +
              (p.log.tags.length > 0 ? ` (${p.log.tags.join(", ")})` : "") +
              (p.log.medications.length > 0 ? ` · ${t("symptoms.chart.medications")}: ${p.log.medications.join(", ")}` : "")}
          </title>
        </circle>
      ))}
    </svg>
  );
}
