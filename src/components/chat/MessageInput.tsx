"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Button } from "@/components/ui/Button";

export function MessageInput({
  onSend,
  disabled,
  placeholderKey = "chat.placeholder",
}: {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholderKey?: string;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t(placeholderKey)}
        rows={1}
        disabled={disabled}
        className="max-h-40 flex-1 resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <Button type="submit" disabled={disabled || value.trim().length === 0}>
        {t("chat.send")}
      </Button>
    </form>
  );
}
