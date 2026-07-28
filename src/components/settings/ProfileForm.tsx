"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export function ProfileForm({
  initialName,
  email,
  initialPhone,
}: {
  initialName: string;
  email: string;
  initialPhone: string;
}) {
  const { t } = useTranslation();

  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.message ?? t("settings.profile.error"));
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("settings.profile.title")}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input id="settingsName" label={t("settings.profile.nameLabel")} value={name} onChange={(e) => setName(e.target.value)} />
        <Input id="settingsEmail" label={t("settings.profile.emailLabel")} value={email} disabled />
        <Input
          id="settingsPhone"
          type="tel"
          label={t("settings.profile.phoneLabel")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+201001234567"
        />
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <Button onClick={handleSubmit} disabled={submitting || !name.trim()} className="self-start">
        {submitting && <Spinner className="h-4 w-4" />}
        {saved ? t("settings.saved") : t("settings.save")}
      </Button>
    </div>
  );
}
