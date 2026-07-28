"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { TagListInput } from "@/components/ui/TagListInput";
import { computeBmi, getBmiCategory } from "@/lib/bmi";
import type { SelfAssessmentInput } from "@/lib/validation";

const SEX_OPTIONS = ["MALE", "FEMALE", "OTHER"] as const;
const SMOKING_OPTIONS = ["NONE", "OCCASIONAL", "REGULAR"] as const;
const ALCOHOL_OPTIONS = ["NONE", "OCCASIONAL", "REGULAR"] as const;
const ACTIVITY_OPTIONS = ["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE"] as const;
const GOAL_OPTIONS = [
  "WEIGHT_LOSS",
  "MUSCLE_GAIN",
  "BETTER_SLEEP",
  "STRESS_REDUCTION",
  "GENERAL_WELLNESS",
  "MANAGE_CONDITION",
] as const;

const GOAL_KEYS: Record<(typeof GOAL_OPTIONS)[number], string> = {
  WEIGHT_LOSS: "assessment.goal.weightLoss",
  MUSCLE_GAIN: "assessment.goal.muscleGain",
  BETTER_SLEEP: "assessment.goal.betterSleep",
  STRESS_REDUCTION: "assessment.goal.stressReduction",
  GENERAL_WELLNESS: "assessment.goal.generalWellness",
  MANAGE_CONDITION: "assessment.goal.manageCondition",
};

interface InitialValues {
  dob: string | null;
  sex: string | null;
  bloodType: string | null;
  heightCm: number | null;
  weightKg: number | null;
  chronicConditions: string[];
  allergies: string[];
}

export function SelfAssessmentForm({
  patientProfileId,
  initial,
}: {
  patientProfileId: string;
  initial: InitialValues;
}) {
  const { t } = useTranslation();
  const router = useRouter();

  const [dob, setDob] = useState(initial.dob ?? "");
  const [sex, setSex] = useState<(typeof SEX_OPTIONS)[number] | "">(
    (initial.sex as (typeof SEX_OPTIONS)[number]) ?? "",
  );
  const [bloodType, setBloodType] = useState(initial.bloodType ?? "");
  const [heightCm, setHeightCm] = useState(initial.heightCm?.toString() ?? "");
  const [weightKg, setWeightKg] = useState(initial.weightKg?.toString() ?? "");
  const [chronicConditions, setChronicConditions] = useState(initial.chronicConditions);
  const [allergies, setAllergies] = useState(initial.allergies);
  const [smoking, setSmoking] = useState<(typeof SMOKING_OPTIONS)[number] | "">("");
  const [alcohol, setAlcohol] = useState<(typeof ALCOHOL_OPTIONS)[number] | "">("");
  const [physicalActivity, setPhysicalActivity] = useState<(typeof ACTIVITY_OPTIONS)[number] | "">("");
  const [goals, setGoals] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const livePreview = useMemo(() => {
    const h = Number(heightCm);
    const w = Number(weightKg);
    if (!h || !w) return null;
    const bmi = computeBmi(h, w);
    return { bmi, category: getBmiCategory(bmi) };
  }, [heightCm, weightKg]);

  function toggleGoal(goal: string) {
    setGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const input: Partial<SelfAssessmentInput> = {
      dob: dob ? new Date(dob) : null,
      sex: sex || null,
      bloodType: bloodType.trim() || null,
      heightCm: heightCm ? Number(heightCm) : null,
      weightKg: weightKg ? Number(weightKg) : null,
      chronicConditions,
      allergies,
      lifestyle: {
        ...(smoking ? { smoking } : {}),
        ...(alcohol ? { alcohol } : {}),
        ...(physicalActivity ? { physicalActivity } : {}),
      },
      goals: goals as SelfAssessmentInput["goals"],
    };

    const res = await fetch("/api/self-assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientProfileId, input }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(t("assessment.error"));
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input id="dob" type="date" label={t("assessment.dobLabel")} value={dob} onChange={(e) => setDob(e.target.value)} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("assessment.sexLabel")}</label>
          <div className="flex gap-1.5">
            {SEX_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSex(option)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  sex === option
                    ? "bg-teal-600 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {t(`assessment.sex.${option.toLowerCase()}`)}
              </button>
            ))}
          </div>
        </div>
        <Input
          id="bloodType"
          label={t("assessment.bloodTypeLabel")}
          placeholder={t("assessment.bloodTypePlaceholder")}
          value={bloodType}
          onChange={(e) => setBloodType(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          id="heightCm"
          type="number"
          min={30}
          max={280}
          label={t("assessment.heightLabel")}
          value={heightCm}
          onChange={(e) => setHeightCm(e.target.value)}
        />
        <Input
          id="weightKg"
          type="number"
          min={2}
          max={400}
          label={t("assessment.weightLabel")}
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
        />
      </div>

      {livePreview && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t("assessment.bmiPreview")}: <span className="font-medium text-zinc-800 dark:text-zinc-200">{livePreview.bmi}</span>{" "}
          ({t(`healthScore.bmi.${livePreview.category.toLowerCase()}`)})
        </p>
      )}

      <TagListInput
        label={t("assessment.chronicConditionsLabel")}
        value={chronicConditions}
        onChange={setChronicConditions}
        placeholder={t("assessment.addPlaceholder")}
      />
      <TagListInput
        label={t("assessment.allergiesLabel")}
        value={allergies}
        onChange={setAllergies}
        placeholder={t("assessment.addPlaceholder")}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("assessment.smokingLabel")}</label>
          <select
            value={smoking}
            onChange={(e) => setSmoking(e.target.value as typeof smoking)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">—</option>
            {SMOKING_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {t(`assessment.frequency.${o.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("assessment.alcoholLabel")}</label>
          <select
            value={alcohol}
            onChange={(e) => setAlcohol(e.target.value as typeof alcohol)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">—</option>
            {ALCOHOL_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {t(`assessment.frequency.${o.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("assessment.physicalActivityLabel")}
          </label>
          <select
            value={physicalActivity}
            onChange={(e) => setPhysicalActivity(e.target.value as typeof physicalActivity)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">—</option>
            {ACTIVITY_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {t(`assessment.activity.${o.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("assessment.goalsLabel")}</label>
        <div className="flex flex-wrap gap-1.5">
          {GOAL_OPTIONS.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => toggleGoal(goal)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                goals.includes(goal)
                  ? "bg-teal-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {t(GOAL_KEYS[goal])}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Button onClick={handleSubmit} disabled={submitting} className="self-start">
        {submitting && <Spinner className="h-4 w-4" />}
        {submitting ? t("assessment.submitting") : t("assessment.submit")}
      </Button>
    </div>
  );
}
