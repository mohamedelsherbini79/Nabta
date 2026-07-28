"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export function EmergencyContactForm({
  patientProfileId,
  initialName,
  initialPhone,
}: {
  patientProfileId: string;
  initialName: string | null;
  initialPhone: string | null;
}) {
  const { t } = useTranslation();
  const router = useRouter();

  const [name, setName] = useState(initialName ?? "");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/emergency-card/contact", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientProfileId,
        emergencyContactName: name.trim() || null,
        emergencyContactPhone: phone.trim() || null,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(t("emergencyCard.contact.error"));
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("emergencyCard.contact.title")}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          id="emergencyContactName"
          label={t("emergencyCard.contact.nameLabel")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          id="emergencyContactPhone"
          type="tel"
          label={t("emergencyCard.contact.phoneLabel")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <Button onClick={handleSubmit} disabled={submitting} className="self-start">
        {submitting && <Spinner className="h-4 w-4" />}
        {submitting ? t("emergencyCard.contact.submitting") : t("emergencyCard.contact.submit")}
      </Button>
    </div>
  );
}
