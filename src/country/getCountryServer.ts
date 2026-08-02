import { cookies } from "next/headers";
import { DEFAULT_COUNTRY, isSupportedCountry, type CountryCode } from "./country";

// Shared helper for Server Components and Route Handlers that need the
// viewer's selected country — mirrors the inline cookie read in
// src/app/layout.tsx, factored out since several server files need it.
export async function getCountryFromCookies(): Promise<CountryCode> {
  const cookieStore = await cookies();
  const value = cookieStore.get("country")?.value;
  return isSupportedCountry(value) ? value : DEFAULT_COUNTRY;
}
