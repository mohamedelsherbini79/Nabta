"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useCountry } from "@/country/useCountry";
import { SUPPORTED_COUNTRIES, COUNTRY_INFO, type CountryCode } from "@/country/country";

export function CountryForm({ initialCountry }: { initialCountry: CountryCode }) {
  const { t } = useTranslation();
  const { country, setCountry } = useCountry();

  const [selected, setSelected] = useState<CountryCode>(initialCountry);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/settings/country", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferredCountry: selected }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(t("settings.country.error"));
      return;
    }

    if (selected !== country) {
      setCountry(selected);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("settings.country.title")}</h2>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("settings.country.label")}</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value as CountryCode)}
          className="w-fit rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          {SUPPORTED_COUNTRIES.map((code) => (
            <option key={code} value={code}>
              {COUNTRY_INFO[code].flag} {t(`country.${code.toLowerCase()}`)}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <Button onClick={handleSubmit} disabled={submitting} className="self-start">
        {submitting && <Spinner className="h-4 w-4" />}
        {t("settings.save")}
      </Button>
    </div>
  );
}
