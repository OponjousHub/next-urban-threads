"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { StatusBadge } from "@/lib/status-badge";
import {
  FaStore,
  FaBox,
  FaShoppingCart,
  FaCog,
  FaChartLine,
  FaUsers,
  FaStar,
  FaTimes,
} from "react-icons/fa";

import { useVendorSidebar } from "@/store/vendor-sidebar-context";

const links = [
  {
    label: "Dashboard",
    href: "/vendor",
    icon: FaChartLine,
  },
  {
    label: "Products",
    href: "/vendor/products",
    icon: FaBox,
  },
  {
    label: "Orders",
    href: "/vendor/orders",
    icon: FaShoppingCart,
  },
  {
    label: "Customers",
    href: "/vendor/customers",
    icon: FaUsers,
  },
  {
    label: "Reviews",
    href: "/vendor/reviews",
    icon: FaStar,
  },
  {
    label: "Store Settings",
    href: "/vendor/settings",
    icon: FaCog,
  },
];

type VendorSidebarProps = {
  vendor: {
    id: string;
    name: string;
    logo: string | null;
    status: string;
  } | null;
};

export default function VendorSidebar({ vendor }: VendorSidebarProps) {
  const pathname = usePathname();

  const { open, setOpen } = useVendorSidebar();

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50
          h-screen w-72
          border-r bg-white

          transition-transform duration-300

          ${open ? "translate-x-0" : "-translate-x-full"}

          lg:static
          lg:translate-x-0
        `}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between border-b p-4 lg:hidden">
          <h2 className="font-semibold">Vendor Center</h2>

          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <FaTimes />
          </button>
        </div>

        {/* Store Branding */}
        <div className="border-b p-6 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-bold text-white">
              {vendor?.logo ? (
                <img
                  src={vendor.logo}
                  alt={vendor.name || "Vendor"}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-sm font-semibold text-[var(--color-primary)]">
                  {vendor?.name?.charAt(0).toUpperCase() || "V"}
                </div>
              )}
            </div>

            <div>
              <p className="font-semibold">{vendor?.name || "Vendor"}</p>

              <p className="text-xs text-gray-500">
                <StatusBadge status={vendor?.status || ""} />
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-3">
          {links.map((link) => {
            const Icon = link.icon;

            const active =
              link.href === "/vendor"
                ? pathname === "/vendor"
                : pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3
                  rounded-xl px-4 py-3
                  text-sm font-medium

                  transition-all

                  ${
                    active
                      ? "bg-[var(--color-primary-lighter)] text-[var(--color-primary)]"
                      : "text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                <Icon size={18} />

                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
          >
            <FaStore />
            View Store
          </Link>
        </div>
      </aside>
    </>
  );
}
