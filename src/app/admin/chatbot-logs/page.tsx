import Link from "next/link";
import { getAllConversationsAdmin, toAdminConversationSummary } from "@/lib/admin";
import { TranslatedText } from "@/components/i18n/TranslatedText";

const KIND_TABS: { kind: "PATIENT_AI" | "PHARMACIST" | "SUPPORT" | null; key: string }[] = [
  { kind: null, key: "admin.chatbotLogs.filter.all" },
  { kind: "PATIENT_AI", key: "admin.chatbotLogs.filter.patientAi" },
  { kind: "PHARMACIST", key: "admin.chatbotLogs.filter.pharmacist" },
  { kind: "SUPPORT", key: "admin.chatbotLogs.filter.support" },
];

export default async function AdminChatbotLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const activeKind = KIND_TABS.find((t) => t.kind === kind)?.kind ?? undefined;

  const conversations = (await getAllConversationsAdmin(activeKind)).map(toAdminConversationSummary);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="admin.chatbotLogs.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="admin.chatbotLogs.subtitle" />
        </p>
      </div>

      <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        <TranslatedText k="admin.chatbotLogs.privacyNotice" />
      </div>

      <div className="flex gap-1">
        {KIND_TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.kind ? `/admin/chatbot-logs?kind=${tab.kind}` : "/admin/chatbot-logs"}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              activeKind === tab.kind
                ? "bg-teal-600 text-white"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            <TranslatedText k={tab.key} />
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className="px-3 py-2 text-start font-medium text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="admin.chatbotLogs.user" />
              </th>
              <th className="px-3 py-2 text-start font-medium text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="admin.chatbotLogs.titleColumn" />
              </th>
              <th className="px-3 py-2 text-start font-medium text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="admin.chatbotLogs.kind" />
              </th>
              <th className="px-3 py-2 text-start font-medium text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="admin.chatbotLogs.messages" />
              </th>
              <th className="px-3 py-2 text-start font-medium text-zinc-500 dark:text-zinc-400">
                <TranslatedText k="admin.chatbotLogs.updated" />
              </th>
            </tr>
          </thead>
          <tbody>
            {conversations.map((c) => (
              <tr key={c.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                <td className="px-3 py-2 text-zinc-900 dark:text-zinc-50">{c.userEmail}</td>
                <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">
                  <Link href={`/admin/chatbot-logs/${c.id}`} className="text-teal-600 hover:underline dark:text-teal-400">
                    {c.title}
                  </Link>
                </td>
                <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">{c.kind}</td>
                <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">{c.messageCount}</td>
                <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">{new Date(c.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
            {conversations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-zinc-400">
                  <TranslatedText k="admin.chatbotLogs.empty" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
