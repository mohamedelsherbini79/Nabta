import { TranslatedText } from "@/components/i18n/TranslatedText";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { MobileMenuButton } from "@/components/layout/MobileMenuButton";
import { ProfileSwitcher } from "@/components/family/ProfileSwitcher";
import { getAccessibleFamilyGroups, getActivePatientProfile, toFamilyProfileSummary } from "@/lib/family";

export async function Header({ userId }: { userId?: string }) {
  // Sequential, not Promise.all: concurrent queries on the same pooled dev
  // connection intermittently corrupt unnamed prepared statements against
  // the local `prisma dev` Postgres proxy (08P01 "bind message supplies N
  // parameters" errors).
  const profiles = userId ? await getAccessibleFamilyGroups(userId) : [];
  const activeProfile = userId ? await getActivePatientProfile(userId) : null;

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <div className="flex min-w-0 items-center gap-1">
        <MobileMenuButton />
        <h1 className="min-w-0 truncate pe-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="app.name" />
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {profiles.length > 1 && (
          <ProfileSwitcher profiles={profiles.map(toFamilyProfileSummary)} activeProfileId={activeProfile?.id ?? ""} />
        )}
        {userId && <NotificationBell />}
        <LanguageToggle />
        <LogoutButton />
      </div>
    </header>
  );
}
