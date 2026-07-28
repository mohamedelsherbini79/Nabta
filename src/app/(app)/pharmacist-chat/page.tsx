import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DisclaimerBanner } from "@/components/chat/DisclaimerBanner";
import { EmergencyNotice } from "@/components/chat/EmergencyNotice";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ConversationList } from "@/components/chat/ConversationList";
import { TranslatedText } from "@/components/i18n/TranslatedText";

export default async function PharmacistChatPage() {
  const user = await requireUser();

  const conversations = await prisma.conversation.findMany({
    where: { userId: user.id, kind: "PHARMACIST" },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
  });

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="hidden w-64 shrink-0 flex-col border-e border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 md:flex">
        <ConversationList
          initialConversations={conversations.map((c) => ({
            id: c.id,
            title: c.title,
            updatedAt: c.updatedAt.toISOString(),
          }))}
          basePath="/pharmacist-chat"
        />
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            <TranslatedText k="pharmacistChat.title" />
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <TranslatedText k="pharmacistChat.subtitle" />
          </p>
        </div>
        <EmergencyNotice />
        <DisclaimerBanner messageKey="pharmacistChat.disclaimer" />
        <ChatWindow
          conversationId={null}
          initialMessages={[]}
          kind="PHARMACIST"
          basePath="/pharmacist-chat"
          placeholderKey="pharmacistChat.placeholder"
          emptyTitleKey="pharmacistChat.emptyState.title"
          emptySubtitleKey="pharmacistChat.emptyState.subtitle"
        />
      </div>
    </div>
  );
}
