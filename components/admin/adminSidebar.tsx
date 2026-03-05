"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiShoppingBag,
  FiUsers,
  FiSettings,
  FiChevronLeft,
} from "react-icons/fi";

interface Props {
  collapsed: boolean;
  toggle: () => void;
}

export default function AdminSidebar({ collapsed, toggle }: Props) {
  const pathname = usePathname();
  const width = collapsed ? "w-20" : "w-64";

  return (
    <aside
      className={`${width} bg-white/70 backdrop-blur-xl border-r border-gray-200 min-h-screen transition-all duration-300 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-6">
        {!collapsed && (
          <h1 className="text-xl font-bold tracking-tight">Urban Admin</h1>
        )}
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <FiChevronLeft
            className={`transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-2 px-3">
        <SidebarItem
          href="/admin"
          icon={<FiHome size={20} />}
          label="Dashboard"
          collapsed={collapsed}
          pathname={pathname}
        />
        <SidebarItem
          href="/admin/products"
          icon={<FiShoppingBag size={20} />}
          label="Products"
          collapsed={collapsed}
          pathname={pathname}
        />
        <SidebarItem
          href="/admin/orders"
          icon={<FiUsers size={20} />}
          label="Orders"
          collapsed={collapsed}
          pathname={pathname}
        />
        <SidebarItem
          href="/admin/settings"
          icon={<FiSettings size={20} />}
          label="Settings"
          collapsed={collapsed}
          pathname={pathname}
        />
      </nav>
    </aside>
  );
}

function SidebarItem({
  href,
  icon,
  label,
  collapsed,
  pathname,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  pathname: string;
}) {
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
      ${
        active
          ? "bg-indigo-100 text-indigo-700"
          : "hover:bg-indigo-50 hover:text-indigo-600"
      }`}
    >
      {icon}
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
}
