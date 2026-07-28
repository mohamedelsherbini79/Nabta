"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import { useTranslation } from "@/i18n/useTranslation";

export function BarcodeScanner({ onDecode }: { onDecode: (code: string) => void }) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let cancelled = false;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result) => {
        if (result && !cancelled) {
          onDecode(result.getText());
        }
      })
      .then((controls) => {
        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
      })
      .catch(() => {
        if (!cancelled) setError(t("medications.barcode.permissionDenied"));
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("medications.barcode.instructions")}</p>
      <video
        ref={videoRef}
        className="aspect-video w-full rounded-lg border border-zinc-300 bg-black object-cover dark:border-zinc-700"
        muted
        playsInline
      />
    </div>
  );
}
