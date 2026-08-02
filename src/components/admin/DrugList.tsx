"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { DrugForm } from "@/components/admin/DrugForm";
import { DrugInteractionManager } from "@/components/admin/DrugInteractionManager";
import type { AdminDrugSummary } from "@/types";

export function DrugList({ drugs }: { drugs: AdminDrugSummary[] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/admin/drugs/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.message ?? t("admin.drugs.error"));
      return;
    }
    router.refresh();
  }

  if (drugs.length === 0) {
    return <p className="text-sm text-zinc-400">{t("admin.drugs.empty")}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {drugs.map((drug) => (
        <div key={drug.id} className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
          {editingId === drug.id ? (
            <DrugForm
              initial={drug}
              onSaved={() => {
                setEditingId(null);
                router.refresh();
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {drug.tradeName} <span className="text-zinc-400">({drug.genericName})</span>
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{drug.activeIngredient}</p>
              </div>
              <div className="flex shrink-0 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === drug.id ? null : drug.id)}
                  className="text-green-600 hover:underline dark:text-green-400"
                >
                  {t("admin.drugs.interactions.title")}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(drug.id)}
                  className="text-green-600 hover:underline dark:text-green-400"
                >
                  {t("admin.drugs.edit")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(drug.id)}
                  disabled={busyId === drug.id}
                  className="text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                >
                  {t("admin.drugs.delete")}
                </button>
              </div>
            </div>
          )}
          {expandedId === drug.id && editingId !== drug.id && (
            <div className="mt-3">
              <DrugInteractionManager drugId={drug.id} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
