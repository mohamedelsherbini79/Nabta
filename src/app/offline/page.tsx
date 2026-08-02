import { TranslatedText } from "@/components/i18n/TranslatedText";

// Precached by the service worker (public/sw.js) at install time so it's
// available as a navigation fallback even on a first-ever offline visit.
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white p-6 text-center dark:bg-zinc-950">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl dark:bg-green-950">
        📶
      </div>
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        <TranslatedText k="pwa.offlineTitle" />
      </h1>
      <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        <TranslatedText k="pwa.offlineBody" />
      </p>
    </div>
  );
}
