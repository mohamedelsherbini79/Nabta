import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DisclaimerBanner } from "@/components/chat/DisclaimerBanner";
import { EmergencyNotice } from "@/components/chat/EmergencyNotice";
import { ChatWindow } from "@/components/chat/ChatWindow";
import type { ChatMessage } from "@/types";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const user = await requireUser();
  const { conversationId } = await params;

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId: user.id, kind: "PATIENT_AI" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!conversation) {
    notFound();
  }

  const messages: ChatMessage[] = conversation.messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <EmergencyNotice />
      <DisclaimerBanner />
      <ChatWindow conversationId={conversation.id} initialMessages={messages} />
    </div>
  );
}
