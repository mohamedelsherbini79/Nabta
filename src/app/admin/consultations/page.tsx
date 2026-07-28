import Link from "next/link";
import { getAllConsultationsAdmin, toAdminConsultationSummary } from "@/lib/admin";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import type { ConsultationStatus } from "@/types";

const STATUS_TABS: { status: ConsultationStatus | null; key: string }[] = [
  { status: null, key: "admin.consultations.filter.all" },
  { status: "BOOKED", key: "admin.consultations.filter.booked" },
  { status: "COMPLETED", key: "admin.consultations.filter.completed" },
  { status: "CANCELLED", key: "admin.consultations.filter.cancelled" },
  { status: "NO_SHOW", key: "admin.consultations.filter.noShow" },
];

export default async function AdminConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = (STATUS_TABS.find((t) => t.status === status)?.status ?? undefined) as
    | ConsultationStatus
    | undefined;

  const consultations = (await getAllConsultationsAdmin(activeStatus)).map(toAdminConsultationSummary);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="admin.consultations.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="admin.consultations.subtitle" />
        </p>
      </div>

      <div className="flex gap-1">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.status ? `/admin/consultations?status=${tab.status}` : "/admin/consultations"}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              activeStatus === tab.status
                ? "bg-teal-600 text-white"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            <TranslatedText k={tab.key} />
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className="px-3 py-2 text-start font-medium text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="admin.consultations.patient" />
              </th>
              <th className="px-3 py-2 text-start font-medium text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="admin.consultations.doctor" />
              </th>
              <th className="px-3 py-2 text-start font-medium text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="admin.consultations.scheduledFor" />
              </th>
              <th className="px-3 py-2 text-start font-medium text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="admin.consultations.status" />
              </th>
            </tr>
          </thead>
          <tbody>
            {consultations.map((c) => (
              <tr key={c.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                <td className="px-3 py-2 text-zinc-900 dark:text-zinc-50">{c.patientDisplayName}</td>
                <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{c.doctor?.name ?? "—"}</td>
                <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">
                  {new Date(c.scheduledFor).toLocaleString()}
                </td>
                <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">{c.status}</td>
              </tr>
            ))}
            {consultations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-zinc-400">
                  <TranslatedText k="admin.consultations.empty" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
