import { getSessionUser } from "@/lib/session";
import { getActivePatientProfile } from "@/lib/family";
import { getDemoDoctors, toDoctorSummary } from "@/lib/consultations";
import { getCountryFromCookies } from "@/country/getCountryServer";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { BookingForm } from "@/components/consultations/BookingForm";

export default async function BookConsultationPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  const country = await getCountryFromCookies();
  const doctors = await getDemoDoctors(country);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="consultations.book.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="consultations.book.subtitle" />
        </p>
      </div>

      <BookingForm patientProfileId={profile.id} doctors={doctors.map(toDoctorSummary)} />
    </div>
  );
}
