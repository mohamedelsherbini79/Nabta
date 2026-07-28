import en from "./dictionaries/en.json";
import ar from "./dictionaries/ar.json";
import zh from "./dictionaries/zh.json";
import hi from "./dictionaries/hi.json";
import es from "./dictionaries/es.json";
import fr from "./dictionaries/fr.json";

export type Locale = "en" | "ar" | "zh" | "hi" | "es" | "fr";

export const SUPPORTED_LOCALES: Locale[] = ["ar", "en", "zh", "hi", "es", "fr"];

export const DEFAULT_LOCALE: Locale = "ar";

// Native display names — always shown in their own script regardless of the
// current UI language, so this is a static map, not a translated string.
export const LOCALE_LABELS: Record<Locale, string> = {
  ar: "العربية",
  en: "English",
  zh: "中文",
  hi: "हिन्दी",
  es: "Español",
  fr: "Français",
};

export const dictionaries: Record<Locale, Record<string, string>> = { en, ar, zh, hi, es, fr };

export function isSupportedLocale(value: string | undefined): value is Locale {
  return !!value && (SUPPORTED_LOCALES as string[]).includes(value);
}
