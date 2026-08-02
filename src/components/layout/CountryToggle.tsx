"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { useCountry } from "@/country/useCountry";
import { SUPPORTED_COUNTRIES, COUNTRY_INFO, type CountryCode } from "@/country/country";

export function CountryToggle() {
  const { t } = useTranslation();
  const { country, setCountry } = useCountry();

  return (
    <select
      value={country}
      onChange={(e) => setCountry(e.target.value as CountryCode)}
      aria-label="Country"
      className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {SUPPORTED_COUNTRIES.map((code) => (
        <option key={code} value={code}>
          {COUNTRY_INFO[code].flag} {t(`country.${code.toLowerCase()}`)}
        </option>
      ))}
    </select>
  );
}
