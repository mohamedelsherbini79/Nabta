"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";

export function JoinGroupButton({ groupId }: { groupId: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleJoin() {
    setSubmitting(true);
    const res = await fetch(`/api/community/groups/${groupId}/membership`, { method: "POST" });
    setSubmitting(false);
    if (res.ok) router.refresh();
  }

  return (
    <Button onClick={handleJoin} disabled={submitting} className="!px-3 !py-1.5 text-xs">
      {t("community.join")}
    </Button>
  );
}
