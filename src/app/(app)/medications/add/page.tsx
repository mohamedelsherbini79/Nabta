import { getSessionUser } from "@/lib/session";
import { getActivePatientProfile } from "@/lib/family";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { AddMedicationFlow } from "@/components/medications/AddMedicationFlow";

export default async function AddMedicationPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        <TranslatedText k="medications.add.title" />
      </h1>
      <AddMedicationFlow patientProfileId={profile.id} />
    </div>
  );
}
