import Link from "next/link";
import { TranslatedText } from "@/components/i18n/TranslatedText";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { LogoutButton } from "@/components/auth/LogoutButton";

export function DoctorHeader({ doctorName }: { doctorName: string | null }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <div className="flex min-w-0 items-center gap-4">
        <div className="min-w-0">
          <h1 className="truncate pe-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            <TranslatedText k="app.name" />
          </h1>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{doctorName ?? "—"}</p>
        </div>
        <Link
          href="/doctor/consultations"
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <TranslatedText k="doctor.consultations.title" />
        </Link>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <LanguageToggle />
        <LogoutButton />
      </div>
    </header>
  );
}
