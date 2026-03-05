"use client";

import Link from "next/link";
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
        />
        <SidebarItem
          href="/admin/products"
          icon={<FiShoppingBag size={20} />}
          label="Products"
          collapsed={collapsed}
        />
        <SidebarItem
          href="/admin/orders"
          icon={<FiUsers size={20} />}
          label="Orders"
          collapsed={collapsed}
        />
        <SidebarItem
          href="/admin/settings"
          icon={<FiSettings size={20} />}
          label="Settings"
          collapsed={collapsed}
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
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group"
    >
      {icon}
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
}

// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   LayoutDashboard,
//   Package,
//   ShoppingCart,
//   Users,
//   Star,
//   Settings,
// } from "lucide-react";

// const navItems = [
//   { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
//   { name: "Products", href: "/admin/products", icon: Package },
//   { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
//   { name: "Customers", href: "/admin/customers", icon: Users },
//   { name: "Reviews", href: "/admin/reviews", icon: Star },
//   { name: "Settings", href: "/admin/settings", icon: Settings },
// ];

// export default function AdminSidebar() {
//   const pathname = usePathname();

//   return (
//     <aside className="w-64 bg-white border-r border-gray-100 p-6 md:flex flex-col">
//       <h2 className="text-xl font-bold mb-10">
//         Urban<span className="text-indigo-600">Admin</span>
//       </h2>

//       <nav className="flex flex-col gap-2">
//         {navItems.map((item) => {
//           const Icon = item.icon;
//           const isActive = pathname === item.href;

//           return (
//             <Link
//               key={item.name}
//               href={item.href}
//               className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
//                 isActive
//                   ? "bg-black text-white"
//                   : "text-gray-600 hover:bg-gray-100"
//               }`}
//             >
//               <Icon size={18} />
//               {item.name}
//             </Link>
//           );
//         })}
//       </nav>
//     </aside>
//   );
// }
