"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslation } from "@/i18n/useTranslation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { ApiErrorBody } from "@/types";

export function SignupForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || undefined, email, password }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
      setSubmitting(false);
      setError(
        body?.error === "email_taken"
          ? t("auth.signup.error.emailTaken")
          : t("auth.signup.error.generic"),
      );
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setSubmitting(false);

    if (result?.error) {
      setError(t("auth.login.error"));
      return;
    }

    router.push("/chat");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="name"
        type="text"
        label={t("auth.signup.nameLabel")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="name"
      />
      <Input
        id="email"
        type="email"
        label={t("auth.signup.emailLabel")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <Input
        id="password"
        type="password"
        label={t("auth.signup.passwordLabel")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
      />
      <p className="-mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t("auth.signup.passwordHint")}</p>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <Button type="submit" disabled={submitting} className="mt-2 w-full">
        {submitting && <Spinner className="h-4 w-4" />}
        {submitting ? t("auth.signup.submitting") : t("auth.signup.submit")}
      </Button>
    </form>
  );
}
