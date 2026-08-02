"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { InsuranceClaimStatus, InsurancePolicySummary } from "@/types";

const STATUS_BADGE_CLASSES: Record<InsuranceClaimStatus, string> = {
  SUBMITTED: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  PAID: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
};

function ClaimForm({ policyId, onDone }: { policyId: string; onDone: () => void }) {
  const { t } = useTranslation();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!description.trim() || !amount) return;
    setSubmitting(true);
    const res = await fetch(`/api/insurance/policies/${policyId}/claims`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: { description: description.trim(), amount: Number(amount) } }),
    });
    setSubmitting(false);
    if (res.ok) {
      setDescription("");
      setAmount("");
      onDone();
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Input
          id={`claim-desc-${policyId}`}
          label={t("insurance.claim.descriptionLabel")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <Input
        id={`claim-amount-${policyId}`}
        type="number"
        min={0}
        step={0.01}
        label={t("insurance.claim.amountLabel")}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="sm:w-32"
      />
      <Button
        type="button"
        variant="secondary"
        onClick={handleSubmit}
        disabled={submitting || !description.trim() || !amount}
        className="!py-2 text-xs"
      >
        {t("insurance.claim.submit")}
      </Button>
    </div>
  );
}

export function PolicyList({ policies }: { policies: InsurancePolicySummary[] }) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [addingClaimFor, setAddingClaimFor] = useState<string | null>(null);

  const dateFormatter = new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" });
  const amountFormatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });

  async function handleDeletePolicy(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/insurance/policies/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  if (policies.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-400">{t("insurance.empty")}</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {policies.map((policy) => (
        <li key={policy.id}>
          <Card className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{policy.provider}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t("insurance.policyNumberLabel")}: {policy.policyNumber}
                  {policy.memberId && ` · ${t("insurance.memberIdLabel")}: ${policy.memberId}`}
                  {policy.planType && ` · ${policy.planType}`}
                </p>
                {policy.expiryDate && (
                  <p className="text-xs text-zinc-400">
                    {t("insurance.expiryDateLabel")}: {dateFormatter.format(new Date(policy.expiryDate))}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="danger"
                onClick={() => handleDeletePolicy(policy.id)}
                disabled={busyId === policy.id}
                className="!px-2.5 !py-1 text-xs"
              >
                {t("insurance.deletePolicy")}
              </Button>
            </div>

            <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">{t("insurance.claim.title")}</p>

              {policy.claims.length === 0 && <p className="text-sm text-zinc-400">{t("insurance.claim.empty")}</p>}

              {policy.claims.length > 0 && (
                <ul className="mb-2 flex flex-col gap-1.5">
                  {policy.claims.map((claim) => (
                    <li key={claim.id} className="flex items-center justify-between gap-2 text-sm">
                      <div className="min-w-0">
                        <span className="text-zinc-900 dark:text-zinc-50">{claim.description}</span>
                        <span className="ms-2 text-zinc-500 dark:text-zinc-400">
                          {amountFormatter.format(claim.amount)} EGP
                        </span>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[claim.status]}`}>
                        {t(`insurance.claim.status.${claim.status.toLowerCase()}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {addingClaimFor === policy.id ? (
                <ClaimForm policyId={policy.id} onDone={() => router.refresh()} />
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setAddingClaimFor(policy.id)}
                  className="!px-2.5 !py-1 text-xs"
                >
                  {t("insurance.claim.add")}
                </Button>
              )}
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
