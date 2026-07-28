"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { useMobileNavOptional } from "./MobileNavProvider";

// Renders nothing where Header is used without a MobileNavProvider ancestor
// (e.g. the admin area, which has its own horizontal AdminNav instead of a
// Sidebar drawer) rather than crashing.
export function MobileMenuButton() {
  const { t } = useTranslation();
  const nav = useMobileNavOptional();
  if (!nav) return null;
  const { toggle } = nav;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("nav.menu")}
      className="shrink-0 rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
      </svg>
    </button>
  );
}
