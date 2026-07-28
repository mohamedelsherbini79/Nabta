import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ConversationList } from "@/components/chat/ConversationList";
import { TranslatedText } from "@/components/i18n/TranslatedText";

const NAV_GROUPS: { label: string; items: { href: string; label: string }[] }[] = [
  {
    label: "Health",
    items: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/profile/assessment", label: "Self-Assessment" },
      { href: "/profile/family", label: "Family Mode" },
    ],
  },
  {
    label: "Medications",
    items: [
      { href: "/medications", label: "Medications" },
      { href: "/medications/interactions", label: "Drug Interactions" },
      { href: "/reminders", label: "Reminders" },
    ],
  },
  {
    label: "Tracking",
    items: [
      { href: "/vitals", label: "Vitals" },
      { href: "/symptoms", label: "Symptoms" },
      { href: "/cycle", label: "Cycle Tracker" },
      { href: "/vaccinations", label: "Vaccinations" },
    ],
  },
  {
    label: "Reports & Sharing",
    items: [
      { href: "/reports", label: "Health Reports" },
      { href: "/emergency-card", label: "Emergency Card" },
      { href: "/share", label: "Share Profile" },
      { href: "/expenses", label: "Expenses" },
    ],
  },
  {
    label: "Care",
    items: [
      { href: "/consultations", label: "Consultations" },
      { href: "/pharmacist-chat", label: "Pharmacist Chat" },
      { href: "/pharmacy", label: "Pharmacy" },
      { href: "/community", label: "Community" },
      { href: "/loyalty", label: "Loyalty Points" },
    ],
  },
];

export async function Sidebar({ userId }: { userId: string }) {
  const conversations = await prisma.conversation.findMany({
    where: { userId, kind: "PATIENT_AI" },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
  });

  return (
    <div className="flex h-full w-full flex-col">
      <div className="p-3">
        <Link
          href="/chat"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          <TranslatedText k="sidebar.newChat" />
        </Link>
      </div>

      <nav className="px-2 pb-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-3">
            <div className="px-2.5 pb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
              {group.label}
            </div>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block truncate rounded-lg px-2.5 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-zinc-200 dark:border-zinc-800" />

      <ConversationList
        initialConversations={conversations.map((c) => ({
          id: c.id,
          title: c.title,
          updatedAt: c.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
