"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { DoctorShareLinkSummary } from "@/lib/doctorShare";

const SCOPE_FIELDS = [
  "demographics",
  "bloodType",
  "allergies",
  "chronicConditions",
  "medications",
  "vitals",
  "vaccinations",
  "symptoms",
] as const;

const DURATION_OPTIONS = [24, 72, 168, 720] as const;
const DURATION_LABEL_KEYS: Record<(typeof DURATION_OPTIONS)[number], string> = {
  24: "shareProfile.duration.24",
  72: "shareProfile.duration.72",
  168: "shareProfile.duration.168",
  720: "shareProfile.duration.720",
};

export interface DoctorShareLinkWithQr {
  link: DoctorShareLinkSummary;
  publicUrl: string;
  qrDataUrl: string;
}

export function DoctorShareManager({
  patientProfileId,
  activeLinks,
}: {
  patientProfileId: string;
  activeLinks: DoctorShareLinkWithQr[];
}) {
  const { t } = useTranslation();
  const router = useRouter();

  const [scope, setScope] = useState<Record<(typeof SCOPE_FIELDS)[number], boolean>>({
    demographics: true,
    bloodType: true,
    allergies: true,
    chronicConditions: true,
    medications: true,
    vitals: true,
    vaccinations: true,
    symptoms: true,
  });
  const [expiresInHours, setExpiresInHours] = useState<(typeof DURATION_OPTIONS)[number]>(168);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleField(field: (typeof SCOPE_FIELDS)[number]) {
    setScope((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  async function handleGenerate() {
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/share/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientProfileId, scope, expiresInHours }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(t("shareProfile.error"));
      return;
    }

    router.refresh();
  }

  async function handleRevoke(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/share/link/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  async function handleCopy(id: string, publicUrl: string) {
    await navigator.clipboard.writeText(publicUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("shareProfile.manager.title")}</h2>

        <div className="flex flex-wrap gap-3">
          {SCOPE_FIELDS.map((field) => (
            <label key={field} className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" checked={scope[field]} onChange={() => toggleField(field)} className="accent-green-600" />
              {t(`shareProfile.scope.${field}`)}
            </label>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("shareProfile.durationLabel")}</label>
          <select
            value={expiresInHours}
            onChange={(e) => setExpiresInHours(Number(e.target.value) as (typeof DURATION_OPTIONS)[number])}
            className="w-fit rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {DURATION_OPTIONS.map((hours) => (
              <option key={hours} value={hours}>
                {t(DURATION_LABEL_KEYS[hours])}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <Button onClick={handleGenerate} disabled={submitting} className="self-start">
          {submitting && <Spinner className="h-4 w-4" />}
          {t("shareProfile.generate")}
        </Button>
      </div>

      {activeLinks.length === 0 ? (
        <p className="text-sm text-zinc-400">{t("shareProfile.empty")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {activeLinks.map(({ link, publicUrl, qrDataUrl }) => (
            <div
              key={link.id}
              className="flex flex-col items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt={t("shareProfile.qrAlt")} className="h-32 w-32 rounded-lg border border-zinc-200 dark:border-zinc-800" />
              <div className="flex w-full items-center gap-2">
                <code className="flex-1 truncate rounded-lg bg-zinc-100 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {publicUrl}
                </code>
                <Button variant="secondary" onClick={() => handleCopy(link.id, publicUrl)} className="shrink-0 !px-3 !py-2 text-xs">
                  {copiedId === link.id ? t("shareProfile.copied") : t("shareProfile.copy")}
                </Button>
              </div>
              {link.expiresAt && (
                <p className="text-xs text-zinc-400">
                  {t("shareProfile.expiresAt")} {new Date(link.expiresAt).toLocaleString()}
                </p>
              )}
              <Button
                variant="danger"
                onClick={() => handleRevoke(link.id)}
                disabled={busyId === link.id}
                className="!px-3 !py-1.5 text-xs"
              >
                {t("shareProfile.revoke")}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
