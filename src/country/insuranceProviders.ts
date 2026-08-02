// Reference list of well-known insurance providers per country, for the
// policy-provider dropdown — pure, client-safe. Provider names are proper
// nouns, not translated.

import type { CountryCode } from "./country";

export const INSURANCE_PROVIDERS_BY_COUNTRY: Record<CountryCode, string[]> = {
  EG: ["Misr Insurance", "Allianz Egypt", "AXA Egypt", "MetLife Egypt", "GIG Egypt"],
  AE: ["Daman", "AXA Gulf", "Sukoon (Oman Insurance)", "Dubai Insurance", "Al Ain Ahlia"],
};
