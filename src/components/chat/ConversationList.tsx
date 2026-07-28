"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import type { ConversationSummary } from "@/types";

export function ConversationList({
  initialConversations,
  basePath = "/chat",
}: {
  initialConversations: ConversationSummary[];
  basePath?: string;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ conversationId?: string }>();
  const [deletedIds, setDeletedIds] = useState<ReadonlySet<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const conversations = initialConversations.filter((c) => !deletedIds.has(c.id));

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    setDeletingId(null);

    if (!res.ok) return;

    setDeletedIds((prev) => new Set(prev).add(id));
    if (params.conversationId === id) {
      router.push(basePath);
    }
    router.refresh();
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-3 pt-3 pb-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
        {t("sidebar.conversations")}
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {conversations.length === 0 && (
          <p className="px-2 py-3 text-sm text-zinc-400">{t("sidebar.noConversations")}</p>
        )}
        <ul className="flex flex-col gap-0.5">
          {conversations.map((c) => {
            const active = params.conversationId === c.id;
            return (
              <li key={c.id} className="group flex items-center gap-1">
                <Link
                  href={`${basePath}/${c.id}`}
                  className={`flex-1 truncate rounded-lg px-2.5 py-2 text-sm transition-colors ${
                    active
                      ? "bg-teal-50 text-teal-900 dark:bg-teal-950 dark:text-teal-100"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  {c.title}
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  disabled={deletingId === c.id}
                  aria-label={t("sidebar.delete")}
                  className="me-1 hidden rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-red-600 group-hover:block disabled:opacity-50 dark:hover:bg-zinc-700"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
