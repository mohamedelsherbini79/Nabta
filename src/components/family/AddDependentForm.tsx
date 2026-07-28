"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { TagListInput } from "@/components/ui/TagListInput";

const RELATIONSHIP_OPTIONS = ["CHILD", "PARENT", "SPOUSE", "OTHER"] as const;

export function AddDependentForm() {
  const { t } = useTranslation();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [relationship, setRelationship] = useState<(typeof RELATIONSHIP_OPTIONS)[number]>("CHILD");
  const [dob, setDob] = useState("");
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!displayName.trim()) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/family/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: displayName.trim(),
        relationship,
        dob: dob || null,
        chronicConditions,
        allergies,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(t("family.addDependent.error"));
      return;
    }

    setDisplayName("");
    setRelationship("CHILD");
    setDob("");
    setChronicConditions([]);
    setAllergies([]);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} className="self-start">
        {t("family.addDependent.open")}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          id="dependentName"
          label={t("family.addDependent.nameLabel")}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("family.addDependent.relationshipLabel")}
          </label>
          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value as typeof relationship)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {RELATIONSHIP_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`family.relationship.${option.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input id="dependentDob" type="date" label={t("family.addDependent.dobLabel")} value={dob} onChange={(e) => setDob(e.target.value)} />

      <TagListInput
        label={t("family.addDependent.chronicConditionsLabel")}
        value={chronicConditions}
        onChange={setChronicConditions}
        placeholder={t("assessment.addPlaceholder")}
      />
      <TagListInput
        label={t("family.addDependent.allergiesLabel")}
        value={allergies}
        onChange={setAllergies}
        placeholder={t("assessment.addPlaceholder")}
      />

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={submitting || !displayName.trim()}>
          {submitting && <Spinner className="h-4 w-4" />}
          {submitting ? t("family.addDependent.submitting") : t("family.addDependent.submit")}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
          {t("common.cancel")}
        </Button>
      </div>
    </div>
  );
}
