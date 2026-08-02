import { getSessionUser } from "@/lib/session";
import { getActivePatientProfile } from "@/lib/family";
import { getActivePregnancy, toPregnancySummary } from "@/lib/pregnancy";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { PregnancyStartForm } from "@/components/pregnancy/PregnancyStartForm";
import { PregnancyProgressCard } from "@/components/pregnancy/PregnancyProgressCard";

export default async function PregnancyPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  const active = await getActivePregnancy(profile.id);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="pregnancy.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="pregnancy.subtitle" />
        </p>
      </div>

      {active ? (
        <PregnancyProgressCard pregnancy={toPregnancySummary(active)} />
      ) : (
        <PregnancyStartForm patientProfileId={profile.id} />
      )}
    </div>
  );
}
