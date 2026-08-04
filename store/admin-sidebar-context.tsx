"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";

type SidebarContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function AdminSidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    setOpen((prev) => !prev);
  };

  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggle,
    }),
    [open],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useAdminSidebar must be used inside AdminSidebarProvider");
  }

  return context;
}
