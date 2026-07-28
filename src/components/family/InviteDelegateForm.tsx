"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

const SCOPE_OPTIONS = ["FULL", "MEDICATION_ONLY", "VIEW_ONLY"] as const;

export function InviteDelegateForm() {
  const { t } = useTranslation();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [scope, setScope] = useState<(typeof SCOPE_OPTIONS)[number]>("FULL");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/family/delegates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), scope }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.message ?? t("family.invite.error"));
      return;
    }

    setEmail("");
    setScope("FULL");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          id="delegateEmail"
          type="email"
          label={t("family.invite.emailLabel")}
          placeholder={t("family.invite.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("family.invite.scopeLabel")}</label>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as typeof scope)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {SCOPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`family.scope.${option.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Button onClick={handleSubmit} disabled={submitting || !email.trim()} className="self-start">
        {submitting && <Spinner className="h-4 w-4" />}
        {submitting ? t("family.invite.submitting") : t("family.invite.submit")}
      </Button>
    </div>
  );
}
