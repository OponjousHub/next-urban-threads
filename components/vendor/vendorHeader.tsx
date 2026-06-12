"use client";

import { FaBell } from "react-icons/fa";
import { StatusBadge } from "@/lib/status-badge";
import { VendorHeaderProps } from "@/types/vendor";

export default function VendorHeaderUI({
  title,
  subtitle,
  vendor,
}: VendorHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>

          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button className="relative rounded-xl border p-2 hover:bg-gray-50">
            <FaBell size={16} />

            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <div className="flex items-center gap-3">
            {vendor?.logo ? (
              <img
                src={vendor?.logo}
                alt={vendor?.name || "Vendor"}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-semibold">
                {vendor?.name?.charAt(0).toUpperCase() || "V"}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <p className="font-medium">{vendor?.name || "Vendor"}</p>

              <p className="hidden md:block text-xs text-muted-foreground">
                <StatusBadge status={vendor?.status || ""} />
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
