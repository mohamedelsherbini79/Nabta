"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export function PasswordForm() {
  const { t } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSaved(false);

    if (newPassword !== confirmPassword) {
      setError(t("settings.password.mismatch"));
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/settings/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.message ?? t("settings.password.error"));
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("settings.password.title")}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          id="currentPassword"
          type="password"
          label={t("settings.password.currentLabel")}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          id="newPassword"
          type="password"
          label={t("settings.password.newLabel")}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          id="confirmPassword"
          type="password"
          label={t("settings.password.confirmLabel")}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <Button
        onClick={handleSubmit}
        disabled={submitting || !currentPassword || newPassword.length < 8 || !confirmPassword}
        className="self-start"
      >
        {submitting && <Spinner className="h-4 w-4" />}
        {saved ? t("settings.saved") : t("settings.password.submit")}
      </Button>
    </div>
  );
}
