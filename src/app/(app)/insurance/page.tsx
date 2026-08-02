import { getSessionUser } from "@/lib/session";
import { getActivePatientProfile } from "@/lib/family";
import { getPoliciesForProfile, toInsurancePolicySummary } from "@/lib/insurance";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { PolicyForm } from "@/components/insurance/PolicyForm";
import { PolicyList } from "@/components/insurance/PolicyList";

export default async function InsurancePage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  const policies = await getPoliciesForProfile(profile.id);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="insurance.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="insurance.subtitle" />
        </p>
      </div>

      <PolicyForm patientProfileId={profile.id} />

      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <TranslatedText k="insurance.myPolicies" />
        </h2>
        <PolicyList policies={policies.map(toInsurancePolicySummary)} />
      </section>
    </div>
  );
}
