import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/Card";
import { TranslatedText } from "@/components/i18n/TranslatedText";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/chat");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            <TranslatedText k="auth.login.title" />
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            <TranslatedText k="auth.login.subtitle" />
          </p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <TranslatedText k="auth.login.noAccount" />{" "}
          <Link href="/signup" className="font-medium text-green-600 hover:underline">
            <TranslatedText k="auth.login.signupLink" />
          </Link>
        </p>
      </Card>
    </div>
  );
}
