"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  FaChartBar,
  FaBox,
  FaShoppingBag,
  FaUsers,
  FaStar,
  FaCog,
} from "react-icons/fa";

const links = [
  {
    href: "/vendor",
    label: "Dashboard",
    icon: FaChartBar,
  },
  {
    href: "/vendor/products",
    label: "Products",
    icon: FaBox,
  },
  {
    href: "/vendor/orders",
    label: "Orders",
    icon: FaShoppingBag,
  },
  {
    href: "/vendor/customers",
    label: "Customers",
    icon: FaUsers,
  },
  {
    href: "/vendor/reviews",
    label: "Reviews",
    icon: FaStar,
  },
  {
    href: "/vendor/settings",
    label: "Settings",
    icon: FaCog,
  },
];

export default function VendorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-white">
      <div className="border-b p-6">
        <h2 className="font-bold text-xl">Vendor Panel</h2>
      </div>

      <nav className="p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;

          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center gap-3
                rounded-xl px-4 py-3
                transition
                ${
                  active
                    ? "bg-[var(--color-primary)] text-white"
                    : "hover:bg-gray-100"
                }
              `}
            >
              <Icon size={16} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
