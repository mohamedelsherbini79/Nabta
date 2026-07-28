"use client";

import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-teal-600 text-white hover:bg-teal-700 disabled:bg-teal-300",
  secondary:
    "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 disabled:bg-zinc-50 disabled:text-zinc-400 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
  ghost:
    "bg-transparent text-zinc-700 hover:bg-zinc-100 disabled:text-zinc-400 dark:text-zinc-300 dark:hover:bg-zinc-800",
  danger: "bg-transparent text-red-600 hover:bg-red-50 disabled:text-red-300 dark:hover:bg-red-950",
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
