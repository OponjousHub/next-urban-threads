"use client";

import { FaBars } from "react-icons/fa";
import { useAdminSidebar } from "@/store/admin-sidebar-context";
import NotificationBell from "../vendor/notification-bell/notification-bell";

type AdminHeaderProps = {
  title: string;
  subtitle?: string;
  admin?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export default function AdminHeaderUI({
  title,
  subtitle,
  admin,
}: AdminHeaderProps) {
  const { toggle } = useAdminSidebar();

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
          <div className="relative">
            <NotificationBell />

            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </div>

          {/* Admin Profile */}
          <div className="flex items-center gap-2 rounded-full border px-2 py-1">
            {admin?.image ? (
              <img
                src={admin.image}
                alt={admin.name || "Administrator"}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                {(admin?.name?.charAt(0) || "A").toUpperCase()}
              </div>
            )}

            <div className="hidden md:block">
              <p className="max-w-[180px] truncate text-sm font-medium">
                {admin?.name || "Administrator"}
              </p>

              <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                Administrator
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
