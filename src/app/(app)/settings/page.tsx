import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { LanguageForm } from "@/components/settings/LanguageForm";
import { PasswordForm } from "@/components/settings/PasswordForm";
import { InstallAppButton } from "@/components/settings/InstallAppButton";
import { isSupportedLocale, DEFAULT_LOCALE } from "@/i18n/locale";

export default async function SettingsPage() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return null;

  const preferredLocale = isSupportedLocale(user.preferredLocale) ? user.preferredLocale : DEFAULT_LOCALE;

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          <TranslatedText k="settings.title" />
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="settings.subtitle" />
        </p>
      </div>

      <ProfileForm initialName={user.name ?? ""} email={user.email} initialPhone={user.phone ?? ""} />
      <LanguageForm initialLocale={preferredLocale} />
      <PasswordForm />
      <InstallAppButton />

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <TranslatedText k="settings.notifications.title" />
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="settings.notifications.note" />{" "}
          <Link href="/reminders" className="text-teal-600 hover:underline dark:text-teal-400">
            <TranslatedText k="settings.notifications.link" />
          </Link>
        </p>
      </div>
    </div>
  );
}
