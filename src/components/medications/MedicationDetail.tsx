"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { ScheduleBuilder } from "@/components/medications/ScheduleBuilder";
import { StockInput } from "@/components/medications/StockInput";
import { InteractionWarningBanner } from "@/components/medications/InteractionWarningBanner";
import type { MedicationScheduleInput, MedicationStockInput } from "@/lib/validation";
import type { InteractionFindingSummary, MedicationSummary } from "@/types";

const defaultTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export function MedicationDetail({
  medication: initialMedication,
  interactions,
}: {
  medication: MedicationSummary;
  interactions: InteractionFindingSummary[];
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [medication, setMedication] = useState(initialMedication);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);

  const existingSchedule = medication.schedules[0];
  const [dosageForm, setDosageForm] = useState(medication.dosageForm ?? "");
  const [strength, setStrength] = useState(medication.strength ?? "");
  const [endDate, setEndDate] = useState(medication.endDate?.slice(0, 10) ?? "");
  const [scheduleEnabled, setScheduleEnabled] = useState(!!existingSchedule);
  const [schedule, setSchedule] = useState<MedicationScheduleInput>({
    timesOfDay: existingSchedule?.timesOfDay ?? [],
    daysOfWeek: existingSchedule?.daysOfWeek ?? [],
    timezone: existingSchedule?.timezone ?? defaultTimezone(),
    ramadanShift: existingSchedule?.ramadanShift ?? false,
  });
  const [stockEnabled, setStockEnabled] = useState(!!medication.stock);
  const [stock, setStock] = useState<MedicationStockInput>({
    quantityOnHand: medication.stock?.quantityOnHand ?? 30,
    unit: medication.stock?.unit ?? "tablets",
    lowStockThreshold: medication.stock?.lowStockThreshold ?? 5,
  });

  const name = medication.drugCatalog?.tradeName ?? medication.customName ?? "—";

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/medications/${medication.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dosageForm: dosageForm.trim() || null,
        strength: strength.trim() || null,
        endDate: endDate || null,
        schedule:
          scheduleEnabled && schedule.timesOfDay.length > 0
            ? { ...schedule, active: true }
            : existingSchedule
              ? { active: false }
              : undefined,
        stock: stockEnabled ? stock : undefined,
      }),
    });
    setSaving(false);
    if (!res.ok) return;

    const data = (await res.json()) as { medication: MedicationSummary };
    setMedication(data.medication);
    setEditing(false);
    setSaved(true);
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/medications/${medication.id}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) return;
    router.push("/medications");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{name}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {[medication.dosageForm, medication.strength].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditing((v) => !v)}>
            {t("medications.detail.editButton")}
          </Button>
          <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
            {t("medications.detail.deleteButton")}
          </Button>
        </div>
      </div>

      {saved && !editing && (
        <p className="text-sm text-green-600 dark:text-green-400">{t("medications.detail.savedSuccess")}</p>
      )}

      {interactions.length > 0 && (
        <div className="flex flex-col gap-2">
          {interactions.map((finding, i) => (
            <InteractionWarningBanner key={i} finding={finding} />
          ))}
        </div>
      )}

      {confirmingDelete && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <p>{t("medications.detail.deleteConfirm")}</p>
          <div className="mt-2 flex gap-2">
            <Button variant="danger" disabled={deleting} onClick={handleDelete}>
              {deleting && <Spinner className="h-4 w-4" />}
              {t("medications.detail.deleteButton")}
            </Button>
            <Button variant="ghost" onClick={() => setConfirmingDelete(false)}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      )}

      {editing ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              id="edit-dosage-form"
              label={t("medications.add.dosageFormLabel")}
              value={dosageForm}
              onChange={(e) => setDosageForm(e.target.value)}
            />
            <Input
              id="edit-strength"
              label={t("medications.add.strengthLabel")}
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
            />
            <Input
              id="edit-end-date"
              type="date"
              label={t("medications.add.endDateLabel")}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">
            <input
              type="checkbox"
              checked={scheduleEnabled}
              onChange={(e) => setScheduleEnabled(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-700"
            />
            {t("medications.add.scheduleTitle")}
          </label>
          {scheduleEnabled && <ScheduleBuilder value={schedule} onChange={setSchedule} />}

          <label className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">
            <input
              type="checkbox"
              checked={stockEnabled}
              onChange={(e) => setStockEnabled(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-700"
            />
            {t("medications.add.stockToggle")}
          </label>
          {stockEnabled && <StockInput value={stock} onChange={setStock} />}

          <Button onClick={handleSave} disabled={saving} className="self-start">
            {saving && <Spinner className="h-4 w-4" />}
            {t("medications.detail.saveButton")}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            {t("medications.detail.addedVia")}:{" "}
            {medication.addedVia === "MANUAL"
              ? t("medications.detail.addedViaManual")
              : t("medications.detail.addedViaBarcode")}
          </p>
          {existingSchedule && (
            <p>
              {t("medications.card.schedule")}: {existingSchedule.timesOfDay.join(", ")}
            </p>
          )}
          {medication.stock && (
            <p>
              {t("medications.card.stock")}: {medication.stock.quantityOnHand} {medication.stock.unit}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
