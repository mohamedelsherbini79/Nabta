import { getSessionUser } from "@/lib/session";
import { getActivePatientProfile } from "@/lib/family";
import { getBalance, getLedgerForProfile, toLoyaltyLedgerEntrySummary } from "@/lib/loyalty";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { LoyaltyBalanceCard } from "@/components/loyalty/LoyaltyBalanceCard";
import { LoyaltyHistoryList } from "@/components/loyalty/LoyaltyHistoryList";

export default async function LoyaltyPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const profile = await getActivePatientProfile(user.id);
  if (!profile) return null;

  const balance = await getBalance(profile.id);
  const ledger = await getLedgerForProfile(profile.id);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="loyalty.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="loyalty.subtitle" />
        </p>
      </div>

      <LoyaltyBalanceCard balance={balance} />

      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <TranslatedText k="loyalty.history.title" />
        </h2>
        <LoyaltyHistoryList entries={ledger.map(toLoyaltyLedgerEntrySummary)} />
      </section>
    </div>
  );
}
