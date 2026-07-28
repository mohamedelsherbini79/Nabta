"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";
import type { ReportSummary } from "@/types";

export function ReportList({ reports }: { reports: ReportSummary[] }) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const dateFormatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" });

  async function handleDelete(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  if (reports.length === 0) {
    return <p className="text-sm text-zinc-400">{t("reports.empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {reports.map((report) => (
        <li
          key={report.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {dateFormatter.format(new Date(report.periodStart))} – {dateFormatter.format(new Date(report.periodEnd))}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {report.generatedAt
                ? `${t("reports.generatedOn")} ${dateFormatter.format(new Date(report.generatedAt))}`
                : t(`reports.status.${report.status.toLowerCase()}`)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href={`/reports/${report.id}`}
              target="_blank"
              className="text-xs font-medium text-teal-600 hover:underline dark:text-teal-400"
            >
              {t("reports.view")}
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(report.id)}
              disabled={busyId === report.id}
              className="text-xs text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
            >
              {t("reports.delete")}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
