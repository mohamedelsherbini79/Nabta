"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import { DrugForm } from "@/components/admin/DrugForm";

export function NewDrugSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return (
      <Button onClick={() => setShowForm(true)} className="self-start">
        {t("admin.drugs.addNew")}
      </Button>
    );
  }

  return (
    <DrugForm
      onSaved={() => {
        setShowForm(false);
        router.refresh();
      }}
      onCancel={() => setShowForm(false)}
    />
  );
}
