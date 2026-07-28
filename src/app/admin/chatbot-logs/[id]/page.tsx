import Link from "next/link";
import { notFound } from "next/navigation";
import { getConversationTranscript, toAdminMessageSummary } from "@/lib/admin";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { MessageBubble } from "@/components/chat/MessageBubble";

export default async function AdminChatbotLogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const messages = (await getConversationTranscript(id)).map(toAdminMessageSummary);

  if (messages.length === 0) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
      <Link href="/admin/chatbot-logs" className="text-xs text-teal-600 hover:underline dark:text-teal-400">
        <TranslatedText k="admin.chatbotLogs.backToList" />
      </Link>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>
    </div>
  );
}
