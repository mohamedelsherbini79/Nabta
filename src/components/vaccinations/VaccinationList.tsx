"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import type { VaccinationRecordSummary } from "@/types";

export function VaccinationList({ records, now }: { records: VaccinationRecordSummary[]; now: string }) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const dateFormatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" });
  const nowMs = new Date(now).getTime();

  async function handleMarkAdministered(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/vaccinations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ administeredAt: new Date().toISOString() }),
    });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/vaccinations/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  const due = records
    .filter((r) => r.status === "DUE")
    .sort((a, b) => (a.dueAt ?? "").localeCompare(b.dueAt ?? ""));
  const history = records
    .filter((r) => r.status === "ADMINISTERED")
    .sort((a, b) => (b.administeredAt ?? "").localeCompare(a.administeredAt ?? ""));

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("vaccinations.due.title")}</h2>
        {due.length === 0 ? (
          <p className="text-sm text-zinc-400">{t("vaccinations.due.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {due.map((record) => {
              const isOverdue = record.dueAt !== null && new Date(record.dueAt).getTime() < nowMs;
              return (
                <li
                  key={record.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{record.vaccineName}</p>
                      {isOverdue && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950 dark:text-red-200">
                          {t("vaccinations.overdue")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t("vaccinations.doseLabel")} {record.doseNumber}
                      {record.dueAt && ` · ${t("vaccinations.due.dueOn")} ${dateFormatter.format(new Date(record.dueAt))}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <Button
                      onClick={() => handleMarkAdministered(record.id)}
                      disabled={busyId === record.id}
                      className="!px-3 !py-1.5 text-xs"
                    >
                      {t("vaccinations.markAdministered")}
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleDelete(record.id)}
                      disabled={busyId === record.id}
                      className="text-xs text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                    >
                      {t("vaccinations.delete")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("vaccinations.history.title")}</h2>
        {history.length === 0 ? (
          <p className="text-sm text-zinc-400">{t("vaccinations.history.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {history.map((record) => (
              <li
                key={record.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{record.vaccineName}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t("vaccinations.doseLabel")} {record.doseNumber}
                    {record.administeredAt && ` · ${dateFormatter.format(new Date(record.administeredAt))}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(record.id)}
                  disabled={busyId === record.id}
                  className="shrink-0 text-xs text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                >
                  {t("vaccinations.delete")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
