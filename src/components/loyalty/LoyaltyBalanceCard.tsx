import { Card } from "@/components/ui/Card";
import { TranslatedText } from "@/components/i18n/TranslatedText";

export function LoyaltyBalanceCard({ balance }: { balance: number }) {
  return (
    <Card>
      <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        <TranslatedText k="loyalty.balanceLabel" />
      </h2>
      <p className="mt-2 text-4xl font-bold text-teal-600 dark:text-teal-400">{balance}</p>
    </Card>
  );
}
