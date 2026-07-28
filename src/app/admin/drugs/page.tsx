import { getAllDrugsAdmin, toAdminDrugSummary } from "@/lib/admin";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { AdminSearchBox } from "@/components/admin/AdminSearchBox";
import { NewDrugSection } from "@/components/admin/NewDrugSection";
import { DrugList } from "@/components/admin/DrugList";

export default async function AdminDrugsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const drugs = (await getAllDrugsAdmin(q)).map(toAdminDrugSummary);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="admin.drugs.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="admin.drugs.subtitle" />
        </p>
      </div>

      <AdminSearchBox basePath="/admin/drugs" initialQuery={q} />
      <NewDrugSection />
      <DrugList drugs={drugs} />
    </div>
  );
}
