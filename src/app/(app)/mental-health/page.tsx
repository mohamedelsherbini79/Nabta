import { getSessionUser } from "@/lib/session";
import { getActivePatientProfile } from "@/lib/family";
import { getMoodEntries, toMoodEntrySummary } from "@/lib/mentalHealth";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { MoodEntryForm } from "@/components/mentalHealth/MoodEntryForm";
import { MoodTrendChart } from "@/components/mentalHealth/MoodTrendChart";
import { MoodEntryList } from "@/components/mentalHealth/MoodEntryList";
import { Card } from "@/components/ui/Card";

export default async function MentalHealthPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  const entries = await getMoodEntries(profile.id);
  const summaries = entries.map(toMoodEntrySummary);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="mentalHealth.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="mentalHealth.subtitle" />
        </p>
      </div>

      <MoodEntryForm patientProfileId={profile.id} />

      <Card>
        <h2 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="mentalHealth.chart.title" />
        </h2>
        <MoodTrendChart entries={summaries} />
      </Card>

      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <TranslatedText k="mentalHealth.history.title" />
        </h2>
        <MoodEntryList entries={summaries} />
      </section>
    </div>
  );
}
