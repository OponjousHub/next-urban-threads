"use client";

import { FaBell, FaBars } from "react-icons/fa";
import { StatusBadge } from "@/lib/status-badge";
import { VendorHeaderProps } from "@/types/vendor";
import { useVendorSidebar } from "@/store/vendor-sidebar-context";

export default function VendorHeaderUI({
  title,
  subtitle,
  vendor,
}: VendorHeaderProps) {
  const { toggle } = useVendorSidebar();

  return (
    <header className="sticky top-0 z-30 border-b bg-white">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white hover:bg-gray-50 lg:hidden"
          >
            <FaBars size={16} />
          </button>

          <div>
            <h1 className="text-lg font-semibold lg:text-xl">{title}</h1>

            {subtitle && (
              <p className="hidden text-xs text-gray-500 sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-gray-50">
            <FaBell size={15} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* Vendor Profile */}
          <div className="flex items-center gap-2 rounded-full border px-2 py-1">
            {vendor?.logo ? (
              <img
                src={vendor.logo}
                alt={vendor.name || "Vendor"}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {vendor?.name?.charAt(0).toUpperCase() || "V"}
              </div>
            )}

            <div className="hidden md:block">
              <p className="max-w-[180px] truncate text-sm font-medium">
                {vendor?.name || "Vendor"}
              </p>

              <div className="mt-0.5">
                <StatusBadge status={vendor?.status || ""} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
