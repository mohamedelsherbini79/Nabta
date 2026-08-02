// Pure, client-safe country reference data — mirrors src/i18n/locale.ts.
// Adding a country: add the code here, add its COUNTRY_INFO entry, add
// country.<code> to all 6 dictionaries, and seed its HealthFacility/doctor
// rows (see prisma/seed.ts).

export type CountryCode = "EG" | "AE";

export const SUPPORTED_COUNTRIES: CountryCode[] = ["EG", "AE"];

export const DEFAULT_COUNTRY: CountryCode = "EG";

export interface CountryInfo {
  flag: string;
  currency: string;
  // Emergency numbers are plain facts, not translated strings.
  ambulance: string;
  police: string;
}

export const COUNTRY_INFO: Record<CountryCode, CountryInfo> = {
  EG: { flag: "🇪🇬", currency: "EGP", ambulance: "123", police: "122" },
  AE: { flag: "🇦🇪", currency: "AED", ambulance: "998", police: "999" },
};

export function isSupportedCountry(value: string | undefined): value is CountryCode {
  return !!value && (SUPPORTED_COUNTRIES as string[]).includes(value);
}
