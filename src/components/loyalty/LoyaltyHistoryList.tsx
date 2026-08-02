import { TranslatedText } from "@/components/i18n/TranslatedText";
import type { LoyaltyLedgerEntrySummary } from "@/lib/loyalty";

const REASON_LABEL_KEYS: Record<string, string> = {
  DOSE_TAKEN: "loyalty.reason.DOSE_TAKEN",
  VITALS_LOGGED: "loyalty.reason.VITALS_LOGGED",
  SYMPTOM_LOGGED: "loyalty.reason.SYMPTOM_LOGGED",
  SELF_ASSESSMENT_COMPLETED: "loyalty.reason.SELF_ASSESSMENT_COMPLETED",
};

export function LoyaltyHistoryList({ entries }: { entries: LoyaltyLedgerEntrySummary[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-zinc-400">
      <TranslatedText k="loyalty.history.empty" />
    </p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              <TranslatedText k={REASON_LABEL_KEYS[entry.reason] ?? "loyalty.reason.OTHER"} />
            </p>
            <p className="text-xs text-zinc-400">{new Date(entry.createdAt).toLocaleString()}</p>
          </div>
          <p className={`text-sm font-semibold ${entry.delta >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {entry.delta >= 0 ? `+${entry.delta}` : entry.delta}
          </p>
        </li>
      ))}
    </ul>
  );
}
