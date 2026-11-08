"use client";

import { createContext, useContext, useState } from "react";
import { Tenant } from "@/types/tenant";

import {
  darkenColor,
  lightenColor,
  lighterColor,
  lightestColor,
  hexToRgba,
} from "@/utils/color-shades";

type StoreMode = "SINGLE_VENDOR" | "MULTI_VENDOR";

type TenantContextType = {
  tenant: Tenant;
  storeMode: StoreMode;
  isSingleVendor: boolean;
  isMultiVendor: boolean;
  updatePrimaryColor: (color: string) => void;
};

const TenantContext = createContext<TenantContextType | null>(null);

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: Tenant;
  children: React.ReactNode;
}) {
  const [currentTenant, setCurrentTenant] = useState(tenant);

  const storeMode = currentTenant.storeMode || "SINGLE_VENDOR";

  function updatePrimaryColor(color: string) {
    const primaryColor = color || "#6366f1";

    setCurrentTenant((current) => ({
      ...current,
      primaryColor,
    }));

    document.body.style.setProperty("--color-primary", primaryColor);
    document.body.style.setProperty(
      "--color-primary-dark",
      darkenColor(primaryColor, 20),
    );
    document.body.style.setProperty(
      "--color-primary-light",
      lightenColor(primaryColor, 20),
    );
    document.body.style.setProperty(
      "--color-primary-lighter",
      lighterColor(primaryColor, 60),
    );
    document.body.style.setProperty(
      "--color-primary-lightest",
      lightestColor(primaryColor, 70),
    );
    document.body.style.setProperty(
      "--color-primary-ring",
      hexToRgba(primaryColor, 0.3),
    );
  }

  return (
    <TenantContext.Provider
      value={{
        tenant: currentTenant,
        storeMode,
        isSingleVendor: storeMode === "SINGLE_VENDOR",
        isMultiVendor: storeMode === "MULTI_VENDOR",
        updatePrimaryColor,
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
