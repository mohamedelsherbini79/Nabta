import { getSessionUser } from "@/lib/session";
import { getConsultationsForDoctor, toDoctorConsultationSummary } from "@/lib/consultations";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { DoctorConsultationList } from "@/components/consultations/DoctorConsultationList";

export default async function DoctorConsultationsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const consultations = await getConsultationsForDoctor(user.id);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="doctor.consultations.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="doctor.consultations.subtitle" />
        </p>
      </div>

      <DoctorConsultationList consultations={consultations.map(toDoctorConsultationSummary)} now={new Date().toISOString()} />
    </div>
  );
}
