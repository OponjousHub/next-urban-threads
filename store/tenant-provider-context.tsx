"use client";

import { createContext, useContext } from "react";
import { Tenant } from "@/types/tenant";

type StoreMode = "SINGLE_VENDOR" | "MULTI_VENDOR";

type TenantContextType = {
  tenant: Tenant;

  storeMode: StoreMode;
  isSingleVendor: boolean;
  isMultiVendor: boolean;
};

const TenantContext = createContext<TenantContextType | null>(null);

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: Tenant;
  children: React.ReactNode;
}) {
  // Use DB value ONLY
  const storeMode = tenant.storeMode || "SINGLE_VENDOR";

  return (
    <TenantContext.Provider
      value={{
        tenant,
        storeMode,
        isSingleVendor: storeMode === "SINGLE_VENDOR",

        isMultiVendor: storeMode === "MULTI_VENDOR",
      }}
    >
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
