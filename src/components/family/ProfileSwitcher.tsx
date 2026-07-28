"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import type { FamilyProfileSummary } from "@/types";

export function ProfileSwitcher({
  profiles,
  activeProfileId,
}: {
  profiles: FamilyProfileSummary[];
  activeProfileId: string;
}) {
  const { t } = useTranslation();
  const router = useRouter();

  async function handleChange(patientProfileId: string) {
    await fetch("/api/family/active-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientProfileId }),
    });
    router.refresh();
  }

  return (
    <select
      value={activeProfileId}
      onChange={(e) => handleChange(e.target.value)}
      aria-label={t("family.switcher.label")}
      className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {profiles.map((profile) => (
        <option key={profile.id} value={profile.id}>
          {profile.displayName}
          {profile.relationship !== "SELF" ? ` (${t(`family.relationship.${profile.relationship.toLowerCase()}`)})` : ""}
        </option>
      ))}
    </select>
  );
}
