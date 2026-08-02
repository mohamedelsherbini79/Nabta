"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { Card } from "@/components/ui/Card";
import type { ExpenseSummary } from "@/types";

function formatAmount(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
}

export function ExpenseSummaryCard({ summary }: { summary: ExpenseSummary }) {
  const { t, locale } = useTranslation();

  if (summary.totalsByCurrency.length === 0) {
    return (
      <Card>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t("expenses.summary.title")}</h2>
        <p className="mt-2 text-sm text-zinc-400">{t("expenses.summary.empty")}</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-5">
      <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t("expenses.summary.title")}</h2>

      {summary.totalsByCurrency.map((totals) => {
        const categories = summary.byCategory
          .filter((c) => c.currency === totals.currency)
          .sort((a, b) => b.total - a.total);
        const maxTotal = Math.max(...categories.map((c) => c.total), 1);

        return (
          <div key={totals.currency} className="flex flex-col gap-3 border-t border-zinc-100 pt-4 first:border-t-0 first:pt-0 dark:border-zinc-800">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{totals.currency}</span>
              <div className="flex gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                <span>
                  {t("expenses.summary.thisMonth")}: {formatAmount(totals.monthTotal, locale)}
                </span>
                <span>
                  {t("expenses.summary.thisYear")}: {formatAmount(totals.yearTotal, locale)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {categories.map((c) => (
                <div key={c.category} className="flex items-center gap-2">
                  <span className="w-28 shrink-0 truncate text-xs text-zinc-600 dark:text-zinc-400">
                    {t(`expenses.category.${c.category.toLowerCase()}`)}
                  </span>
                  <div className="h-2 flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-2 rounded-full bg-green-600"
                      style={{ width: `${Math.max((c.total / maxTotal) * 100, 4)}%` }}
                    />
                  </div>
                  <span className="w-20 shrink-0 text-end text-xs font-medium text-zinc-900 dark:text-zinc-50">
                    {formatAmount(c.total, locale)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </Card>
  );
}
