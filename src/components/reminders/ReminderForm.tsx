"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

const TYPE_OPTIONS = ["MEDICATION", "LOCATION", "VACCINATION", "PRESCRIPTION_RENEWAL", "APPOINTMENT", "HEAT"] as const;
const CHANNEL_OPTIONS = ["PUSH", "SMS", "VOICE"] as const;
const RECURRENCE_OPTIONS = ["NONE", "DAILY", "WEEKLY", "MONTHLY"] as const;

export function ReminderForm({ patientProfileId, phone }: { patientProfileId: string; phone: string | null }) {
  const { t } = useTranslation();
  const router = useRouter();

  const [label, setLabel] = useState("");
  const [type, setType] = useState<(typeof TYPE_OPTIONS)[number]>("APPOINTMENT");
  const [scheduledFor, setScheduledFor] = useState("");
  const [recurrenceRule, setRecurrenceRule] = useState<(typeof RECURRENCE_OPTIONS)[number]>("NONE");
  const [channel, setChannel] = useState<(typeof CHANNEL_OPTIONS)[number]>("SMS");
  const [locationLabel, setLocationLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!label.trim() || !scheduledFor) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientProfileId,
        input: {
          label: label.trim(),
          type,
          channel,
          scheduledFor: new Date(scheduledFor).toISOString(),
          recurrenceRule,
          locationLabel: type === "LOCATION" ? locationLabel.trim() || null : null,
        },
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(t("reminders.error"));
      return;
    }

    setLabel("");
    setScheduledFor("");
    setLocationLabel("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <Input id="reminderLabel" label={t("reminders.labelLabel")} value={label} onChange={(e) => setLabel(e.target.value)} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("reminders.typeLabel")}</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`reminders.type.${option.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>
        <Input
          id="reminderScheduledFor"
          type="datetime-local"
          label={t("reminders.scheduledForLabel")}
          value={scheduledFor}
          onChange={(e) => setScheduledFor(e.target.value)}
        />
      </div>

      {type === "LOCATION" && (
        <Input
          id="reminderLocationLabel"
          label={t("reminders.locationLabelLabel")}
          placeholder={t("reminders.locationLabelPlaceholder")}
          value={locationLabel}
          onChange={(e) => setLocationLabel(e.target.value)}
        />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("reminders.recurrenceLabel")}</label>
          <select
            value={recurrenceRule}
            onChange={(e) => setRecurrenceRule(e.target.value as typeof recurrenceRule)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {RECURRENCE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`reminders.recurrence.${option.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("reminders.channelLabel")}</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as typeof channel)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {CHANNEL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`reminders.channel.${option.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(channel === "SMS" || channel === "VOICE") &&
        (phone ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("reminders.channel.phoneNote").replace("{phone}", phone)}
          </p>
        ) : (
          <p className="text-xs text-amber-600 dark:text-amber-400">{t("reminders.channel.noPhoneWarning")}</p>
        ))}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Button onClick={handleSubmit} disabled={submitting || !label.trim() || !scheduledFor} className="self-start">
        {submitting && <Spinner className="h-4 w-4" />}
        {submitting ? t("reminders.submitting") : t("reminders.submit")}
      </Button>
    </div>
  );
}
