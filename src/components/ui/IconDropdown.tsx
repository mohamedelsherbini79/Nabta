"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface IconDropdownOption {
  code: string;
  label: string;
  icon?: ReactNode;
}

export function IconDropdown({
  value,
  options,
  onChange,
  ariaLabel,
  hideLabelOnMobile = true,
}: {
  value: string;
  options: IconDropdownOption[];
  onChange: (code: string) => void;
  ariaLabel: string;
  hideLabelOnMobile?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.code === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function select(code: string) {
    setOpen(false);
    if (code !== value) onChange(code);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {current.icon && (
          <span className="flex h-4 w-6 shrink-0 items-center justify-center overflow-hidden rounded-[3px] ring-1 ring-black/10 dark:ring-white/20">
            {current.icon}
          </span>
        )}
        <span className={hideLabelOnMobile ? "hidden sm:inline" : ""}>{current.label}</span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className={`h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        role="listbox"
        aria-label={ariaLabel}
        className={`absolute end-0 top-full z-20 mt-2 w-48 origin-top rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg transition duration-150 ease-out dark:border-zinc-800 dark:bg-zinc-900 ${
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        {options.map((option) => {
          const selected = option.code === value;
          return (
            <button
              key={option.code}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => select(option.code)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-sm transition-colors ${
                selected
                  ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {option.icon && (
                <span className="flex h-4 w-6 shrink-0 items-center justify-center overflow-hidden rounded-[3px] ring-1 ring-black/10 dark:ring-white/20">
                  {option.icon}
                </span>
              )}
              <span className="flex-1 truncate">{option.label}</span>
              {selected && (
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
                  <path d="M5 10.5l3.5 3.5 6.5-7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
