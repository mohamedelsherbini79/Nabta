import { getSessionUser } from "@/lib/session";
import { getInteractionFindingsForProfile } from "@/lib/medications";
import { getActivePatientProfile } from "@/lib/family";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { InteractionsReport } from "@/components/medications/InteractionsReport";

export default async function InteractionsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  const findings = await getInteractionFindingsForProfile(profile.id);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="medications.interactions.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="medications.interactions.subtitle" />
        </p>
      </div>
      <InteractionsReport findings={findings} />
    </div>
  );
}
