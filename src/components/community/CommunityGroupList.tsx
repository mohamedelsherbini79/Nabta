"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import type { CommunityGroupSummary } from "@/types";

export function CommunityGroupList({ groups }: { groups: CommunityGroupSummary[] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleJoin(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/community/groups/${id}/membership`, { method: "POST" });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  async function handleLeave(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/community/groups/${id}/membership`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  return (
    <ul className="flex flex-col gap-3">
      {groups.map((group) => (
        <li
          key={group.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div>
            {group.isMember ? (
              <Link href={`/community/${group.id}`} className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400">
                {group.name}
              </Link>
            ) : (
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{group.name}</p>
            )}
            <p className="text-xs text-zinc-400">
              {group.memberCount} {t("community.membersLabel")}
            </p>
          </div>
          <Button
            variant={group.isMember ? "secondary" : "primary"}
            onClick={() => (group.isMember ? handleLeave(group.id) : handleJoin(group.id))}
            disabled={busyId === group.id}
            className="!px-3 !py-1.5 text-xs"
          >
            {group.isMember ? t("community.leave") : t("community.join")}
          </Button>
        </li>
      ))}
    </ul>
  );
}
