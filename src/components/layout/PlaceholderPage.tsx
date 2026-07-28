export function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">{title}</h1>
      {description && (
        <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      )}
      <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
        This module is part of the platform roadmap and hasn&apos;t been built yet.
      </p>
    </div>
  );
}
