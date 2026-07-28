import Link from "next/link";
import { TranslatedText } from "@/components/i18n/TranslatedText";

const ADMIN_NAV_ITEMS = [
  { href: "/admin", key: "admin.nav.dashboard" },
  { href: "/admin/users", key: "admin.nav.users" },
  { href: "/admin/drugs", key: "admin.nav.drugs" },
  { href: "/admin/consultations", key: "admin.nav.consultations" },
  { href: "/admin/chatbot-logs", key: "admin.nav.chatbotLogs" },
  { href: "/admin/reports", key: "admin.nav.reports" },
  { href: "/admin/notifications", key: "admin.nav.notifications" },
  { href: "/admin/analytics", key: "admin.nav.analytics" },
] as const;

export function AdminNav() {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
      {ADMIN_NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="shrink-0 rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <TranslatedText k={item.key} />
        </Link>
      ))}
    </nav>
  );
}
