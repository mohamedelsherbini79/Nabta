"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import type { HealthFacilitySummary, HealthFacilityType } from "@/types";

const TYPE_OPTIONS: HealthFacilityType[] = ["HOSPITAL", "CLINIC", "PHARMACY", "LAB"];

const SELECT_CLASSES =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export function FacilitySearch({
  initialFacilities,
  initialCities,
}: {
  initialFacilities: HealthFacilitySummary[];
  initialCities: string[];
}) {
  const { t } = useTranslation();
  const [city, setCity] = useState("");
  const [type, setType] = useState<HealthFacilityType | "">("");
  const [facilities, setFacilities] = useState(initialFacilities);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (city) params.set("city", city);
      if (type) params.set("type", type);

      fetch(`/api/health-map?${params.toString()}`)
        .then((res) => res.json())
        .then((data: { facilities: HealthFacilitySummary[] }) => setFacilities(data.facilities ?? []))
        .catch(() => setFacilities([]))
        .finally(() => setLoading(false));
    }, 0);

    return () => clearTimeout(timeout);
  }, [city, type]);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("healthMap.cityLabel")}</label>
          <select value={city} onChange={(e) => setCity(e.target.value)} className={SELECT_CLASSES}>
            <option value="">{t("healthMap.allCities")}</option>
            {initialCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("healthMap.typeLabel")}</label>
          <select value={type} onChange={(e) => setType(e.target.value as HealthFacilityType | "")} className={SELECT_CLASSES}>
            <option value="">{t("healthMap.allTypes")}</option>
            {TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`healthMap.type.${option.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Spinner className="h-3.5 w-3.5" />
          {t("common.loading")}
        </div>
      )}

      {!loading && facilities.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-400">{t("healthMap.empty")}</p>
        </div>
      )}

      {!loading && facilities.length > 0 && (
        <ul className="flex flex-col gap-3">
          {facilities.map((facility) => {
            const mapsHref =
              facility.lat !== null && facility.lng !== null
                ? `https://www.google.com/maps/search/?api=1&query=${facility.lat},${facility.lng}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${facility.name}, ${facility.address}, ${facility.city}`)}`;

            return (
              <li key={facility.id}>
                <Card className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{facility.name}</p>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-200">
                        {t(`healthMap.type.${facility.type.toLowerCase()}`)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {facility.address}, {facility.city}
                    </p>
                    {facility.phone && <p className="text-xs text-zinc-400">{facility.phone}</p>}
                  </div>
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
                  >
                    {t("healthMap.directions")}
                  </a>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
