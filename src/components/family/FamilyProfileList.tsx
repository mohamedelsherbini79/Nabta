"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import type { FamilyProfileSummary } from "@/types";

export function FamilyProfileList({ profiles }: { profiles: FamilyProfileSummary[] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    const res = await fetch(`/api/family/profiles/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!res.ok) {
      setError(t("family.profiles.deleteError"));
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {profiles.map((profile) => (
          <li
            key={profile.id}
            className="flex items-start justify-between gap-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-50">{profile.displayName}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {t(`family.relationship.${profile.relationship.toLowerCase()}`)}
                {profile.dob ? ` · ${profile.dob}` : ""}
              </p>
            </div>
            {profile.relationship !== "SELF" && (
              <button
                type="button"
                onClick={() => handleDelete(profile.id)}
                disabled={deletingId === profile.id}
                className="shrink-0 text-xs text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
              >
                {deletingId === profile.id ? t("family.profiles.deleting") : t("family.profiles.delete")}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
