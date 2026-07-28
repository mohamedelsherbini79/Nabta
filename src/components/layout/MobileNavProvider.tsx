"use client";

import { createContext, useContext, useState } from "react";

interface MobileNavContextValue {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MobileNavContext.Provider
      value={{
        isOpen,
        toggle: () => setIsOpen((prev) => !prev),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav() {
  const ctx = useContext(MobileNavContext);
  if (!ctx) {
    throw new Error("useMobileNav must be used within MobileNavProvider");
  }
  return ctx;
}

// Returns null instead of throwing — for components like MobileMenuButton
// that render in places both with and without a MobileNavProvider ancestor.
export function useMobileNavOptional() {
  return useContext(MobileNavContext);
}
