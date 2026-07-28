"use client";

import { useTranslation } from "@/i18n/useTranslation";

export function TranslatedText({ k }: { k: string }) {
  const { t } = useTranslation();
  return <>{t(k)}</>;
}
