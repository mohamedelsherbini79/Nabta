import { getAllReportsAdmin, toAdminReportSummary } from "@/lib/admin";
import { TranslatedText } from "@/components/i18n/TranslatedText";

export default async function AdminReportsPage() {
  const reports = (await getAllReportsAdmin()).map(toAdminReportSummary);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="admin.reports.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="admin.reports.subtitle" />
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className="px-3 py-2 text-start font-medium text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="admin.reports.patient" />
              </th>
              <th className="px-3 py-2 text-start font-medium text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="admin.reports.period" />
              </th>
              <th className="px-3 py-2 text-start font-medium text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="admin.reports.status" />
              </th>
              <th className="px-3 py-2 text-start font-medium text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="admin.reports.healthScore" />
              </th>
              <th className="px-3 py-2 text-start font-medium text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="admin.reports.symptomLogs" />
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                <td className="px-3 py-2 text-zinc-900 dark:text-zinc-50">{r.patientDisplayName}</td>
                <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">
                  {new Date(r.periodStart).toLocaleDateString()} – {new Date(r.periodEnd).toLocaleDateString()}
                </td>
                <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">{r.status}</td>
                <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">{r.healthScore ?? "—"}</td>
                <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">
                  {r.symptomLogCount ?? "—"}
                  {r.avgSymptomSeverity != null && ` (avg ${r.avgSymptomSeverity}/10)`}
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-zinc-400">
                  <TranslatedText k="admin.reports.empty" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
