import Link from "next/link";
import { getRecentAuditLogs } from "@/lib/admin";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { Card } from "@/components/ui/Card";

const QUICK_LINKS = [
  { href: "/admin/users", key: "admin.nav.users" },
  { href: "/admin/drugs", key: "admin.nav.drugs" },
  { href: "/admin/consultations", key: "admin.nav.consultations" },
  { href: "/admin/chatbot-logs", key: "admin.nav.chatbotLogs" },
  { href: "/admin/reports", key: "admin.nav.reports" },
  { href: "/admin/notifications", key: "admin.nav.notifications" },
  { href: "/admin/analytics", key: "admin.nav.analytics" },
] as const;

export default async function AdminHomePage() {
  const auditLogs = await getRecentAuditLogs(20);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="admin.dashboard.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="admin.dashboard.subtitle" />
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {QUICK_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                <TranslatedText k={link.key} />
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <TranslatedText k="admin.dashboard.recentActivity" />
        </h2>
        {auditLogs.length === 0 ? (
          <p className="text-sm text-zinc-400">
            <TranslatedText k="admin.dashboard.noActivity" />
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {auditLogs.map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="text-zinc-700 dark:text-zinc-300">
                  {log.actorEmail ?? "—"} · {log.action}
                </span>
                <span className="shrink-0 text-xs text-zinc-400">{new Date(log.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
