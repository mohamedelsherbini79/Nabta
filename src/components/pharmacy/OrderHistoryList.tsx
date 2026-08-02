"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { useCountry } from "@/country/useCountry";
import type { PharmacyOrderSummary } from "@/types";

const STATUS_LABEL_KEYS: Record<PharmacyOrderSummary["status"], string> = {
  AWAITING_PAYMENT: "pharmacy.status.AWAITING_PAYMENT",
  PLACED: "pharmacy.status.PLACED",
  CONFIRMED: "pharmacy.status.CONFIRMED",
  OUT_FOR_DELIVERY: "pharmacy.status.OUT_FOR_DELIVERY",
  DELIVERED: "pharmacy.status.DELIVERED",
  CANCELLED: "pharmacy.status.CANCELLED",
  PAYMENT_FAILED: "pharmacy.status.PAYMENT_FAILED",
};

export function OrderHistoryList({
  patientProfileId,
  orders,
}: {
  patientProfileId: string;
  orders: PharmacyOrderSummary[];
}) {
  const { t, locale } = useTranslation();
  const { info: countryInfo } = useCountry();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const dateFormatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" });

  async function handleCancel(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/pharmacy/orders/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  async function handleRetryPayment(id: string) {
    setBusyId(id);
    const res = await fetch("/api/pharmacy/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientProfileId, orderId: id }),
    });
    const data = await res.json().catch(() => null);
    setBusyId(null);
    if (res.ok && data?.redirectUrl) {
      window.location.href = data.redirectUrl;
    }
  }

  if (orders.length === 0) {
    return <p className="text-sm text-zinc-400">{t("pharmacy.orders.empty")}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {orders.map((order) => (
        <li key={order.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {t(STATUS_LABEL_KEYS[order.status])}
              </p>
              <p className="text-xs text-zinc-400">{dateFormatter.format(new Date(order.createdAt))}</p>
            </div>
            {order.status === "PLACED" && (
              <button
                type="button"
                onClick={() => handleCancel(order.id)}
                disabled={busyId === order.id}
                className="text-xs text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
              >
                {t("pharmacy.orders.cancel")}
              </button>
            )}
            {order.status === "PAYMENT_FAILED" && (
              <button
                type="button"
                onClick={() => handleRetryPayment(order.id)}
                disabled={busyId === order.id}
                className="text-xs text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
              >
                {t("pharmacy.orders.retryPayment")}
              </button>
            )}
          </div>
          <ul className="mt-2 flex flex-col gap-0.5">
            {order.items.map((item) => (
              <li key={item.id} className="text-sm text-zinc-700 dark:text-zinc-300">
                {item.tradeName} × {item.quantity}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {t("pharmacy.cart.total")}: {order.total} {countryInfo.currency}
          </p>
        </li>
      ))}
    </ul>
  );
}
