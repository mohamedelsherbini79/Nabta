import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { getActivePatientProfile } from "@/lib/family";
import { getConsultationsForProfile, toConsultationSummary } from "@/lib/consultations";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { ConsultationList } from "@/components/consultations/ConsultationList";

export default async function ConsultationsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  const consultations = await getConsultationsForProfile(profile.id);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            <TranslatedText k="consultations.title" />
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <TranslatedText k="consultations.subtitle" />
          </p>
        </div>
        <Link
          href="/consultations/book"
          className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          <TranslatedText k="consultations.bookButton" />
        </Link>
      </div>

      <ConsultationList consultations={consultations.map(toConsultationSummary)} now={new Date().toISOString()} />
    </div>
  );
}
