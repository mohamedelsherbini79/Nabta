"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { SUPPORTED_LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/locale";
import { IconDropdown } from "@/components/ui/IconDropdown";

export function LanguageToggle() {
  const { locale, setLocale, t } = useTranslation();

  const options = SUPPORTED_LOCALES.map((code) => ({
    code,
    label: LOCALE_LABELS[code],
  }));

  return (
    <IconDropdown
      value={locale}
      options={options}
      onChange={(code) => setLocale(code as Locale)}
      ariaLabel={t("settings.language.label")}
      hideLabelOnMobile={false}
    />
  );
}
