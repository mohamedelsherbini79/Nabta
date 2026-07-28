"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import type { PendingInviteSummary } from "@/types";

export function PendingInvites({ invites }: { invites: PendingInviteSummary[] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  if (invites.length === 0) return null;

  async function handleAccept(id: string) {
    setAcceptingId(id);
    const res = await fetch(`/api/family/delegates/${id}/accept`, { method: "POST" });
    setAcceptingId(null);
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950">
      <h3 className="text-sm font-medium text-teal-900 dark:text-teal-200">{t("family.pendingInvites.title")}</h3>
      <ul className="flex flex-col gap-2">
        {invites.map((invite) => (
          <li key={invite.id} className="flex items-center justify-between gap-2">
            <p className="text-sm text-teal-900 dark:text-teal-200">
              {t("family.pendingInvites.invitedBy")} {invite.familyOwnerName} ·{" "}
              {t(`family.scope.${invite.scope.toLowerCase()}`)}
            </p>
            <Button
              onClick={() => handleAccept(invite.id)}
              disabled={acceptingId === invite.id}
              className="shrink-0 !px-3 !py-1.5 text-xs"
            >
              {acceptingId === invite.id ? t("family.pendingInvites.accepting") : t("family.pendingInvites.accept")}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
