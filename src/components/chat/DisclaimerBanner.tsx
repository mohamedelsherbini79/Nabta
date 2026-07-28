import { TranslatedText } from "@/components/i18n/TranslatedText";

export function DisclaimerBanner({ messageKey = "disclaimer.banner" }: { messageKey?: string }) {
  return (
    <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-center text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
      <TranslatedText k={messageKey} />
    </div>
  );
}
