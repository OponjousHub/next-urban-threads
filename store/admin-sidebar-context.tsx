"use client";

import { createContext, useContext, useState } from "react";

type SidebarContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function AdminSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        toggle: () => setOpen((v) => !v),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useAdminSidebar must be used inside AdminSidebarProvider");
  }

  return context;
}
