"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useCountry } from "@/country/useCountry";
import { INSURANCE_PROVIDERS_BY_COUNTRY } from "@/country/insuranceProviders";

const OTHER_PROVIDER = "__other__";

const SELECT_CLASSES =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export function PolicyForm({ patientProfileId }: { patientProfileId: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { country } = useCountry();
  const knownProviders = INSURANCE_PROVIDERS_BY_COUNTRY[country];

  const [providerChoice, setProviderChoice] = useState<string>(knownProviders[0]);
  const [customProvider, setCustomProvider] = useState("");
  const provider = providerChoice === OTHER_PROVIDER ? customProvider : providerChoice;
  const [policyNumber, setPolicyNumber] = useState("");
  const [memberId, setMemberId] = useState("");
  const [planType, setPlanType] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!provider.trim() || !policyNumber.trim()) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/insurance/policies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientProfileId,
        input: {
          provider: provider.trim(),
          policyNumber: policyNumber.trim(),
          memberId: memberId.trim() || null,
          planType: planType.trim() || null,
          expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
        },
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(t("insurance.error"));
      return;
    }

    setProviderChoice(knownProviders[0]);
    setCustomProvider("");
    setPolicyNumber("");
    setMemberId("");
    setPlanType("");
    setExpiryDate("");
    router.refresh();
  }

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{t("insurance.form.title")}</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("insurance.providerLabel")}</label>
          <select value={providerChoice} onChange={(e) => setProviderChoice(e.target.value)} className={SELECT_CLASSES}>
            {knownProviders.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
            <option value={OTHER_PROVIDER}>{t("insurance.providerOther")}</option>
          </select>
        </div>
        {providerChoice === OTHER_PROVIDER && (
          <Input
            id="insuranceProviderCustom"
            label={t("insurance.providerOtherLabel")}
            value={customProvider}
            onChange={(e) => setCustomProvider(e.target.value)}
          />
        )}
        <Input
          id="insurancePolicyNumber"
          label={t("insurance.policyNumberLabel")}
          value={policyNumber}
          onChange={(e) => setPolicyNumber(e.target.value)}
        />
        <Input
          id="insuranceMemberId"
          label={t("insurance.memberIdLabel")}
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
        />
        <Input
          id="insurancePlanType"
          label={t("insurance.planTypeLabel")}
          value={planType}
          onChange={(e) => setPlanType(e.target.value)}
        />
        <Input
          id="insuranceExpiryDate"
          type="date"
          label={t("insurance.expiryDateLabel")}
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />
      </div>

      {error && (
        <p className="flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </p>
      )}

      <Button onClick={handleSubmit} disabled={submitting || !provider.trim() || !policyNumber.trim()} className="self-start">
        {submitting && <Spinner className="h-4 w-4" />}
        {submitting ? t("insurance.saving") : t("insurance.addPolicy")}
      </Button>
    </Card>
  );
}
