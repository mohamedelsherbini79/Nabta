"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { DailyCall } from "@daily-co/daily-js";

type CallState = "loading" | "gatewayNotConfigured" | "error" | "inCall";

export function CallScreen({
  consultationId,
  otherPartyLabel,
  backHref,
}: {
  consultationId: string;
  otherPartyLabel: string;
  backHref: string;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall | null>(null);
  const [state, setState] = useState<CallState>("loading");
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function join() {
      const res = await fetch(`/api/consultations/${consultationId}/join`, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (cancelled) return;

      if (!res.ok) {
        setState(data?.error === "gateway_not_configured" ? "gatewayNotConfigured" : "error");
        return;
      }

      const { default: DailyIframe } = await import("@daily-co/daily-js");
      if (cancelled || !containerRef.current) return;

      const call = DailyIframe.createFrame(containerRef.current, {
        showLeaveButton: false,
        iframeStyle: { width: "100%", height: "100%", border: "0" },
      });
      callRef.current = call;
      call.on("error", (event) => console.error("Daily call error event:", event));
      await call.join({ url: data.roomUrl, token: data.token });
      if (!cancelled) setState("inCall");
    }

    join().catch((err) => {
      console.error("Daily join failed:", err);
      if (!cancelled) setState("error");
    });

    return () => {
      cancelled = true;
      callRef.current?.destroy();
      callRef.current = null;
    };
  }, [consultationId]);

  async function handleEndCall() {
    setEnding(true);
    await callRef.current?.leave();
    await fetch(`/api/consultations/${consultationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    router.push(backHref);
    router.refresh();
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-950 text-white">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <p className="text-sm font-medium">{otherPartyLabel}</p>
        <Button
          variant="danger"
          onClick={handleEndCall}
          disabled={ending}
          className="!bg-red-600 !text-white hover:!bg-red-700"
        >
          {t("consultations.call.end")}
        </Button>
      </div>

      <div className="relative flex-1">
        {state === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Spinner className="h-6 w-6" />
            <p className="text-sm text-zinc-400">{t("consultations.call.connecting")}</p>
          </div>
        )}
        {state === "gatewayNotConfigured" && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
            <p className="text-sm text-amber-300">{t("consultations.call.gatewayNotConfigured")}</p>
          </div>
        )}
        {state === "error" && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
            <p className="text-sm text-red-400">{t("consultations.call.error")}</p>
          </div>
        )}
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
