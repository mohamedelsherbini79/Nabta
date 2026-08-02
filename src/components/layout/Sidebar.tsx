import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ConversationList } from "@/components/chat/ConversationList";
import { TranslatedText } from "@/components/i18n/TranslatedText";

const NAV_GROUPS: { label: string; items: { href: string; label: string; icon: string }[] }[] = [
  {
    label: "Health",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "📊" },
      { href: "/profile/assessment", label: "Self-Assessment", icon: "📝" },
      { href: "/profile/family", label: "Family Mode", icon: "👪" },
    ],
  },
  {
    label: "Medications",
    items: [
      { href: "/medications", label: "Medications", icon: "💊" },
      { href: "/medications/interactions", label: "Drug Interactions", icon: "⚠️" },
      { href: "/reminders", label: "Reminders", icon: "⏰" },
    ],
  },
  {
    label: "Tracking",
    items: [
      { href: "/vitals", label: "Vitals", icon: "❤️" },
      { href: "/symptoms", label: "Symptoms", icon: "🌡️" },
      { href: "/cycle", label: "Cycle Tracker", icon: "📅" },
      { href: "/pregnancy", label: "Pregnancy", icon: "🤰" },
      { href: "/vaccinations", label: "Vaccinations", icon: "💉" },
      { href: "/mental-health", label: "Mental Health", icon: "🧠" },
      { href: "/genetics", label: "Genetics", icon: "🧬" },
    ],
  },
  {
    label: "Reports & Sharing",
    items: [
      { href: "/reports", label: "Health Reports", icon: "📄" },
      { href: "/emergency-card", label: "Emergency Card", icon: "🆘" },
      { href: "/share", label: "Share Profile", icon: "🔗" },
      { href: "/expenses", label: "Expenses", icon: "💰" },
      { href: "/insurance", label: "Insurance", icon: "🛡️" },
    ],
  },
  {
    label: "Care",
    items: [
      { href: "/consultations", label: "Consultations", icon: "🩺" },
      { href: "/pharmacist-chat", label: "Pharmacist Chat", icon: "💬" },
      { href: "/pharmacy", label: "Pharmacy", icon: "🛒" },
      { href: "/community", label: "Community", icon: "👥" },
      { href: "/loyalty", label: "Loyalty Points", icon: "🏆" },
      { href: "/health-map", label: "Health Map", icon: "🗺️" },
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
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
        >
          <TranslatedText k="sidebar.newChat" />
        </Link>
      </div>

      <nav className="px-2 pb-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-3">
            <div className="px-2.5 pb-1.5 text-xs font-medium uppercase tracking-wide text-zinc-400">
              {group.label}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-zinc-200 bg-white p-2.5 text-center transition-colors hover:border-green-300 hover:bg-green-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-green-800 dark:hover:bg-green-950"
                >
                  <span className="text-xl leading-none" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="text-xs font-medium leading-tight text-zinc-700 dark:text-zinc-300">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
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
