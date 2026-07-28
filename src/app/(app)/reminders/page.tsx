import { getSessionUser } from "@/lib/session";
import { getActivePatientProfile } from "@/lib/family";
import { getTodaysDosesForProfile, toDoseSummary } from "@/lib/medications";
import { topUpAllSchedulesForProfile } from "@/lib/doseGeneration";
import { getRemindersForProfile, toReminderSummary } from "@/lib/reminders";
import { resolveReminderPhone } from "@/lib/reminderDispatch";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { TodaysDoseChecklist } from "@/components/medications/TodaysDoseChecklist";
import { ReminderForm } from "@/components/reminders/ReminderForm";
import { ReminderList } from "@/components/reminders/ReminderList";

export default async function RemindersPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  await topUpAllSchedulesForProfile(profile.id);
  const doses = await getTodaysDosesForProfile(profile.id);
  const reminders = await getRemindersForProfile(profile.id);
  const phone = await resolveReminderPhone(profile.id);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="reminders.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="reminders.subtitle" />
        </p>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <TranslatedText k="medications.today.title" />
        </h2>
        <TodaysDoseChecklist initialDoses={doses.map(toDoseSummary)} />
      </section>

      <ReminderForm patientProfileId={profile.id} phone={phone} />

      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <TranslatedText k="reminders.upcoming.title" />
        </h2>
        <ReminderList reminders={reminders.map(toReminderSummary)} now={new Date().toISOString()} />
      </section>
    </div>
  );
}
