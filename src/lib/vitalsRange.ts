// Pure, client-safe vitals helpers — deliberately kept out of src/lib/vitals.ts
// so client components can import them without dragging in the Prisma/pg module
// graph (same reasoning as src/lib/bmi.ts).
//
// Classifications are informational bands only (mirrors how BMI categories are
// presented elsewhere in the app) — not a diagnosis. Keep language and ranges
// conservative; the Gemini system prompt and UI disclaimers carry the actual
// medical-safety framing.

import type {
  BloodPressureValue,
  GlucoseValue,
  HeartRateValue,
  Spo2Value,
  TemperatureValue,
  VitalsType,
  VitalValue,
  WeightValue,
} from "@/types";

export type VitalRangeLevel = "LOW" | "NORMAL" | "ELEVATED" | "HIGH" | "CRITICAL";

export const VITAL_TYPES: VitalsType[] = [
  "BLOOD_PRESSURE",
  "GLUCOSE",
  "TEMPERATURE",
  "WEIGHT",
  "SPO2",
  "HEART_RATE",
];

export function classifyBloodPressure(v: BloodPressureValue): VitalRangeLevel {
  const { systolic: s, diastolic: d } = v;
  if (s >= 180 || d >= 120) return "CRITICAL";
  if (s >= 140 || d >= 90) return "HIGH";
  if (s >= 130 || d >= 80) return "ELEVATED";
  if (s < 90 || d < 60) return "LOW";
  return "NORMAL";
}

function glucoseToMgDl(v: GlucoseValue): number {
  return v.unit === "MMOL_L" ? v.value * 18 : v.value;
}

export function classifyGlucose(v: GlucoseValue): VitalRangeLevel {
  const mgdl = glucoseToMgDl(v);
  if (mgdl < 70) return "LOW";
  const isPostprandialOrRandom = v.context === "POSTPRANDIAL" || v.context === "RANDOM";
  if (isPostprandialOrRandom) {
    if (mgdl >= 200) return "HIGH";
    if (mgdl >= 140) return "ELEVATED";
    return "NORMAL";
  }
  if (mgdl >= 126) return "HIGH";
  if (mgdl >= 100) return "ELEVATED";
  return "NORMAL";
}

function tempToC(v: TemperatureValue): number {
  return v.unit === "F" ? ((v.value - 32) * 5) / 9 : v.value;
}

export function classifyTemperature(v: TemperatureValue): VitalRangeLevel {
  const c = tempToC(v);
  if (c >= 39) return "CRITICAL";
  if (c >= 37.8) return "HIGH";
  if (c >= 37.3) return "ELEVATED";
  if (c < 35) return "LOW";
  return "NORMAL";
}

export function classifySpo2(v: Spo2Value): VitalRangeLevel {
  if (v.value < 90) return "CRITICAL";
  if (v.value < 95) return "LOW";
  return "NORMAL";
}

export function classifyHeartRate(v: HeartRateValue): VitalRangeLevel {
  if (v.value > 120) return "CRITICAL";
  if (v.value > 100) return "HIGH";
  if (v.value < 60) return "LOW";
  return "NORMAL";
}

export function classifyVital(type: VitalsType, value: VitalValue): VitalRangeLevel | null {
  switch (type) {
    case "BLOOD_PRESSURE":
      return classifyBloodPressure(value as BloodPressureValue);
    case "GLUCOSE":
      return classifyGlucose(value as GlucoseValue);
    case "TEMPERATURE":
      return classifyTemperature(value as TemperatureValue);
    case "SPO2":
      return classifySpo2(value as Spo2Value);
    case "HEART_RATE":
      return classifyHeartRate(value as HeartRateValue);
    case "WEIGHT":
      return null;
  }
}

// A single sortable number per type, used for sparklines/trend arrows —
// e.g. blood pressure sorts on systolic.
export function primaryMetric(type: VitalsType, value: VitalValue): number {
  switch (type) {
    case "BLOOD_PRESSURE":
      return (value as BloodPressureValue).systolic;
    case "GLUCOSE":
      return glucoseToMgDl(value as GlucoseValue);
    case "TEMPERATURE":
      return tempToC(value as TemperatureValue);
    case "WEIGHT":
      return (value as WeightValue).value;
    case "SPO2":
      return (value as Spo2Value).value;
    case "HEART_RATE":
      return (value as HeartRateValue).value;
  }
}

export function formatVitalValue(type: VitalsType, value: VitalValue): string {
  switch (type) {
    case "BLOOD_PRESSURE": {
      const v = value as BloodPressureValue;
      return `${v.systolic}/${v.diastolic}`;
    }
    case "GLUCOSE":
      return String((value as GlucoseValue).value);
    case "TEMPERATURE":
      return String((value as TemperatureValue).value);
    case "WEIGHT":
      return String((value as WeightValue).value);
    case "SPO2":
      return String((value as Spo2Value).value);
    case "HEART_RATE":
      return String((value as HeartRateValue).value);
  }
}

export function vitalUnitLabel(type: VitalsType, value: VitalValue): string {
  switch (type) {
    case "BLOOD_PRESSURE":
      return "mmHg";
    case "GLUCOSE":
      return (value as GlucoseValue).unit === "MMOL_L" ? "mmol/L" : "mg/dL";
    case "TEMPERATURE":
      return (value as TemperatureValue).unit === "F" ? "°F" : "°C";
    case "WEIGHT":
      return (value as WeightValue).unit === "LB" ? "lb" : "kg";
    case "SPO2":
      return "%";
    case "HEART_RATE":
      return "bpm";
  }
}
