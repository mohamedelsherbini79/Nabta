import { getSessionUser } from "@/lib/session";
import { getGroupsWithMembership } from "@/lib/community";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { CommunityGroupList } from "@/components/community/CommunityGroupList";

export default async function CommunityPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const groups = await getGroupsWithMembership(user.id);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="community.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="community.subtitle" />
        </p>
      </div>

      <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        <TranslatedText k="community.disclaimer" />
      </div>

      <CommunityGroupList groups={groups} />
    </div>
  );
}
