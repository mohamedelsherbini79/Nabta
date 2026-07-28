import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import {
  getActiveMedicationsForProfile,
  getTodaysDosesForProfile,
  toDoseSummary,
  toMedicationSummary,
} from "@/lib/medications";
import { getActivePatientProfile } from "@/lib/family";
import { topUpAllSchedulesForProfile } from "@/lib/doseGeneration";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { MedicationCard } from "@/components/medications/MedicationCard";
import { TodaysDoseChecklist } from "@/components/medications/TodaysDoseChecklist";

export default async function MedicationsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  await topUpAllSchedulesForProfile(profile.id);
  const medications = await getActiveMedicationsForProfile(profile.id);
  const doses = await getTodaysDosesForProfile(profile.id);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            <TranslatedText k="medications.title" />
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <TranslatedText k="medications.subtitle" />
          </p>
        </div>
        <Link
          href="/medications/add"
          className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          <TranslatedText k="medications.addButton" />
        </Link>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <TranslatedText k="medications.today.title" />
        </h2>
        <TodaysDoseChecklist initialDoses={doses.map(toDoseSummary)} />
      </section>

      <section>
        {medications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 py-12 text-center">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              <TranslatedText k="medications.empty.title" />
            </p>
            <p className="text-sm text-zinc-400">
              <TranslatedText k="medications.empty.subtitle" />
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {medications.map((m) => (
              <MedicationCard key={m.id} medication={toMedicationSummary(m)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
