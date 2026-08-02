import { getSessionUser } from "@/lib/session";
import { getActivePatientProfile } from "@/lib/family";
import { getGeneticInsights, getGeneticProfile, toGeneticProfileSummary } from "@/lib/genetics";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { GeneticProfileManager } from "@/components/genetics/GeneticProfileManager";
import { DrugGeneCheckPanel } from "@/components/genetics/DrugGeneCheckPanel";
import { GeneticInsightsCard } from "@/components/genetics/GeneticInsightsCard";

export default async function GeneticsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  const geneticProfile = await getGeneticProfile(profile.id);
  const summary = geneticProfile ? toGeneticProfileSummary(geneticProfile) : null;
  const insights = getGeneticInsights(summary?.variants ?? []);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="genetics.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="genetics.subtitle" />
        </p>
      </div>

      <GeneticInsightsCard insights={insights} />
      <DrugGeneCheckPanel patientProfileId={profile.id} />
      <GeneticProfileManager patientProfileId={profile.id} initialProfile={summary} />
    </div>
  );
}
