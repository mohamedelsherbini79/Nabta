"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import type { DoctorConsultationSummary } from "@/types";

const JOIN_WINDOW_MS = 15 * 60 * 1000;

export function DoctorConsultationList({ consultations, now }: { consultations: DoctorConsultationSummary[]; now: string }) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const nowMs = new Date(now).getTime();

  async function handleNoShow(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/consultations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "NO_SHOW" }),
    });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  const upcoming = consultations
    .filter((c) => c.status === "BOOKED")
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
  const past = consultations
    .filter((c) => c.status !== "BOOKED")
    .sort((a, b) => b.scheduledFor.localeCompare(a.scheduledFor));

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("doctor.consultations.upcoming.title")}
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-zinc-400">{t("doctor.consultations.upcoming.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {upcoming.map((c) => {
              const scheduledMs = new Date(c.scheduledFor).getTime();
              const canJoin = Math.abs(scheduledMs - nowMs) <= JOIN_WINDOW_MS;
              const pastDue = scheduledMs < nowMs - JOIN_WINDOW_MS;
              return (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{c.patientDisplayName}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{dateFormatter.format(new Date(c.scheduledFor))}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {canJoin && (
                      <Link href={`/doctor/consultations/${c.id}/call`}>
                        <Button className="!px-3 !py-1.5 text-xs">{t("consultations.join")}</Button>
                      </Link>
                    )}
                    {!canJoin && !pastDue && (
                      <span className="text-xs text-zinc-400">{t("consultations.joinUnavailable")}</span>
                    )}
                    {pastDue && (
                      <button
                        type="button"
                        onClick={() => handleNoShow(c.id)}
                        disabled={busyId === c.id}
                        className="text-xs text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                      >
                        {t("doctor.consultations.markNoShow")}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("doctor.consultations.past.title")}
        </h2>
        {past.length === 0 ? (
          <p className="text-sm text-zinc-400">{t("doctor.consultations.past.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {past.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{c.patientDisplayName}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{dateFormatter.format(new Date(c.scheduledFor))}</p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {t(`consultations.status.${c.status.toLowerCase()}`)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
