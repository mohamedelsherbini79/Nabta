"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import type { GeneticProfileSource, GeneticProfileSummary, GeneVariant } from "@/types";

const SOURCE_OPTIONS: GeneticProfileSource[] = ["MANUAL", "23ANDME", "ANCESTRYDNA", "VCF"];

const SELECT_CLASSES =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export function GeneticProfileManager({
  patientProfileId,
  initialProfile,
}: {
  patientProfileId: string;
  initialProfile: GeneticProfileSummary | null;
}) {
  const { t } = useTranslation();
  const router = useRouter();

  const [source, setSource] = useState<GeneticProfileSource>(initialProfile?.source ?? "MANUAL");
  const [variants, setVariants] = useState<GeneVariant[]>(
    initialProfile?.variants ?? [{ gene: "", phenotype: "", rsid: "" }],
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function updateVariant(index: number, field: keyof GeneVariant, value: string) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  }

  function addRow() {
    setVariants((prev) => [...prev, { gene: "", phenotype: "", rsid: "" }]);
  }

  function removeRow(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    const cleaned = variants
      .map((v) => ({ gene: v.gene.trim(), phenotype: v.phenotype.trim(), rsid: v.rsid?.trim() || undefined }))
      .filter((v) => v.gene && v.phenotype);

    if (cleaned.length === 0) return;

    setSubmitting(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/genetics/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientProfileId, input: { source, variants: cleaned } }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(t("genetics.error"));
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{t("genetics.profile.title")}</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("genetics.profile.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("genetics.sourceLabel")}</label>
        <select value={source} onChange={(e) => setSource(e.target.value as GeneticProfileSource)} className={SELECT_CLASSES}>
          {SOURCE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {t(`genetics.source.${option.toLowerCase()}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        {variants.map((variant, index) => (
          <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
            <Input
              label={index === 0 ? t("genetics.geneLabel") : undefined}
              placeholder="CYP2C19"
              value={variant.gene}
              onChange={(e) => updateVariant(index, "gene", e.target.value)}
            />
            <Input
              label={index === 0 ? t("genetics.phenotypeLabel") : undefined}
              placeholder="Poor Metabolizer"
              value={variant.phenotype}
              onChange={(e) => updateVariant(index, "phenotype", e.target.value)}
            />
            <Input
              label={index === 0 ? t("genetics.rsidLabel") : undefined}
              placeholder="rs4244285"
              value={variant.rsid ?? ""}
              onChange={(e) => updateVariant(index, "rsid", e.target.value)}
            />
            <Button type="button" variant="danger" onClick={() => removeRow(index)} className="!px-2.5 !py-2 text-xs">
              {t("genetics.removeRow")}
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={addRow} className="self-start !px-3 !py-1.5 text-xs">
          {t("genetics.addRow")}
        </Button>
      </div>

      {error && (
        <p className="flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting && <Spinner className="h-4 w-4" />}
          {submitting ? t("genetics.saving") : t("genetics.save")}
        </Button>
        {saved && <span className="text-sm text-green-600 dark:text-green-400">{t("genetics.saved")}</span>}
      </div>
    </Card>
  );
}
