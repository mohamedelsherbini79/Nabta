import { getEmergencyCardData } from "@/lib/emergencyCard";
import { TranslatedText } from "@/components/i18n/TranslatedText";

export default async function PublicEmergencyCardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getEmergencyCardData(token);

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="emergencyCard.public.invalid" />
        </p>
      </div>
    );
  }

  const hasAny =
    data.bloodType || data.allergies.length > 0 || data.chronicConditions.length > 0 || data.medications.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl bg-red-600 px-4 py-3 text-center text-white">
        <p className="text-sm font-medium uppercase tracking-wide">
          <TranslatedText k="emergencyCard.public.banner" />
        </p>
        <p className="mt-1 text-2xl font-bold">{data.displayName}</p>
      </div>

      {data.bloodType && (
        <div className="rounded-xl border border-zinc-200 p-4 text-center dark:border-zinc-800">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <TranslatedText k="emergencyCard.public.bloodType" />
          </p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{data.bloodType}</p>
        </div>
      )}

      {data.allergies.length > 0 && (
        <div className="rounded-xl border-2 border-red-400 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-bold uppercase text-red-700 dark:text-red-300">
            <TranslatedText k="emergencyCard.public.allergies" />
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {data.allergies.map((allergy) => (
              <li key={allergy} className="rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white">
                {allergy}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.chronicConditions.length > 0 && (
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <TranslatedText k="emergencyCard.public.chronicConditions" />
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {data.chronicConditions.map((condition) => (
              <li
                key={condition}
                className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {condition}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.medications.length > 0 && (
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <TranslatedText k="emergencyCard.public.medications" />
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {data.medications.map((medication, i) => (
              <li key={i} className="text-sm text-zinc-900 dark:text-zinc-50">
                {medication}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(data.emergencyContactName || data.emergencyContactPhone) && (
        <div className="rounded-xl border border-green-300 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            <TranslatedText k="emergencyCard.public.emergencyContact" />
          </p>
          {data.emergencyContactName && (
            <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{data.emergencyContactName}</p>
          )}
          {data.emergencyContactPhone && (
            <a href={`tel:${data.emergencyContactPhone}`} className="text-lg font-semibold text-green-700 underline dark:text-green-300">
              {data.emergencyContactPhone}
            </a>
          )}
        </div>
      )}

      {!hasAny && (
        <p className="text-center text-sm text-zinc-400">
          <TranslatedText k="emergencyCard.public.empty" />
        </p>
      )}

      <p className="text-center text-xs text-zinc-400">
        <TranslatedText k="emergencyCard.public.disclaimer" />
      </p>
    </div>
  );
}
