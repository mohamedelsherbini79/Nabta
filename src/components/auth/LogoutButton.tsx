"use client";

import { signOut } from "next-auth/react";
import { useTranslation } from "@/i18n/useTranslation";

export function LogoutButton() {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
    >
      {t("nav.logout")}
    </button>
  );
}
