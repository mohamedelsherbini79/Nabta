"use client";

import { useState, type KeyboardEvent } from "react";

export function TagListInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function addTag() {
    const trimmed = draft.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>}
      <div className="flex flex-wrap items-center gap-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label="Remove"
              className="ms-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              ✕
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={placeholder}
          className="min-w-[8rem] flex-1 rounded-lg border border-zinc-300 px-2 py-1 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>
    </div>
  );
}
