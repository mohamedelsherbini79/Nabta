"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export function CheckoutForm({
  patientProfileId,
  orderId,
  onCancel,
}: {
  patientProfileId: string;
  orderId: string;
  onCancel: () => void;
}) {
  const { t } = useTranslation();

  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/pharmacy/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientProfileId,
        orderId,
        deliveryAddress: { addressLine, city, phone },
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setSubmitting(false);
      setError(data?.error === "gateway_not_configured" ? t("pharmacy.checkout.gatewayNotConfigured") : t("pharmacy.checkout.error"));
      return;
    }

    window.location.href = data.redirectUrl;
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("pharmacy.checkout.title")}</h2>

      <div className="rounded-lg border border-blue-300 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
        {t("pharmacy.checkout.demoNotice")}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          id="pharmacyAddressLine"
          label={t("pharmacy.checkout.addressLabel")}
          value={addressLine}
          onChange={(e) => setAddressLine(e.target.value)}
        />
        <Input id="pharmacyCity" label={t("pharmacy.checkout.cityLabel")} value={city} onChange={(e) => setCity(e.target.value)} />
        <Input
          id="pharmacyPhone"
          type="tel"
          label={t("pharmacy.checkout.phoneLabel")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={submitting || !addressLine.trim() || !city.trim() || !phone.trim()}
          className="self-start"
        >
          {submitting && <Spinner className="h-4 w-4" />}
          {t("pharmacy.checkout.confirm")}
        </Button>
        <Button variant="secondary" onClick={onCancel} disabled={submitting} className="self-start">
          {t("pharmacy.checkout.cancel")}
        </Button>
      </div>
    </div>
  );
}
