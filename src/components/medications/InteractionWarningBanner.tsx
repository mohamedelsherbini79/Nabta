"use client";

import { useTranslation } from "@/i18n/useTranslation";
import type { InteractionFindingSummary } from "@/types";

const SEVERITY_CLASSES: Record<InteractionFindingSummary["severity"], string> = {
  SEVERE:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
  MODERATE:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  MILD: "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-200",
};

const SEVERITY_KEYS: Record<InteractionFindingSummary["severity"], string> = {
  SEVERE: "medications.interactions.severity.severe",
  MODERATE: "medications.interactions.severity.moderate",
  MILD: "medications.interactions.severity.mild",
};

export function InteractionWarningBanner({ finding }: { finding: InteractionFindingSummary }) {
  const { t } = useTranslation();

  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${SEVERITY_CLASSES[finding.severity]}`}>
      <span aria-hidden="true">⚠</span>
      <div>
        <p className="font-medium">
          {finding.drugAName} + {finding.drugBName} — {t(SEVERITY_KEYS[finding.severity])}
        </p>
        <p className="mt-0.5 text-sm opacity-90">{finding.description}</p>
      </div>
    </div>
  );
}
