import { getSessionUser } from "@/lib/session";
import { getActivePatientProfile } from "@/lib/family";
import { computeExpenseSummary, getExpensesForProfile, toExpenseRecordSummary } from "@/lib/expenses";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseSummaryCard } from "@/components/expenses/ExpenseSummaryCard";
import { ExpenseList } from "@/components/expenses/ExpenseList";

export default async function ExpensesPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  const records = await getExpensesForProfile(profile.id);
  const summaries = records.map(toExpenseRecordSummary);
  const summary = computeExpenseSummary(summaries);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="expenses.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="expenses.subtitle" />
        </p>
      </div>

      <ExpenseSummaryCard summary={summary} />

      <ExpenseForm patientProfileId={profile.id} />

      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <TranslatedText k="expenses.list.title" />
        </h2>
        <ExpenseList records={summaries} />
      </section>
    </div>
  );
}
