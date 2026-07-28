import { TranslatedText } from "@/components/i18n/TranslatedText";

export function EmergencyNotice() {
  return (
    <div className="flex items-start gap-2 border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
      <span aria-hidden="true">⚠</span>
      <p>
        <TranslatedText k="emergency.banner" />
      </p>
    </div>
  );
}
