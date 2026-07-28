"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types";

const ROLES: UserRole[] = ["PATIENT", "DOCTOR", "PHARMACIST", "ADMIN"];

export function UserRoleSelect({ userId, role, canEdit }: { userId: string; role: UserRole; canEdit: boolean }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleChange(next: UserRole) {
    setSubmitting(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: next }),
    });
    setSubmitting(false);
    router.refresh();
  }

  if (!canEdit) {
    return (
      <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
        {role}
      </span>
    );
  }

  return (
    <select
      value={role}
      disabled={submitting}
      onChange={(e) => handleChange(e.target.value as UserRole)}
      className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
