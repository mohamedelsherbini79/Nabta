import { getDoctorShareData } from "@/lib/doctorShare";
import { formatVitalValue, vitalUnitLabel } from "@/lib/vitalsRange";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import type { VitalsType } from "@/types";

const VITAL_TYPE_LABEL_KEYS: Record<VitalsType, string> = {
  BLOOD_PRESSURE: "vitals.type.bloodPressure",
  GLUCOSE: "vitals.type.glucose",
  TEMPERATURE: "vitals.type.temperature",
  WEIGHT: "vitals.type.weight",
  SPO2: "vitals.type.spo2",
  HEART_RATE: "vitals.type.heartRate",
};

export default async function PublicDoctorSharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getDoctorShareData(token);

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="shareProfile.public.invalid" />
        </p>
      </div>
    );
  }

  const hasDemographics = data.dob || data.sex || data.heightCm || data.weightKg;
  const hasAny =
    hasDemographics ||
    data.bloodType ||
    data.allergies.length > 0 ||
    data.chronicConditions.length > 0 ||
    data.medications.length > 0 ||
    data.vitals.length > 0 ||
    data.vaccinations.length > 0 ||
    data.symptoms.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl bg-teal-600 px-4 py-3 text-center text-white">
        <p className="text-sm font-medium uppercase tracking-wide">
          <TranslatedText k="shareProfile.public.banner" />
        </p>
        <p className="mt-1 text-2xl font-bold">{data.displayName}</p>
        {data.expiresAt && (
          <p className="mt-1 text-xs text-teal-100">
            <TranslatedText k="shareProfile.public.expiresAt" /> {new Date(data.expiresAt).toLocaleString()}
          </p>
        )}
      </div>

      {hasDemographics && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 sm:grid-cols-4">
          {data.dob && (
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="shareProfile.public.dob" />
              </p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{data.dob}</p>
            </div>
          )}
          {data.sex && (
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="shareProfile.public.sex" />
              </p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{data.sex}</p>
            </div>
          )}
          {data.heightCm && (
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="shareProfile.public.height" />
              </p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{data.heightCm} cm</p>
            </div>
          )}
          {data.weightKg && (
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="shareProfile.public.weight" />
              </p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{data.weightKg} kg</p>
            </div>
          )}
        </div>
      )}

      {data.bloodType && (
        <div className="rounded-xl border border-zinc-200 p-4 text-center dark:border-zinc-800">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <TranslatedText k="shareProfile.public.bloodType" />
          </p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{data.bloodType}</p>
        </div>
      )}

      {data.allergies.length > 0 && (
        <div className="rounded-xl border-2 border-red-400 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm font-bold uppercase text-red-700 dark:text-red-300">
            <TranslatedText k="shareProfile.public.allergies" />
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
            <TranslatedText k="shareProfile.public.chronicConditions" />
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
            <TranslatedText k="shareProfile.public.medications" />
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {data.medications.map((medication, i) => (
              <li key={i} className="text-sm text-zinc-900 dark:text-zinc-50">
                {medication.name}
                {(medication.strength || medication.dosageForm) && (
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {" "}
                    — {[medication.strength, medication.dosageForm].filter(Boolean).join(", ")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.vitals.length > 0 && (
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <TranslatedText k="shareProfile.public.vitals" />
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {data.vitals.map((vital) => (
              <li key={vital.id} className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">
                  <TranslatedText k={VITAL_TYPE_LABEL_KEYS[vital.type]} />
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {formatVitalValue(vital.type, vital.value)} {vitalUnitLabel(vital.type, vital.value)}
                </span>
                <span className="text-xs text-zinc-400">{new Date(vital.recordedAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.vaccinations.length > 0 && (
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <TranslatedText k="shareProfile.public.vaccinations" />
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {data.vaccinations.map((v, i) => (
              <li key={i} className="text-sm text-zinc-900 dark:text-zinc-50">
                {v.vaccineName} ({v.doseNumber})
                <span className="text-zinc-500 dark:text-zinc-400">
                  {" — "}
                  {v.administeredAt
                    ? new Date(v.administeredAt).toLocaleDateString()
                    : v.dueAt
                      ? new Date(v.dueAt).toLocaleDateString()
                      : "—"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.symptoms.length > 0 && (
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <TranslatedText k="shareProfile.public.symptoms" />
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {data.symptoms.map((s, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium text-zinc-900 dark:text-zinc-50">{s.severity}/10</span>
                {s.tags.length > 0 && <span className="text-zinc-500 dark:text-zinc-400"> — {s.tags.join(", ")}</span>}
                <span className="ms-2 text-xs text-zinc-400">{new Date(s.loggedAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!hasAny && (
        <p className="text-center text-sm text-zinc-400">
          <TranslatedText k="shareProfile.public.empty" />
        </p>
      )}

      <p className="text-center text-xs text-zinc-400">
        <TranslatedText k="shareProfile.public.disclaimer" />
      </p>
    </div>
  );
}
