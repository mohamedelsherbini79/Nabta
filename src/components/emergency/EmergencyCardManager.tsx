"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { EmergencyCardLinkSummary } from "@/lib/emergencyCard";

const SCOPE_FIELDS = ["bloodType", "allergies", "chronicConditions", "medications", "emergencyContact"] as const;

export function EmergencyCardManager({
  patientProfileId,
  activeLink,
  publicUrl,
  qrDataUrl,
}: {
  patientProfileId: string;
  activeLink: EmergencyCardLinkSummary | null;
  publicUrl: string | null;
  qrDataUrl: string | null;
}) {
  const { t } = useTranslation();
  const router = useRouter();

  const [scope, setScope] = useState<Record<(typeof SCOPE_FIELDS)[number], boolean>>({
    bloodType: activeLink?.scope.bloodType ?? true,
    allergies: activeLink?.scope.allergies ?? true,
    chronicConditions: activeLink?.scope.chronicConditions ?? true,
    medications: activeLink?.scope.medications ?? true,
    emergencyContact: activeLink?.scope.emergencyContact ?? true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleField(field: (typeof SCOPE_FIELDS)[number]) {
    setScope((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  async function handleGenerate() {
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/emergency-card/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientProfileId, scope }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(t("emergencyCard.error"));
      return;
    }

    router.refresh();
  }

  async function handleRevoke() {
    if (!activeLink) return;
    setSubmitting(true);
    const res = await fetch(`/api/emergency-card/link/${activeLink.id}`, { method: "DELETE" });
    setSubmitting(false);
    if (res.ok) router.refresh();
  }

  async function handleCopy() {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("emergencyCard.manager.title")}</h2>

      <div className="flex flex-wrap gap-3">
        {SCOPE_FIELDS.map((field) => (
          <label key={field} className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
            <input type="checkbox" checked={scope[field]} onChange={() => toggleField(field)} className="accent-teal-600" />
            {t(`emergencyCard.scope.${field}`)}
          </label>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Button onClick={handleGenerate} disabled={submitting} className="self-start">
        {submitting && <Spinner className="h-4 w-4" />}
        {activeLink ? t("emergencyCard.regenerate") : t("emergencyCard.generate")}
      </Button>

      {activeLink && publicUrl && (
        <div className="flex flex-col items-start gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          {qrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt={t("emergencyCard.qrAlt")} className="h-40 w-40 rounded-lg border border-zinc-200 dark:border-zinc-800" />
          )}
          <div className="flex w-full items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-zinc-100 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {publicUrl}
            </code>
            <Button variant="secondary" onClick={handleCopy} className="shrink-0 !px-3 !py-2 text-xs">
              {copied ? t("emergencyCard.copied") : t("emergencyCard.copy")}
            </Button>
          </div>
          <Button variant="danger" onClick={handleRevoke} disabled={submitting} className="!px-3 !py-1.5 text-xs">
            {t("emergencyCard.revoke")}
          </Button>
        </div>
      )}
    </div>
  );
}
