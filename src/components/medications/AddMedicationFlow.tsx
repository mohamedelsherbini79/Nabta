"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { DrugSearchAutocomplete } from "@/components/medications/DrugSearchAutocomplete";
import { BarcodeScanner } from "@/components/medications/BarcodeScanner";
import { ScheduleBuilder } from "@/components/medications/ScheduleBuilder";
import { StockInput } from "@/components/medications/StockInput";
import { InteractionWarningBanner } from "@/components/medications/InteractionWarningBanner";
import type { MedicationScheduleInput, MedicationStockInput } from "@/lib/validation";
import type { DrugCatalogEntry, InteractionFindingSummary } from "@/types";

type EntryMode = "choose" | "manual" | "barcode";

const todayISO = () => new Date().toISOString().slice(0, 10);
const defaultTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export function AddMedicationFlow({ patientProfileId }: { patientProfileId: string }) {
  const { t } = useTranslation();
  const router = useRouter();

  const [mode, setMode] = useState<EntryMode>("choose");
  const [selectedDrug, setSelectedDrug] = useState<DrugCatalogEntry | null>(null);
  const [useCustomName, setUseCustomName] = useState(false);
  const [customName, setCustomName] = useState("");
  const [addedVia, setAddedVia] = useState<"MANUAL" | "BARCODE">("MANUAL");

  const [barcodeResults, setBarcodeResults] = useState<DrugCatalogEntry[] | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [scannerKey, setScannerKey] = useState(0);

  const [dosageForm, setDosageForm] = useState("");
  const [strength, setStrength] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState("");

  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [schedule, setSchedule] = useState<MedicationScheduleInput>({
    timesOfDay: [],
    daysOfWeek: [],
    timezone: defaultTimezone(),
    ramadanShift: false,
  });

  const [stockEnabled, setStockEnabled] = useState(false);
  const [stock, setStock] = useState<MedicationStockInput>({
    quantityOnHand: 30,
    unit: "tablets",
    lowStockThreshold: 5,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultInteractions, setResultInteractions] = useState<InteractionFindingSummary[] | null>(null);

  const hasDrug = !!selectedDrug || (useCustomName && customName.trim().length > 0);

  async function handleBarcodeDecode(code: string) {
    setScannedCode(code);
    const res = await fetch(`/api/medications/catalog?barcode=${encodeURIComponent(code)}`);
    const data = (await res.json()) as { results: DrugCatalogEntry[] };
    setBarcodeResults(data.results ?? []);
  }

  function pickDrug(drug: DrugCatalogEntry, via: "MANUAL" | "BARCODE") {
    setSelectedDrug(drug);
    setUseCustomName(false);
    setAddedVia(via);
    setBarcodeResults(null);
  }

  function switchToManual() {
    setMode("manual");
    setBarcodeResults(null);
    setScannedCode(null);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const payload = {
      patientProfileId,
      drugCatalogId: useCustomName ? null : (selectedDrug?.id ?? null),
      customName: useCustomName ? customName.trim() : null,
      dosageForm: dosageForm.trim() || null,
      strength: strength.trim() || null,
      addedVia,
      startDate,
      endDate: endDate || null,
      schedule: scheduleEnabled && schedule.timesOfDay.length > 0 ? schedule : undefined,
      stock: stockEnabled ? stock : undefined,
    };

    const res = await fetch("/api/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(t("medications.add.error"));
      return;
    }

    const data = (await res.json()) as { interactions: InteractionFindingSummary[] };
    if (data.interactions && data.interactions.length > 0) {
      setResultInteractions(data.interactions);
      return;
    }

    router.push("/medications");
    router.refresh();
  }

  if (resultInteractions) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
          {t("medications.interactions.inlineWarningTitle")}
        </h2>
        {resultInteractions.map((finding, i) => (
          <InteractionWarningBanner key={i} finding={finding} />
        ))}
        <Button
          onClick={() => {
            router.push("/medications");
            router.refresh();
          }}
        >
          {t("common.confirm")}
        </Button>
      </div>
    );
  }

  if (mode === "choose") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("medications.add.chooseMethod")}</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setMode("manual")}>
            {t("medications.add.manualOption")}
          </Button>
          <Button variant="secondary" onClick={() => setMode("barcode")}>
            {t("medications.add.barcodeOption")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {!hasDrug && mode === "manual" && (
        <div className="flex flex-col gap-2">
          <DrugSearchAutocomplete onSelect={(drug) => pickDrug(drug, "MANUAL")} />
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            {t("medications.add.customNamePrompt")}{" "}
            <button
              type="button"
              onClick={() => setUseCustomName(true)}
              className="font-medium text-green-600 hover:underline"
            >
              {t("medications.add.customNameToggle")}
            </button>
          </div>
        </div>
      )}

      {!hasDrug && mode === "barcode" && (
        <div className="flex flex-col gap-3">
          {scannedCode === null && <BarcodeScanner key={scannerKey} onDecode={handleBarcodeDecode} />}

          {scannedCode !== null && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-zinc-400">
                {t("medications.barcode.scannedCode")}: {scannedCode}
              </p>
              {barcodeResults && barcodeResults.length > 0 ? (
                <ul className="flex flex-col gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
                  {barcodeResults.map((drug) => (
                    <li key={drug.id}>
                      <button
                        type="button"
                        onClick={() => pickDrug(drug, "BARCODE")}
                        className="flex w-full flex-col items-start rounded-md px-3 py-2 text-start transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {drug.tradeName}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{drug.genericName}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                  <p className="font-medium">{t("medications.barcode.notFound")}</p>
                  <p className="mt-1 opacity-90">{t("medications.barcode.notFoundHint")}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setScannedCode(null);
                    setBarcodeResults(null);
                    setScannerKey((k) => k + 1);
                  }}
                >
                  {t("medications.barcode.tryAgain")}
                </Button>
                <Button variant="ghost" onClick={switchToManual}>
                  {t("medications.barcode.switchToManual")}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {useCustomName && !selectedDrug && (
        <Input
          id="custom-name"
          label={t("medications.add.customNameLabel")}
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          autoFocus
        />
      )}

      {hasDrug && (
        <div className="flex flex-col gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
              {selectedDrug?.tradeName ?? customName}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedDrug(null);
                setUseCustomName(false);
                setCustomName("");
              }}
              className="text-xs text-green-600 hover:underline"
            >
              {t("medications.detail.editButton")}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              id="dosage-form"
              label={t("medications.add.dosageFormLabel")}
              value={dosageForm}
              onChange={(e) => setDosageForm(e.target.value)}
            />
            <Input
              id="strength"
              label={t("medications.add.strengthLabel")}
              placeholder={t("medications.add.strengthPlaceholder")}
              value={strength}
              onChange={(e) => setStrength(e.target.value)}
            />
            <Input
              id="start-date"
              type="date"
              label={t("medications.add.startDateLabel")}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              id="end-date"
              type="date"
              label={t("medications.add.endDateLabel")}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
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
          </div>

          <div className="flex flex-col gap-2">
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
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <Button onClick={handleSubmit} disabled={submitting} className="self-start">
            {submitting && <Spinner className="h-4 w-4" />}
            {submitting ? t("medications.add.submitting") : t("medications.add.submit")}
          </Button>
        </div>
      )}
    </div>
  );
}
