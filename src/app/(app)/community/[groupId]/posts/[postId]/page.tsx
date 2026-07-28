import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { getCommentsForPost, getMembership, getPostById, toCommunityCommentSummary, toCommunityPostSummary } from "@/lib/community";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { CommentForm } from "@/components/community/CommentForm";
import { CommentList } from "@/components/community/CommentList";

export default async function CommunityPostPage({
  params,
}: {
  params: Promise<{ groupId: string; postId: string }>;
}) {
  const user = await getSessionUser();
  if (!user) return null;

  const { groupId, postId } = await params;
  const post = await getPostById(postId);
  if (!post || post.groupId !== groupId) {
    notFound();
  }

  const membership = await getMembership(groupId, user.id);
  if (!membership) {
    notFound();
  }

  const postSummary = toCommunityPostSummary(post);
  const comments = (await getCommentsForPost(postId)).map(toCommunityCommentSummary);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <Link href={`/community/${groupId}`} className="text-xs text-teal-600 hover:underline dark:text-teal-400">
        <TranslatedText k="community.backToGroup" />
      </Link>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {postSummary.author.name ?? <TranslatedText k="community.anonymous" />}
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{postSummary.content}</p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <TranslatedText k="community.commentsLabel" />
        </h2>
        <CommentForm postId={postId} />
        <CommentList comments={comments} currentUserId={user.id} />
      </section>
    </div>
  );
}
