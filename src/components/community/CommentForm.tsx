"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export function CommentForm({ postId }: { postId: string }) {
  const { t } = useTranslation();
  const router = useRouter();

  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/community/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(t("community.comment.error"));
      return;
    }

    setContent("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("community.comment.placeholder")}
        rows={2}
        className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <Button onClick={handleSubmit} disabled={submitting || content.trim().length === 0} className="self-start !px-3 !py-1.5 text-xs">
        {submitting && <Spinner className="h-3.5 w-3.5" />}
        {t("community.comment.submit")}
      </Button>
    </div>
  );
}
