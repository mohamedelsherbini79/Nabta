import { getSessionUser } from "@/lib/session";
import { getActivePatientProfile } from "@/lib/family";
import { getReportsForProfile, toReportSummary } from "@/lib/reports";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { GenerateReportButton } from "@/components/reports/GenerateReportButton";
import { ReportList } from "@/components/reports/ReportList";

export default async function ReportsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  const reports = await getReportsForProfile(profile.id);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="reports.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="reports.subtitle" />
        </p>
      </div>

      <GenerateReportButton patientProfileId={profile.id} />

      <ReportList reports={reports.map(toReportSummary)} />
    </div>
  );
}
