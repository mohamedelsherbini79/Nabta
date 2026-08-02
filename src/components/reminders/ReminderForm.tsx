"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import type { ReminderChannel } from "@/types";

const TYPE_OPTIONS = ["MEDICATION", "LOCATION", "VACCINATION", "PRESCRIPTION_RENEWAL", "APPOINTMENT", "HEAT"] as const;
const CHANNEL_OPTIONS: ReminderChannel[] = ["SMS", "VOICE", "PUSH"];
const RECURRENCE_OPTIONS = ["NONE", "DAILY", "WEEKLY", "MONTHLY"] as const;

const SELECT_CLASSES =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export function ReminderForm({ patientProfileId, phone }: { patientProfileId: string; phone: string | null }) {
  const { t } = useTranslation();
  const router = useRouter();

  const [label, setLabel] = useState("");
  const [type, setType] = useState<(typeof TYPE_OPTIONS)[number]>("APPOINTMENT");
  const [scheduledFor, setScheduledFor] = useState("");
  const [recurrenceRule, setRecurrenceRule] = useState<(typeof RECURRENCE_OPTIONS)[number]>("NONE");
  const [channel, setChannel] = useState<ReminderChannel>("SMS");
  const [locationLabel, setLocationLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 3000);
    return () => clearTimeout(timer);
  }, [justAdded]);

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
    setJustAdded(true);
    router.refresh();
  }

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{t("reminders.form.title")}</h2>

      <Input id="reminderLabel" label={t("reminders.labelLabel")} value={label} onChange={(e) => setLabel(e.target.value)} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("reminders.typeLabel")}</label>
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className={SELECT_CLASSES}>
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

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("reminders.recurrenceLabel")}</label>
        <select
          value={recurrenceRule}
          onChange={(e) => setRecurrenceRule(e.target.value as typeof recurrenceRule)}
          className={SELECT_CLASSES}
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
        <div className="flex flex-wrap gap-1.5">
          {CHANNEL_OPTIONS.map((option) => {
            const isSelected = channel === option;
            const isUnavailable = option === "PUSH";
            return (
              <button
                key={option}
                type="button"
                onClick={() => setChannel(option)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-green-600 text-white"
                    : isUnavailable
                      ? "border border-dashed border-zinc-300 text-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {t(`reminders.channel.${option.toLowerCase()}`)}
              </button>
            );
          })}
        </div>
        {channel === "PUSH" && (
          <p className="text-xs text-amber-600 dark:text-amber-400">{t("reminders.channel.pushNote")}</p>
        )}
      </div>

      {(channel === "SMS" || channel === "VOICE") &&
        (phone ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("reminders.channel.phoneNote").replace("{phone}", phone)}
          </p>
        ) : (
          <p className="flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <span aria-hidden="true">⚠</span>
            <span>{t("reminders.channel.noPhoneWarning")}</span>
          </p>
        ))}

      {error && (
        <p className="flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={handleSubmit} disabled={submitting || !label.trim() || !scheduledFor}>
          {submitting && <Spinner className="h-4 w-4" />}
          {submitting ? t("reminders.submitting") : t("reminders.submit")}
        </Button>
        {justAdded && <span className="text-sm text-green-600 dark:text-green-400">{t("reminders.success")}</span>}
      </div>
    </Card>
  );
}
