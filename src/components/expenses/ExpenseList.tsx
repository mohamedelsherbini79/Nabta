"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import type { ExpenseRecordSummary } from "@/types";

export function ExpenseList({ records }: { records: ExpenseRecordSummary[] }) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const dateFormatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" });
  const amountFormatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });

  async function handleDelete(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  if (records.length === 0) {
    return <p className="text-sm text-zinc-400">{t("expenses.list.empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {records.map((record) => (
        <li
          key={record.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {amountFormatter.format(record.amount)} {record.currency}
              </p>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {t(`expenses.category.${record.category.toLowerCase()}`)}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {dateFormatter.format(new Date(record.incurredAt))}
              {record.note && ` · ${record.note}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(record.id)}
            disabled={busyId === record.id}
            className="shrink-0 text-xs text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
          >
            {t("expenses.delete")}
          </button>
        </li>
      ))}
    </ul>
  );
}
