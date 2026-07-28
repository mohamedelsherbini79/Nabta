import { getSessionUser } from "@/lib/session";
import {
  getDelegatesForFamilyGroup,
  getFamilyProfiles,
  getPendingInvitesForUser,
  getUserFamilyGroup,
  toFamilyDelegateSummary,
  toFamilyProfileSummary,
  toPendingInviteSummary,
} from "@/lib/family";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { FamilyProfileList } from "@/components/family/FamilyProfileList";
import { AddDependentForm } from "@/components/family/AddDependentForm";
import { DelegateList } from "@/components/family/DelegateList";
import { InviteDelegateForm } from "@/components/family/InviteDelegateForm";
import { PendingInvites } from "@/components/family/PendingInvites";

export default async function FamilyModePage() {
  const user = await getSessionUser();
  if (!user) return null;

  const group = await getUserFamilyGroup(user.id);
  const profiles = await getFamilyProfiles(user.id);
  const delegates = group ? await getDelegatesForFamilyGroup(group.id) : [];
  const pendingInvites = await getPendingInvitesForUser(user.id);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="family.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="family.subtitle" />
        </p>
      </div>

      <PendingInvites invites={pendingInvites.map(toPendingInviteSummary)} />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <TranslatedText k="family.profiles.title" />
        </h2>
        <FamilyProfileList profiles={profiles.map(toFamilyProfileSummary)} />
        <AddDependentForm />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <TranslatedText k="family.delegates.title" />
        </h2>
        <DelegateList delegates={delegates.map(toFamilyDelegateSummary)} />
        <InviteDelegateForm />
      </section>
    </div>
  );
}
