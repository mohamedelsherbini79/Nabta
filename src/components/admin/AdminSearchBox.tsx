"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";

export function AdminSearchBox({ basePath, initialQuery = "" }: { basePath: string; initialQuery?: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    router.push(params.toString() ? `${basePath}?${params.toString()}` : basePath);
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm gap-2">
      <Input
        id="adminSearch"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("admin.searchPlaceholder")}
      />
    </form>
  );
}
