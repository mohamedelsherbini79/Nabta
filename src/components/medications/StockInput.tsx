"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import type { MedicationStockInput } from "@/lib/validation";

export function StockInput({
  value,
  onChange,
}: {
  value: MedicationStockInput;
  onChange: (next: MedicationStockInput) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Input
        id="stock-quantity"
        type="number"
        min={0}
        label={t("medications.add.quantityLabel")}
        value={value.quantityOnHand}
        onChange={(e) => onChange({ ...value, quantityOnHand: Number(e.target.value) })}
      />
      <Input
        id="stock-unit"
        label={t("medications.add.unitLabel")}
        placeholder={t("medications.add.unitPlaceholder")}
        value={value.unit}
        onChange={(e) => onChange({ ...value, unit: e.target.value })}
      />
      <Input
        id="stock-threshold"
        type="number"
        min={0}
        label={t("medications.add.lowStockThresholdLabel")}
        value={value.lowStockThreshold}
        onChange={(e) => onChange({ ...value, lowStockThreshold: Number(e.target.value) })}
      />
    </div>
  );
}
