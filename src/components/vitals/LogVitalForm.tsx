"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { VitalRecordSummary, VitalsType, VitalValue } from "@/types";

export function LogVitalForm({
  patientProfileId,
  type,
  onCreated,
}: {
  patientProfileId: string;
  type: VitalsType;
  onCreated: (record: VitalRecordSummary) => void;
}) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [glucoseValue, setGlucoseValue] = useState("");
  const [glucoseUnit, setGlucoseUnit] = useState<"MG_DL" | "MMOL_L">("MG_DL");
  const [glucoseContext, setGlucoseContext] = useState<"FASTING" | "POSTPRANDIAL" | "RANDOM">("FASTING");
  const [tempValue, setTempValue] = useState("");
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C");
  const [weightValue, setWeightValue] = useState("");
  const [weightUnit, setWeightUnit] = useState<"KG" | "LB">("KG");
  const [spo2Value, setSpo2Value] = useState("");
  const [heartRateValue, setHeartRateValue] = useState("");

  function buildValue(): VitalValue | null {
    switch (type) {
      case "BLOOD_PRESSURE": {
        if (!systolic || !diastolic) return null;
        return { systolic: Number(systolic), diastolic: Number(diastolic) };
      }
      case "GLUCOSE": {
        if (!glucoseValue) return null;
        return { value: Number(glucoseValue), unit: glucoseUnit, context: glucoseContext };
      }
      case "TEMPERATURE": {
        if (!tempValue) return null;
        return { value: Number(tempValue), unit: tempUnit };
      }
      case "WEIGHT": {
        if (!weightValue) return null;
        return { value: Number(weightValue), unit: weightUnit };
      }
      case "SPO2": {
        if (!spo2Value) return null;
        return { value: Number(spo2Value) };
      }
      case "HEART_RATE": {
        if (!heartRateValue) return null;
        return { value: Number(heartRateValue) };
      }
    }
  }

  function resetFields() {
    setSystolic("");
    setDiastolic("");
    setGlucoseValue("");
    setTempValue("");
    setWeightValue("");
    setSpo2Value("");
    setHeartRateValue("");
  }

  async function handleSubmit() {
    const value = buildValue();
    if (!value) {
      setError(t("vitals.form.missingValue"));
      return;
    }

    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/vitals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientProfileId, input: { type, value } }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(t("vitals.form.error"));
      return;
    }

    const data = (await res.json()) as { record: VitalRecordSummary };
    onCreated(data.record);
    resetFields();
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {type === "BLOOD_PRESSURE" && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="vitals-systolic"
            type="number"
            min={40}
            max={300}
            label={t("vitals.field.systolic")}
            value={systolic}
            onChange={(e) => setSystolic(e.target.value)}
          />
          <Input
            id="vitals-diastolic"
            type="number"
            min={20}
            max={200}
            label={t("vitals.field.diastolic")}
            value={diastolic}
            onChange={(e) => setDiastolic(e.target.value)}
          />
        </div>
      )}

      {type === "GLUCOSE" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            id="vitals-glucose"
            type="number"
            min={20}
            max={700}
            label={t("vitals.field.glucose")}
            value={glucoseValue}
            onChange={(e) => setGlucoseValue(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("vitals.field.unit")}</label>
            <select
              value={glucoseUnit}
              onChange={(e) => setGlucoseUnit(e.target.value as typeof glucoseUnit)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="MG_DL">mg/dL</option>
              <option value="MMOL_L">mmol/L</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("vitals.field.context")}</label>
            <select
              value={glucoseContext}
              onChange={(e) => setGlucoseContext(e.target.value as typeof glucoseContext)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="FASTING">{t("vitals.context.fasting")}</option>
              <option value="POSTPRANDIAL">{t("vitals.context.postprandial")}</option>
              <option value="RANDOM">{t("vitals.context.random")}</option>
            </select>
          </div>
        </div>
      )}

      {type === "TEMPERATURE" && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="vitals-temp"
            type="number"
            step="0.1"
            min={25}
            max={45}
            label={t("vitals.field.temperature")}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("vitals.field.unit")}</label>
            <select
              value={tempUnit}
              onChange={(e) => setTempUnit(e.target.value as typeof tempUnit)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="C">°C</option>
              <option value="F">°F</option>
            </select>
          </div>
        </div>
      )}

      {type === "WEIGHT" && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="vitals-weight"
            type="number"
            step="0.1"
            min={1}
            max={400}
            label={t("vitals.field.weight")}
            value={weightValue}
            onChange={(e) => setWeightValue(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("vitals.field.unit")}</label>
            <select
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value as typeof weightUnit)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="KG">kg</option>
              <option value="LB">lb</option>
            </select>
          </div>
        </div>
      )}

      {type === "SPO2" && (
        <Input
          id="vitals-spo2"
          type="number"
          min={50}
          max={100}
          label={t("vitals.field.spo2")}
          value={spo2Value}
          onChange={(e) => setSpo2Value(e.target.value)}
        />
      )}

      {type === "HEART_RATE" && (
        <Input
          id="vitals-heart-rate"
          type="number"
          min={20}
          max={250}
          label={t("vitals.field.heartRate")}
          value={heartRateValue}
          onChange={(e) => setHeartRateValue(e.target.value)}
        />
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Button onClick={handleSubmit} disabled={submitting} className="self-start">
        {submitting && <Spinner className="h-4 w-4" />}
        {submitting ? t("vitals.form.submitting") : t("vitals.form.submit")}
      </Button>
    </div>
  );
}
