import type { Locale } from "@/i18n/locale";

const LOCALE_BCP47: Record<Locale, string> = {
  ar: "ar-EG",
  en: "en-US",
  zh: "zh-CN",
  hi: "hi-IN",
  es: "es-ES",
  fr: "fr-FR",
};

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_BCP47[locale]).format(value);
}

export function formatCurrency(value: number, locale: Locale, currency: string): string {
  return new Intl.NumberFormat(LOCALE_BCP47[locale], { style: "currency", currency }).format(value);
}

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(LOCALE_BCP47[locale], { dateStyle: "medium" }).format(date);
}
