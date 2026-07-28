"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import type { FamilyDelegateSummary } from "@/types";

export function DelegateList({ delegates }: { delegates: FamilyDelegateSummary[] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [revokingId, setRevokingId] = useState<string | null>(null);

  async function handleRevoke(id: string) {
    setRevokingId(id);
    const res = await fetch(`/api/family/delegates/${id}`, { method: "DELETE" });
    setRevokingId(null);
    if (res.ok) router.refresh();
  }

  if (delegates.length === 0) {
    return <p className="text-sm text-zinc-400">{t("family.delegates.empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {delegates.map((delegate) => (
        <li
          key={delegate.id}
          className="flex items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {delegate.delegateUser.name ?? delegate.delegateUser.email}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t(`family.scope.${delegate.scope.toLowerCase()}`)} ·{" "}
              {delegate.acceptedAt ? t("family.delegates.accepted") : t("family.delegates.pending")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleRevoke(delegate.id)}
            disabled={revokingId === delegate.id}
            className="shrink-0 text-xs text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
          >
            {revokingId === delegate.id ? t("family.delegates.revoking") : t("family.delegates.revoke")}
          </button>
        </li>
      ))}
    </ul>
  );
}
