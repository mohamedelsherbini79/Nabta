"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { TagListInput } from "@/components/ui/TagListInput";
import type { AdminDrugSummary } from "@/types";

export interface DrugFormValues {
  tradeName: string;
  genericName: string;
  activeIngredient: string;
  dosageForms: string[];
  commonSideEffects: string[];
  contraindications: string[];
  heatSensitive: boolean;
}

export function DrugForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: AdminDrugSummary;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();

  const [values, setValues] = useState<DrugFormValues>({
    tradeName: initial?.tradeName ?? "",
    genericName: initial?.genericName ?? "",
    activeIngredient: initial?.activeIngredient ?? "",
    dosageForms: initial?.dosageForms ?? [],
    commonSideEffects: initial?.commonSideEffects ?? [],
    contraindications: initial?.contraindications ?? [],
    heatSensitive: initial?.heatSensitive ?? false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const url = initial ? `/api/admin/drugs/${initial.id}` : "/api/admin/drugs";
    const method = initial ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(t("admin.drugs.error"));
      return;
    }

    onSaved();
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          id="drugTradeName"
          label={t("admin.drugs.tradeName")}
          value={values.tradeName}
          onChange={(e) => setValues((v) => ({ ...v, tradeName: e.target.value }))}
        />
        <Input
          id="drugGenericName"
          label={t("admin.drugs.genericName")}
          value={values.genericName}
          onChange={(e) => setValues((v) => ({ ...v, genericName: e.target.value }))}
        />
        <Input
          id="drugActiveIngredient"
          label={t("admin.drugs.activeIngredient")}
          value={values.activeIngredient}
          onChange={(e) => setValues((v) => ({ ...v, activeIngredient: e.target.value }))}
        />
      </div>
      <TagListInput
        label={t("admin.drugs.dosageForms")}
        value={values.dosageForms}
        onChange={(next) => setValues((v) => ({ ...v, dosageForms: next }))}
      />
      <TagListInput
        label={t("admin.drugs.commonSideEffects")}
        value={values.commonSideEffects}
        onChange={(next) => setValues((v) => ({ ...v, commonSideEffects: next }))}
      />
      <TagListInput
        label={t("admin.drugs.contraindications")}
        value={values.contraindications}
        onChange={(next) => setValues((v) => ({ ...v, contraindications: next }))}
      />
      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={values.heatSensitive}
          onChange={(e) => setValues((v) => ({ ...v, heatSensitive: e.target.checked }))}
          className="accent-teal-600"
        />
        {t("admin.drugs.heatSensitive")}
      </label>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={submitting || !values.tradeName.trim() || !values.genericName.trim() || !values.activeIngredient.trim()}
          className="self-start"
        >
          {submitting && <Spinner className="h-4 w-4" />}
          {initial ? t("admin.drugs.saveChanges") : t("admin.drugs.create")}
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={submitting} className="self-start">
            {t("admin.drugs.cancel")}
          </Button>
        )}
      </div>
    </div>
  );
}
