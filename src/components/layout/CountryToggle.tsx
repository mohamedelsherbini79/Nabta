"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { useCountry } from "@/country/useCountry";
import { SUPPORTED_COUNTRIES, type CountryCode } from "@/country/country";
import { IconDropdown } from "@/components/ui/IconDropdown";
import { EgyptFlag, UAEFlag } from "@/components/icons/flags";

const COUNTRY_FLAGS: Record<CountryCode, React.ComponentType<{ className?: string }>> = {
  EG: EgyptFlag,
  AE: UAEFlag,
};

export function CountryToggle() {
  const { t } = useTranslation();
  const { country, setCountry } = useCountry();

  const options = SUPPORTED_COUNTRIES.map((code) => {
    const Flag = COUNTRY_FLAGS[code];
    return {
      code,
      label: t(`country.${code.toLowerCase()}`),
      icon: <Flag className="h-full w-full" />,
    };
  });

  return (
    <IconDropdown
      value={country}
      options={options}
      onChange={(code) => setCountry(code as CountryCode)}
      ariaLabel={t("settings.country.label")}
    />
  );
}
