import { getSessionUser } from "@/lib/session";
import { getActivePatientProfile } from "@/lib/family";
import { getCorrelatedMedicationNames, getRecentSymptomLogs } from "@/lib/symptoms";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { SymptomLogForm } from "@/components/symptoms/SymptomLogForm";
import { SeverityTrendChart } from "@/components/symptoms/SeverityTrendChart";
import { SymptomLogList } from "@/components/symptoms/SymptomLogList";
import type { SymptomLogSummary } from "@/types";

export default async function SymptomsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  const logs = await getRecentSymptomLogs(profile.id, 30);
  const medications: string[][] = [];
  for (const log of logs) {
    medications.push(await getCorrelatedMedicationNames(profile.id, log.loggedAt));
  }
  const summaries: SymptomLogSummary[] = logs.map((log, i) => ({
    id: log.id,
    loggedAt: log.loggedAt.toISOString(),
    severity: log.severity,
    tags: log.tags,
    note: log.note,
    medications: medications[i],
  }));

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="symptoms.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="symptoms.subtitle" />
        </p>
      </div>

      <SymptomLogForm patientProfileId={profile.id} />

      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <TranslatedText k="symptoms.chart.title" />
        </h2>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <SeverityTrendChart logs={summaries} />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <TranslatedText k="symptoms.list.title" />
        </h2>
        <SymptomLogList logs={summaries} />
      </section>
    </div>
  );
}
