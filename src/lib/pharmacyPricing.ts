// Pure, client-safe pricing helper — deliberately kept out of src/lib/pharmacy.ts
// (which imports prisma), same reasoning as bmi.ts and vitalsRange.ts.
//
// This platform has no real pharmacy price feed. Prices are deterministic
// demo values derived from the drug's id, kept stable across renders, and
// must always be presented to the user as illustrative demo pricing — never
// as real pharmacy prices.

export function mockDrugPriceEGP(drugCatalogId: string): number {
  let hash = 0;
  for (let i = 0; i < drugCatalogId.length; i++) {
    hash = (hash * 31 + drugCatalogId.charCodeAt(i)) >>> 0;
  }
  return 20 + (hash % 131);
}
