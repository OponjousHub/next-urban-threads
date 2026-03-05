"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/adminSidebar";
import AdminTopbar from "./adminTopbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        toggle={() => setCollapsed(!collapsed)}
      />

      {/* Content */}
      <div className="flex-1 transition-all duration-300">
        <AdminTopbar />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
