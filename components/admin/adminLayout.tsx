"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/adminSidebar";
import { useAdminSidebar } from "@/store/admin-sidebar-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  // ✅ Mobile sidebar state comes from context
  const { open, setOpen } = useAdminSidebar();

  // useEffect(() => {
  //   const getUser = async () => {
  //     try {
  //       const res = await fetch("/api/users/me", {
  //         cache: "no-store",
  //       });

  //       if (!res.ok) {
  //         throw new Error("Failed to get user");
  //       }

  //       await res.json();
  //     } catch (error) {
  //       console.error("User fetch error:", error);
  //     }
  //   };

  //   getUser();
  // }, []);

  return (
    <>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Desktop Sidebar */}
        <AdminSidebar
          collapsed={collapsed}
          toggle={() => setCollapsed(!collapsed)}
        />

        {/* Right side */}
        <div className="flex flex-1 flex-col">
          <main className="mb-10 flex-1 overflow-y-auto bg-gray-50">
            {children}
          </main>
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
    </>
  );
}
