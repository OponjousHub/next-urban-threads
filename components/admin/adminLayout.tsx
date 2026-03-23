"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/adminSidebar";
import AdminTopbar from "./adminTopbar";

type User = {
  name: string;
  image?: string | null;
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const getUser = async () => {
      const user = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/users/me`,
        {
          cache: "no-store",
        },
      ).then((res) => res.json());
      setUser(user);
    };
    getUser();
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 ">
      {/* Desktop Sidebar */}
      <AdminSidebar
        collapsed={collapsed}
        toggle={() => setCollapsed(!collapsed)}
      />

      {/* Right side */}
      <div className="flex flex-col flex-1">
        <AdminTopbar toggle={() => setMobileOpen(!mobileOpen)} user={user} />

        <main className="flex-1 mb-10 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex mt-10">
          {/* Blur backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Mobile sidebar */}
          <div className="relative z-50">
            <AdminSidebar
              collapsed={false}
              toggle={() => setMobileOpen(false)}
              isMobile={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
