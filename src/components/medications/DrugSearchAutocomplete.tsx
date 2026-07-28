"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import type { DrugCatalogEntry } from "@/types";

export function DrugSearchAutocomplete({
  onSelect,
  initialQuery = "",
}: {
  onSelect: (drug: DrugCatalogEntry) => void;
  initialQuery?: string;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<DrugCatalogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    const timeout = setTimeout(() => {
      if (trimmed.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      fetch(`/api/medications/catalog?q=${encodeURIComponent(trimmed)}`)
        .then((res) => res.json())
        .then((data: { results: DrugCatalogEntry[] }) => setResults(data.results ?? []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="flex flex-col gap-2">
      <Input
        id="drug-search"
        label={t("medications.add.searchLabel")}
        placeholder={t("medications.add.searchPlaceholder")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />
      {loading && (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Spinner className="h-3.5 w-3.5" />
          {t("common.loading")}
        </div>
      )}
      {!loading && query.trim().length >= 2 && results.length === 0 && (
        <p className="text-sm text-zinc-400">{t("medications.add.noResults")}</p>
      )}
      {results.length > 0 && (
        <ul className="flex flex-col gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
          {results.map((drug) => (
            <li key={drug.id}>
              <button
                type="button"
                onClick={() => onSelect(drug)}
                className="flex w-full flex-col items-start rounded-md px-3 py-2 text-start transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {drug.tradeName}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {drug.genericName} · {drug.activeIngredient}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
