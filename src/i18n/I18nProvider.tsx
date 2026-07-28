"use client";

import { createContext, useCallback, useMemo } from "react";
import { type Locale, dictionaries } from "./locale";

export type { Locale } from "./locale";

interface I18nContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const setLocale = useCallback((next: Locale) => {
    document.cookie = `locale=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.location.reload();
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[locale];
    return {
      locale,
      dir: locale === "ar" ? "rtl" : "ltr",
      t: (key: string) => dict[key] ?? key,
      setLocale,
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
