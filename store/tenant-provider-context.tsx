"use client";

import { createContext, useContext } from "react";
import { Tenant } from "@/types/tenant";

type TenantContextType = {
  tenant: Tenant;
};

const TenantContext = createContext<TenantContextType | null>(null);

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: Tenant;
  children: React.ReactNode;
}) {
  return (
    <TenantContext.Provider value={{ tenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);

  if (!context) {
    throw new Error("useTenant must be used inside TenantProvider");
  }

  return context;
}
