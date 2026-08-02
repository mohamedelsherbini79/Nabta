"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { DrugSearchAutocomplete } from "@/components/medications/DrugSearchAutocomplete";
import { CheckoutForm } from "@/components/pharmacy/CheckoutForm";
import { useCountry } from "@/country/useCountry";
import type { PharmacyCartSummary } from "@/types";
import type { DrugCatalogEntry } from "@/types";

export function PharmacyCart({ patientProfileId, cart }: { patientProfileId: string; cart: PharmacyCartSummary }) {
  const { t } = useTranslation();
  const { info: countryInfo } = useCountry();
  const router = useRouter();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  async function handleSelectDrug(drug: DrugCatalogEntry) {
    setBusyId("add");
    await fetch("/api/pharmacy/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientProfileId, drugCatalogId: drug.id, quantity: 1 }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function handleQuantityChange(itemId: string, quantity: number) {
    if (quantity < 1) return;
    setBusyId(itemId);
    await fetch(`/api/pharmacy/cart/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function handleRemove(itemId: string) {
    setBusyId(itemId);
    await fetch(`/api/pharmacy/cart/items/${itemId}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("pharmacy.search.title")}</h2>
        <DrugSearchAutocomplete onSelect={handleSelectDrug} />
        {busyId === "add" && (
          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
            <Spinner className="h-3.5 w-3.5" />
            {t("common.loading")}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("pharmacy.cart.title")}</h2>

        {cart.items.length === 0 ? (
          <p className="text-sm text-zinc-400">{t("pharmacy.cart.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {cart.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{item.tradeName}</p>
                  <p className="text-xs text-zinc-400">{item.unitPrice} {countryInfo.currency}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={busyId === item.id}
                    className="h-7 w-7 rounded-lg border border-zinc-300 text-sm disabled:opacity-50 dark:border-zinc-700"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    disabled={busyId === item.id}
                    className="h-7 w-7 rounded-lg border border-zinc-300 text-sm disabled:opacity-50 dark:border-zinc-700"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  disabled={busyId === item.id}
                  className="text-xs text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                >
                  {t("pharmacy.cart.remove")}
                </button>
              </li>
            ))}
          </ul>
        )}

        {cart.items.length > 0 && (
          <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {t("pharmacy.cart.total")}: {cart.total} {countryInfo.currency}
            </p>
            {!showCheckout && (
              <Button onClick={() => setShowCheckout(true)} className="!px-3 !py-1.5 text-xs">
                {t("pharmacy.cart.checkout")}
              </Button>
            )}
          </div>
        )}
      </div>

      {showCheckout && cart.items.length > 0 && (
        <CheckoutForm patientProfileId={patientProfileId} orderId={cart.id} onCancel={() => setShowCheckout(false)} />
      )}
    </div>
  );
}
