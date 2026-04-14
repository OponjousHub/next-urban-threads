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
  isMobile?: boolean;
}

export default function AdminSidebar({
  collapsed,
  toggle,
  isMobile = false,
}: Props) {
  const pathname = usePathname();

  // On mobile, always full width
  const width = isMobile ? "w-64" : collapsed ? "w-20" : "w-64";

  return (
    <aside
      className={`
        ${isMobile ? "flex" : "hidden lg:flex"}
        ${width} flex-col bg-white shadow-lg border-r border-gray-200 h-full transition-all duration-300 z-50
      `}
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
            className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
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
          href="/admin/support"
          icon={<FiUsers size={20} />}
          label="Support"
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
  const active =
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl duration-200
        ${
          active
            ? "bg-[var(--color-primary-lighter)] text-[var(--color-primary-dark)]"
            : "hover:bg-[var(--color-primary-lightest)] hover:text-indigo-600hover:bg-[var(--color-primary)]"
        }
      `}
    >
      {icon}
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
}
