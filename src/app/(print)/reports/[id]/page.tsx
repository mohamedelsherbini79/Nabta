import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/session";
import { canAccessProfile } from "@/lib/family";
import { getReportById, type ReportSnapshot } from "@/lib/reports";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/i18n/locale";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { PrintButton } from "@/components/reports/PrintButton";

const BREAKDOWN_KEYS = ["adherence", "assessment", "vitals", "activity"] as const;

export default async function ReportPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();

  const { id } = await params;
  const report = await getReportById(id);
  if (!report) notFound();

  const allowed = await canAccessProfile(user.id, report.patientProfileId);
  if (!allowed) notFound();

  const snapshot = report.dataSnapshot as unknown as ReportSnapshot;

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  const locale = isSupportedLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const dateFormatter = new Intl.DateTimeFormat(locale, { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            <TranslatedText k="reports.print.title" />
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{snapshot.patientDisplayName}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {dateFormatter.format(new Date(snapshot.periodStart))} – {dateFormatter.format(new Date(snapshot.periodEnd))}
          </p>
        </div>
        <PrintButton />
      </div>

      <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <TranslatedText k="reports.print.healthScore" />
        </h2>
        <p className="mb-3 text-3xl font-semibold text-green-600 dark:text-green-400">{snapshot.healthScore.score}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BREAKDOWN_KEYS.map((key) => (
            <div key={key}>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                <TranslatedText k={`healthScore.breakdown.${key}`} />
              </p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{snapshot.healthScore.breakdown[key]}%</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <TranslatedText k="reports.print.summary" />
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              <TranslatedText k="reports.print.symptomLogs" />
            </p>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {snapshot.symptomLogCount}
              {snapshot.avgSymptomSeverity !== null && (
                <>
                  {" "}
                  (<TranslatedText k="reports.print.avgSeverity" /> {snapshot.avgSymptomSeverity}/10)
                </>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              <TranslatedText k="reports.print.vitalsLogged" />
            </p>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{snapshot.vitalsLoggedCount}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              <TranslatedText k="reports.print.vaccinations" />
            </p>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{snapshot.vaccinationsAdministeredCount}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              <TranslatedText k="reports.print.bmi" />
            </p>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {snapshot.latestBmi ? `${snapshot.latestBmi.value} (${snapshot.latestBmi.category})` : "—"}
            </p>
          </div>
        </div>
      </section>

      <p className="text-xs text-zinc-400">
        <TranslatedText k="reports.print.disclaimer" />
      </p>
    </div>
  );
}
