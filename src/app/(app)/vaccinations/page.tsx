import { getSessionUser } from "@/lib/session";
import { getActivePatientProfile } from "@/lib/family";
import { getVaccinationsForProfile, toVaccinationRecordSummary } from "@/lib/vaccinations";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { VaccinationForm } from "@/components/vaccinations/VaccinationForm";
import { VaccinationList } from "@/components/vaccinations/VaccinationList";

export default async function VaccinationsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  const records = await getVaccinationsForProfile(profile.id);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="vaccinations.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="vaccinations.subtitle" />
        </p>
      </div>

      <VaccinationForm patientProfileId={profile.id} />

      <VaccinationList records={records.map(toVaccinationRecordSummary)} now={new Date().toISOString()} />
    </div>
  );
}
