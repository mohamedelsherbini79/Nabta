import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { getGroupById, getMembership, getPostsForGroup, toCommunityPostSummary } from "@/lib/community";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { PostForm } from "@/components/community/PostForm";
import { PostList } from "@/components/community/PostList";
import { JoinGroupButton } from "@/components/community/JoinGroupButton";

export default async function CommunityGroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;

  const { groupId } = await params;
  const group = await getGroupById(groupId);
  if (!group) {
    notFound();
  }

  const membership = await getMembership(groupId, user.id);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div>
        <Link href="/community" className="text-xs text-green-600 hover:underline dark:text-green-400">
          <TranslatedText k="community.backToGroups" />
        </Link>
        <h1 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{group.name}</h1>
      </div>

      {!membership ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <TranslatedText k="community.joinToView" />
          </p>
          <JoinGroupButton groupId={groupId} />
        </div>
      ) : (
        <>
          <PostForm groupId={groupId} />
          <PostList
            groupId={groupId}
            posts={(await getPostsForGroup(groupId)).map(toCommunityPostSummary)}
            currentUserId={user.id}
          />
        </>
      )}
    </div>
  );
}
