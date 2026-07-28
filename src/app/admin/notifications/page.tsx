import { getSessionUser } from "@/lib/session";
import { getRecentSystemNotifications } from "@/lib/admin";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { BroadcastForm } from "@/components/admin/BroadcastForm";

export default async function AdminNotificationsPage() {
  const user = await getSessionUser();
  const canBroadcast = user?.role === "ADMIN";
  const notifications = await getRecentSystemNotifications();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="admin.notifications.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="admin.notifications.subtitle" />
        </p>
      </div>

      {canBroadcast && <BroadcastForm />}

      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <TranslatedText k="admin.notifications.history" />
        </h2>
        {notifications.length === 0 ? (
          <p className="text-sm text-zinc-400">
            <TranslatedText k="admin.notifications.empty" />
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {notifications.map((n) => (
              <li key={n.id} className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{n.title}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">{n.body}</p>
                  </div>
                  <p className="shrink-0 text-xs text-zinc-400">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <p className="mt-2 text-xs text-zinc-400">
                  {n.readReceipts}/{n.totalReceipts} <TranslatedText k="admin.notifications.readCount" />
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
