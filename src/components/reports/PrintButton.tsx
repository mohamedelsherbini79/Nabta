"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";

export function PrintButton() {
  const { t } = useTranslation();

  return (
    <Button onClick={() => window.print()} className="print:hidden">
      {t("reports.printButton")}
    </Button>
  );
}
