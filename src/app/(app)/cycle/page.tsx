import { getSessionUser } from "@/lib/session";
import { getActivePatientProfile } from "@/lib/family";
import { getRecentCycleEntries } from "@/lib/cycle";
import { predictNextCycle } from "@/lib/cyclePrediction";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { CyclePredictionCard } from "@/components/cycle/CyclePredictionCard";
import { CycleLogForm } from "@/components/cycle/CycleLogForm";
import { CycleHistoryList } from "@/components/cycle/CycleHistoryList";
import type { CycleEntrySummary } from "@/types";

export default async function CycleTrackerPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  const entries = await getRecentCycleEntries(profile.id);
  const prediction = predictNextCycle(entries.map((e) => ({ startDate: e.startDate, endDate: e.endDate })));
  const summaries: CycleEntrySummary[] = entries.map((e) => ({
    id: e.id,
    startDate: e.startDate.toISOString().slice(0, 10),
    endDate: e.endDate ? e.endDate.toISOString().slice(0, 10) : null,
    flow: e.flow as CycleEntrySummary["flow"],
    symptoms: e.symptoms,
  }));

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="cycle.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="cycle.subtitle" />
        </p>
      </div>

      <CyclePredictionCard prediction={prediction} />

      <CycleLogForm patientProfileId={profile.id} />

      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <TranslatedText k="cycle.history.title" />
        </h2>
        <CycleHistoryList entries={summaries} />
      </section>
    </div>
  );
}
