"use client";

import { createContext, useCallback, useMemo } from "react";
import { type CountryCode, COUNTRY_INFO } from "./country";

export type { CountryCode } from "./country";

interface CountryContextValue {
  country: CountryCode;
  info: (typeof COUNTRY_INFO)[CountryCode];
  setCountry: (country: CountryCode) => void;
}

export const CountryContext = createContext<CountryContextValue | null>(null);

export function CountryProvider({
  country,
  children,
}: {
  country: CountryCode;
  children: React.ReactNode;
}) {
  const setCountry = useCallback((next: CountryCode) => {
    document.cookie = `country=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.location.reload();
  }, []);

  const value = useMemo<CountryContextValue>(
    () => ({ country, info: COUNTRY_INFO[country], setCountry }),
    [country, setCountry],
  );

  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
}
