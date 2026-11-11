"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/adminSidebar";
import { useAdminSidebar } from "@/store/admin-sidebar-context";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { open, setOpen } = useAdminSidebar();
  const pathname = usePathname();

  const useWiderContent = [
    "/admin/orders",
    "/admin/customers",
    "/admin/support",
    "/admin/refunds",
  ].includes(pathname);

  return (
    <div className="flex min-h-screen w-full items-stretch bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Desktop Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        toggle={() => setCollapsed(!collapsed)}
      />

      {/* Dashboard Content */}
      <div
        className={`flex min-w-0 flex-1 flex-col ${
          useWiderContent ? "pl-2 pr-2 md:pl-3 md:pr-4" : "pl-6 pr-8"
        }`}
      >
        <main className="min-w-0 flex-1 bg-gray-50">{children}</main>
      </div>

      {/* Mobile Sidebar */}
      {open && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Sidebar */}
          <div className="relative z-50">
            <AdminSidebar
              collapsed={false}
              toggle={() => setOpen(false)}
              onNavigate={() => setOpen(false)}
              isMobile
            />
          </div>
        </div>
      )}
    </div>
  );
}
