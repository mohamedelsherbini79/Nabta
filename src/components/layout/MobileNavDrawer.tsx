"use client";

import { useMobileNav } from "./MobileNavProvider";

// Same content, two presentations: an in-flow desktop column (md+, matching
// the previous fixed `<aside>` look exactly) and a mobile off-canvas panel
// pinned to the logical start edge — `start-0` (not `left-0`) so it opens
// from the right side in RTL locales without any direction-aware transform
// logic.
export function MobileNavDrawer({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useMobileNav();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={close} aria-hidden="true" />
      )}
      <div
        className={`${isOpen ? "flex" : "hidden"} fixed inset-y-0 start-0 z-40 w-72 shrink-0 flex-col overflow-y-auto border-e border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 md:static md:z-auto md:flex md:w-64`}
        onClick={close}
      >
        {children}
      </div>
    </>
  );
}
