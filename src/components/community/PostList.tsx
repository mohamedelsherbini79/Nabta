"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import type { CommunityPostSummary } from "@/types";

export function PostList({
  groupId,
  posts,
  currentUserId,
}: {
  groupId: string;
  posts: CommunityPostSummary[];
  currentUserId: string;
}) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const dateFormatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  async function handleDelete(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/community/posts/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  if (posts.length === 0) {
    return <p className="text-sm text-zinc-400">{t("community.post.empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {posts.map((post) => (
        <li key={post.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{post.author.name ?? t("community.anonymous")}</p>
              <p className="text-xs text-zinc-400">{dateFormatter.format(new Date(post.createdAt))}</p>
            </div>
            {post.author.id === currentUserId && (
              <button
                type="button"
                onClick={() => handleDelete(post.id)}
                disabled={busyId === post.id}
                className="text-xs text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
              >
                {t("community.delete")}
              </button>
            )}
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{post.content}</p>
          <Link
            href={`/community/${groupId}/posts/${post.id}`}
            className="mt-2 inline-block text-xs text-green-600 hover:underline dark:text-green-400"
          >
            {post.commentCount} {t("community.commentsLabel")}
          </Link>
        </li>
      ))}
    </ul>
  );
}
