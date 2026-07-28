"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { InteractionWarningBanner } from "@/components/medications/InteractionWarningBanner";
import type { InteractionFindingSummary } from "@/types";

const SEVERITY_ORDER: Record<InteractionFindingSummary["severity"], number> = {
  SEVERE: 0,
  MODERATE: 1,
  MILD: 2,
};

export function InteractionsReport({ findings }: { findings: InteractionFindingSummary[] }) {
  const { t } = useTranslation();
  const sorted = [...findings].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  return (
    <div className="flex flex-col gap-3">
      {sorted.length === 0 ? (
        <p className="text-sm text-zinc-400">{t("medications.interactions.empty")}</p>
      ) : (
        sorted.map((finding, i) => <InteractionWarningBanner key={i} finding={finding} />)
      )}
      <p className="text-xs text-zinc-400">{t("medications.interactions.disclaimer")}</p>
    </div>
  );
}
