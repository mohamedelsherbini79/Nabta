"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { DrugSearchAutocomplete } from "@/components/medications/DrugSearchAutocomplete";
import type { AdminDrugInteractionSummary, DrugCatalogEntry } from "@/types";

const SEVERITIES = ["MILD", "MODERATE", "SEVERE"] as const;

export function DrugInteractionManager({ drugId }: { drugId: string }) {
  const { t } = useTranslation();
  const [interactions, setInteractions] = useState<AdminDrugInteractionSummary[] | null>(null);
  const [otherDrug, setOtherDrug] = useState<DrugCatalogEntry | null>(null);
  const [severity, setSeverity] = useState<(typeof SEVERITIES)[number]>("MODERATE");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const res = await fetch(`/api/admin/drugs/${drugId}/interactions`);
    const body = await res.json().catch(() => null);
    setInteractions(body?.interactions ?? []);
  }

  useEffect(() => {
    const timeout = setTimeout(load, 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drugId]);

  async function handleAdd() {
    if (!otherDrug || !description.trim()) return;
    setSubmitting(true);
    await fetch("/api/admin/drugs/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drugAId: drugId, drugBId: otherDrug.id, severity, description }),
    });
    setSubmitting(false);
    setOtherDrug(null);
    setDescription("");
    load();
  }

  async function handleRemove(id: string) {
    setSubmitting(true);
    await fetch(`/api/admin/drugs/interactions/${id}`, { method: "DELETE" });
    setSubmitting(false);
    load();
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {t("admin.drugs.interactions.title")}
      </h3>

      {interactions === null ? (
        <Spinner className="h-4 w-4" />
      ) : interactions.length === 0 ? (
        <p className="text-sm text-zinc-400">{t("admin.drugs.interactions.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {interactions.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
              <span>
                <strong>{i.drugAName}</strong> ↔ <strong>{i.drugBName}</strong> ({i.severity}) — {i.description}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(i.id)}
                disabled={submitting}
                className="shrink-0 text-xs text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
              >
                {t("admin.drugs.interactions.remove")}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-700">
        <DrugSearchAutocomplete onSelect={setOtherDrug} />
        {otherDrug && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("admin.drugs.interactions.with")}: {otherDrug.tradeName}
          </p>
        )}
        <div className="flex gap-2">
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as (typeof SEVERITIES)[number])}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("admin.drugs.interactions.descriptionPlaceholder")}
            className="flex-1 rounded-lg border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
          />
          <Button
            onClick={handleAdd}
            disabled={submitting || !otherDrug || !description.trim()}
            className="shrink-0 !px-3 !py-1 text-xs"
          >
            {t("admin.drugs.interactions.add")}
          </Button>
        </div>
      </div>
    </div>
  );
}
