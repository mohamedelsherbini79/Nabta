"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { useCountry } from "@/country/useCountry";

export function EmergencyNotice() {
  const { t } = useTranslation();
  const { country, info } = useCountry();

  const text = t("emergency.banner")
    .replace("{number}", info.ambulance)
    .replace("{country}", t(`country.${country.toLowerCase()}`));

  return (
    <div className="flex items-start gap-2 border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
      <span aria-hidden="true">⚠</span>
      <p>{text}</p>
    </div>
  );
}
