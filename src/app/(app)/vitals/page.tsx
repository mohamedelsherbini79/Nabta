import { getSessionUser } from "@/lib/session";
import { getActivePatientProfile } from "@/lib/family";
import { getVitalsForProfile, toVitalRecordSummary } from "@/lib/vitals";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { VitalsDashboard } from "@/components/vitals/VitalsDashboard";

export default async function VitalsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  const records = await getVitalsForProfile(profile.id);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="vitals.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="vitals.subtitle" />
        </p>
      </div>
      <VitalsDashboard patientProfileId={profile.id} initialRecords={records.map(toVitalRecordSummary)} />
    </div>
  );
}
