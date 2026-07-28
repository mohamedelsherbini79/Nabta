"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { Spinner } from "@/components/ui/Spinner";
import type { ChatMessage } from "@/types";

let localIdCounter = 0;
function localId() {
  localIdCounter += 1;
  return `local-${Date.now()}-${localIdCounter}`;
}

export function ChatWindow({
  conversationId,
  initialMessages,
  kind = "PATIENT_AI",
  basePath = "/chat",
  placeholderKey = "chat.placeholder",
  emptyTitleKey = "chat.emptyState.title",
  emptySubtitleKey = "chat.emptyState.subtitle",
}: {
  conversationId: string | null;
  initialMessages: ChatMessage[];
  kind?: "PATIENT_AI" | "PHARMACIST";
  basePath?: string;
  placeholderKey?: string;
  emptyTitleKey?: string;
  emptySubtitleKey?: string;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
  }

  async function handleSend(message: string) {
    setError(false);
    setSending(true);

    const userMessage: ChatMessage = {
      id: localId(),
      role: "USER",
      content: message,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setStreamingText("");
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message, kind }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Chat request failed");
      }

      const newConversationId = res.headers.get("X-Conversation-Id");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setStreamingText(accumulated);
        scrollToBottom();
      }

      setMessages((prev) => [
        ...prev,
        {
          id: localId(),
          role: "ASSISTANT",
          content: accumulated,
          createdAt: new Date().toISOString(),
        },
      ]);
      setStreamingText(null);

      if (!conversationId && newConversationId) {
        router.replace(`${basePath}/${newConversationId}`);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch {
      setError(true);
      setStreamingText(null);
    } finally {
      setSending(false);
      scrollToBottom();
    }
  }

  const showEmptyState = messages.length === 0 && streamingText === null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {showEmptyState ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
              {t(emptyTitleKey)}
            </h2>
            <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
              {t(emptySubtitleKey)}
            </p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {streamingText !== null && (
              <MessageBubble
                message={{
                  id: "streaming",
                  role: "ASSISTANT",
                  content: streamingText || "…",
                  createdAt: new Date().toISOString(),
                }}
              />
            )}
            {error && <p className="text-center text-sm text-red-600 dark:text-red-400">{t("chat.error")}</p>}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      <div className="mx-auto w-full max-w-3xl">
        <MessageInput onSend={handleSend} disabled={sending} placeholderKey={placeholderKey} />
        {sending && (
          <div className="flex items-center gap-2 px-3 pb-2 text-xs text-zinc-400">
            <Spinner className="h-3.5 w-3.5" />
            {t("common.loading")}
          </div>
        )}
      </div>
    </div>
  );
}
