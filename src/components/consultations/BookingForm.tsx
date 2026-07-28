"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { DoctorSummary } from "@/types";

export function BookingForm({ patientProfileId, doctors }: { patientProfileId: string; doctors: DoctorSummary[] }) {
  const { t, locale } = useTranslation();
  const router = useRouter();

  const [doctorUserId, setDoctorUserId] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  async function handleDoctorChange(value: string) {
    setDoctorUserId(value);
    setSelectedSlot("");
    setSlots([]);
    setError(null);
    if (!value) return;

    setLoadingSlots(true);
    const res = await fetch(`/api/consultations/slots?doctorUserId=${value}`);
    setLoadingSlots(false);
    if (!res.ok) return;
    const body = await res.json();
    setSlots(body.slots);
  }

  async function handleBook() {
    if (!doctorUserId || !selectedSlot) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientProfileId,
        input: { doctorUserId, scheduledFor: selectedSlot },
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      setError(t("consultations.book.error"));
      return;
    }

    router.push("/consultations");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("consultations.book.doctorLabel")}</label>
        <select
          value={doctorUserId}
          onChange={(e) => handleDoctorChange(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">{t("consultations.book.selectDoctor")}</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.specialty ? `${doctor.name} — ${doctor.specialty}` : doctor.name}
            </option>
          ))}
        </select>
      </div>

      {loadingSlots && <Spinner className="h-4 w-4" />}

      {!loadingSlots && doctorUserId && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("consultations.book.slotLabel")}</label>
          {slots.length === 0 ? (
            <p className="text-sm text-zinc-400">{t("consultations.book.noSlots")}</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    selectedSlot === slot
                      ? "bg-teal-600 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {dateFormatter.format(new Date(slot))}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Button onClick={handleBook} disabled={submitting || !doctorUserId || !selectedSlot} className="self-start">
        {submitting && <Spinner className="h-4 w-4" />}
        {submitting ? t("consultations.book.submitting") : t("consultations.book.submit")}
      </Button>
    </div>
  );
}
