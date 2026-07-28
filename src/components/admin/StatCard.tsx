import { Card } from "@/components/ui/Card";
import { TranslatedText } from "@/components/i18n/TranslatedText";

export function StatCard({ labelKey, value }: { labelKey: string; value: string | number }) {
  return (
    <Card>
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <TranslatedText k={labelKey} />
      </p>
      <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
    </Card>
  );
}
