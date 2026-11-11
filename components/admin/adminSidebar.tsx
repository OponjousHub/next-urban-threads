"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTenant } from "@/store/tenant-provider-context";
import { FiX } from "react-icons/fi";
import {
  FiHome,
  FiShoppingBag,
  FiUsers,
  FiInbox,
  FiPackage,
  FiUserCheck,
  FiUserPlus,
  FiStar,
  FiSettings,
  FiChevronLeft,
  FiCreditCard,
  FiTruck,
  FiUser,
  FiTag,
  FiRotateCcw,
} from "react-icons/fi";

interface Props {
  collapsed: boolean;
  toggle: () => void;
  isMobile?: boolean;
  onNavigate?: () => void;
}

export default function AdminSidebar({
  collapsed,
  toggle,
  isMobile = false,
  onNavigate,
}: Props) {
  const pathname = usePathname();
  const { tenant, storeMode } = useTenant();

  // On mobile, always full width
  const width = isMobile ? "w-72" : collapsed ? "w-20" : "w-72";
  return (
    <aside
      className={`
  ${isMobile ? "flex" : "hidden lg:flex"}
  ${width} h-dvh min-h-0 flex-col overflow-hidden
  border-r border-gray-200 bg-white shadow-sm
  transition-all duration-300 z-50
`}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-5 mt-14 md:mt-0">
        {!collapsed && (
          <h1 className="text-xl font-bold tracking-tight">
            {tenant.name.split(" ")[0]} Admin
          </h1>
        )}

        <div className="flex items-center gap-2">
          {/* Collapse (desktop only) */}
          {!isMobile && (
            <button
              onClick={toggle}
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <FiChevronLeft
                className={`transition-transform ${
                  collapsed ? "rotate-180" : ""
                }`}
              />
            </button>
          )}

          {/* Close (mobile only) */}
          {isMobile && (
            <button
              onClick={toggle}
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <FiX size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4">
        <SidebarItem
          href="/admin"
          icon={<FiHome size={20} />}
          label="Dashboard"
          collapsed={collapsed}
          pathname={pathname}
          onNavigate={onNavigate}
        />
        <SidebarItem
          href="/admin/products"
          icon={<FiShoppingBag size={20} />}
          label="Products"
          collapsed={collapsed}
          pathname={pathname}
          onNavigate={onNavigate}
        />
        <SidebarItem
          href="/admin/orders"
          icon={<FiPackage size={20} />}
          label="Orders"
          collapsed={collapsed}
          pathname={pathname}
          onNavigate={onNavigate}
        />
        <SidebarItem
          href="/admin/customers"
          icon={<FiUsers size={20} />}
          label="Customers"
          collapsed={collapsed}
          pathname={pathname}
          onNavigate={onNavigate}
        />
        <SidebarItem
          href="/admin/reviews"
          icon={<FiStar size={20} />}
          label="Reviews"
          collapsed={collapsed}
          pathname={pathname}
          onNavigate={onNavigate}
        />

        <SidebarItem
          href="/admin/support"
          icon={<FiInbox size={20} />}
          label="Inbox"
          collapsed={collapsed}
          pathname={pathname}
          onNavigate={onNavigate}
        />
        <SidebarItem
          href="/admin/coupons"
          icon={<FiTag size={20} />}
          label="Coupons"
          collapsed={collapsed}
          pathname={pathname}
          onNavigate={onNavigate}
        />
        <SidebarItem
          href="/admin/shipping"
          icon={<FiTruck size={20} />}
          label="Shipping"
          collapsed={collapsed}
          pathname={pathname}
          onNavigate={onNavigate}
        />
        {tenant.storeMode === "MULTI_VENDOR" && (
          <SidebarItem
            href="/admin/vendors/application"
            icon={<FiUserPlus size={20} />}
            label="Vendor Applications"
            collapsed={collapsed}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        )}
        {tenant.storeMode === "MULTI_VENDOR" && (
          <SidebarItem
            href="/admin/vendors/manageVendors"
            icon={<FiUserCheck size={20} />}
            label="Manage Vendors"
            collapsed={collapsed}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        )}
        {tenant.storeMode === "MULTI_VENDOR" && (
          <SidebarItem
            href="/admin/payouts"
            icon={<FiCreditCard size={20} />}
            label="Vendor Payouts"
            collapsed={collapsed}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        )}
        <SidebarItem
          href="/admin/refunds"
          icon={<FiRotateCcw size={20} />}
          label="Manage Refund"
          collapsed={collapsed}
          pathname={pathname}
          onNavigate={onNavigate}
        />
        <SidebarItem
          href="/admin/administrator"
          icon={<FiUser size={20} />}
          label="Administrator"
          collapsed={collapsed}
          pathname={pathname}
          onNavigate={onNavigate}
        />
        <SidebarItem
          href="/admin/settings"
          icon={<FiSettings size={20} />}
          label="Settings"
          collapsed={collapsed}
          pathname={pathname}
          onNavigate={onNavigate}
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
  onNavigate,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active =
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-xl px-3 py-3.5
  text-[15px] font-normal tracking-[-0.01em] transition-all duration-200
  ${
    active
      ? "bg-[var(--color-primary-lighter)] text-[var(--color-primary-dark)]"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-950"
  }
`}
    >
      <span className="flex shrink-0 items-center justify-center">{icon}</span>

      {!collapsed && <span className="truncate font-normal">{label}</span>}
    </Link>
  );
}
