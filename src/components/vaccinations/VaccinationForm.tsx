"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

const COMMON_VACCINES = [
  "Influenza",
  "COVID-19",
  "Tetanus (Td/Tdap)",
  "Hepatitis A",
  "Hepatitis B",
  "MMR",
  "HPV",
  "Pneumococcal",
  "Varicella",
  "Meningococcal",
  "Polio",
  "DTaP/DTP",
  "Shingles (Zoster)",
  "Rotavirus",
];

export function VaccinationForm({ patientProfileId }: { patientProfileId: string }) {
  const { t } = useTranslation();
  const router = useRouter();

  const [vaccineName, setVaccineName] = useState("");
  const [doseNumber, setDoseNumber] = useState("1");
  const [administeredAt, setAdministeredAt] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!vaccineName.trim() || (!administeredAt && !dueAt)) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/vaccinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientProfileId,
        input: {
          vaccineName: vaccineName.trim(),
          doseNumber: Number(doseNumber) || 1,
          administeredAt: administeredAt || null,
          dueAt: dueAt || null,
        },
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(t("vaccinations.error"));
      return;
    }

    setVaccineName("");
    setDoseNumber("1");
    setAdministeredAt("");
    setDueAt("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="vaccineName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("vaccinations.vaccineNameLabel")}
          </label>
          <input
            id="vaccineName"
            list="commonVaccines"
            value={vaccineName}
            onChange={(e) => setVaccineName(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <datalist id="commonVaccines">
            {COMMON_VACCINES.map((v) => (
              <option key={v} value={v} />
            ))}
          </datalist>
        </div>
        <Input
          id="doseNumber"
          type="number"
          min={1}
          max={20}
          label={t("vaccinations.doseNumberLabel")}
          value={doseNumber}
          onChange={(e) => setDoseNumber(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          id="administeredAt"
          type="date"
          label={t("vaccinations.administeredAtLabel")}
          value={administeredAt}
          onChange={(e) => setAdministeredAt(e.target.value)}
        />
        <Input
          id="dueAt"
          type="date"
          label={t("vaccinations.dueAtLabel")}
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
        />
      </div>
      <p className="text-xs text-zinc-400">{t("vaccinations.dateHint")}</p>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={submitting || !vaccineName.trim() || (!administeredAt && !dueAt)}
        className="self-start"
      >
        {submitting && <Spinner className="h-4 w-4" />}
        {submitting ? t("vaccinations.submitting") : t("vaccinations.submit")}
      </Button>
    </div>
  );
}
