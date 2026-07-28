"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import type { CommunityCommentSummary } from "@/types";

export function CommentList({ comments, currentUserId }: { comments: CommunityCommentSummary[]; currentUserId: string }) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const dateFormatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  async function handleDelete(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/community/comments/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  if (comments.length === 0) {
    return <p className="text-sm text-zinc-400">{t("community.comment.empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {comments.map((comment) => (
        <li key={comment.id} className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50">{comment.author.name ?? t("community.anonymous")}</p>
              <p className="text-xs text-zinc-400">{dateFormatter.format(new Date(comment.createdAt))}</p>
            </div>
            {comment.author.id === currentUserId && (
              <button
                type="button"
                onClick={() => handleDelete(comment.id)}
                disabled={busyId === comment.id}
                className="text-xs text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
              >
                {t("community.delete")}
              </button>
            )}
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{comment.content}</p>
        </li>
      ))}
    </ul>
  );
}
