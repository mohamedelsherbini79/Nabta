import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { getActivePatientProfile } from "@/lib/family";
import { getLatestSelfAssessment } from "@/lib/selfAssessment";
import { computeHealthScore } from "@/lib/healthScore";
import { getBmiCategory } from "@/lib/bmi";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { HealthScoreCard } from "@/components/dashboard/HealthScoreCard";
import { BmiSummaryCard } from "@/components/dashboard/BmiSummaryCard";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  const { score, breakdown } = await computeHealthScore(profile.id);
  const latestAssessment = await getLatestSelfAssessment(profile.id);

  const bmi = latestAssessment?.bmi ?? null;

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            <TranslatedText k="dashboard.title" />
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <TranslatedText k="dashboard.subtitle" />
          </p>
        </div>
        <Link
          href="/profile/assessment"
          className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          <TranslatedText k="dashboard.retakeAssessment" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <HealthScoreCard score={score} breakdown={breakdown} />
        <BmiSummaryCard bmi={bmi} category={bmi !== null ? getBmiCategory(bmi) : null} />
      </div>
    </div>
  );
}
