// Pure, client-safe pricing helper — deliberately kept out of src/lib/pharmacy.ts
// (which imports prisma), same reasoning as bmi.ts and vitalsRange.ts.
//
// This platform has no real pharmacy price feed. Prices are deterministic
// demo values derived from the drug's id, kept stable across renders, and
// must always be presented to the user as illustrative demo pricing — never
// as real pharmacy prices. The catalog itself stays global (the same branded
// medications are sold under the same names in both countries, and a drug
// interaction is a pharmacological fact, not a country-dependent one) — only
// the price band scales per country/currency.

import type { CountryCode } from "@/country/country";

const PRICE_RANGE_BY_COUNTRY: Record<CountryCode, { base: number; span: number }> = {
  EG: { base: 20, span: 131 }, // ~20-150 EGP
  AE: { base: 15, span: 46 }, // ~15-60 AED
};

export function mockDrugPrice(drugCatalogId: string, country: CountryCode): number {
  let hash = 0;
  for (let i = 0; i < drugCatalogId.length; i++) {
    hash = (hash * 31 + drugCatalogId.charCodeAt(i)) >>> 0;
  }
  const { base, span } = PRICE_RANGE_BY_COUNTRY[country];
  return base + (hash % span);
}
