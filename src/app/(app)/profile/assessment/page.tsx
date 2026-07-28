import { getSessionUser } from "@/lib/session";
import { getActivePatientProfile } from "@/lib/family";
import { getLatestSelfAssessment } from "@/lib/selfAssessment";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { SelfAssessmentForm } from "@/components/assessment/SelfAssessmentForm";

export default async function SelfAssessmentPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  const latest = await getLatestSelfAssessment(profile.id);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="assessment.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="assessment.subtitle" />
        </p>
      </div>
      <SelfAssessmentForm
        patientProfileId={profile.id}
        initial={{
          dob: profile.dob ? profile.dob.toISOString().slice(0, 10) : null,
          sex: profile.sex,
          bloodType: profile.bloodType,
          heightCm: latest?.heightCm ?? profile.heightCm,
          weightKg: latest?.weightKg ?? profile.weightKg,
          chronicConditions: profile.chronicConditions,
          allergies: profile.allergies,
        }}
      />
    </div>
  );
}
