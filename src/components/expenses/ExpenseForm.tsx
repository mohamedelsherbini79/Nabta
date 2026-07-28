"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

const CATEGORY_OPTIONS = [
  "MEDICATION",
  "CONSULTATION",
  "LAB_TEST",
  "HOSPITAL",
  "INSURANCE",
  "EQUIPMENT",
  "OTHER",
] as const;
const CURRENCY_OPTIONS = ["EGP", "AED", "SAR", "QAR", "OMR", "USD"] as const;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ExpenseForm({ patientProfileId }: { patientProfileId: string }) {
  const { t } = useTranslation();
  const router = useRouter();

  const [category, setCategory] = useState<(typeof CATEGORY_OPTIONS)[number]>("MEDICATION");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<(typeof CURRENCY_OPTIONS)[number]>("EGP");
  const [incurredAt, setIncurredAt] = useState(today());
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!amount || Number(amount) <= 0) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientProfileId,
        input: {
          category,
          amount: Number(amount),
          currency,
          incurredAt,
          note: note.trim() || null,
        },
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(t("expenses.error"));
      return;
    }

    setAmount("");
    setNote("");
    setIncurredAt(today());
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("expenses.categoryLabel")}</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`expenses.category.${option.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>
        <Input
          id="expenseDate"
          type="date"
          label={t("expenses.dateLabel")}
          value={incurredAt}
          onChange={(e) => setIncurredAt(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          id="expenseAmount"
          type="number"
          min={0}
          step="0.01"
          label={t("expenses.amountLabel")}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("expenses.currencyLabel")}</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as typeof currency)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {CURRENCY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input id="expenseNote" label={t("expenses.noteLabel")} value={note} onChange={(e) => setNote(e.target.value)} />

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Button onClick={handleSubmit} disabled={submitting || !amount || Number(amount) <= 0} className="self-start">
        {submitting && <Spinner className="h-4 w-4" />}
        {submitting ? t("expenses.submitting") : t("expenses.submit")}
      </Button>
    </div>
  );
}
