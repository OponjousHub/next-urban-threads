// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useVendorSidebar } from "@/store/vendor-sidebar-context";

// import {
//   FaChartBar,
//   FaBox,
//   FaShoppingBag,
//   FaUsers,
//   FaStar,
//   FaCog,
// } from "react-icons/fa";

// const links = [
//   {
//     href: "/vendor",
//     label: "Dashboard",
//     icon: FaChartBar,
//   },
//   {
//     href: "/vendor/products",
//     label: "Products",
//     icon: FaBox,
//   },
//   {
//     href: "/vendor/orders",
//     label: "Orders",
//     icon: FaShoppingBag,
//   },
//   {
//     href: "/vendor/customers",
//     label: "Customers",
//     icon: FaUsers,
//   },
//   {
//     href: "/vendor/reviews",
//     label: "Reviews",
//     icon: FaStar,
//   },
//   {
//     href: "/vendor/settings",
//     label: "Settings",
//     icon: FaCog,
//   },
// ];

// export default function VendorSidebar() {
//   const pathname = usePathname();
//   const { open, setOpen } = useVendorSidebar();

//   return (
//     <aside className="w-64 border-r bg-white">
//       <div className="border-b p-6">
//         <h2 className="font-bold text-xl">Vendor Panel</h2>
//       </div>

//       <nav className="p-4 space-y-2">
//         {links.map((link) => {
//           const Icon = link.icon;

//           const active = pathname === link.href;

//           return (
//             <Link
//               key={link.href}
//               href={link.href}
//               className={`
//                 flex items-center gap-3
//                 rounded-xl px-4 py-3
//                 transition
//                 ${
//                   active
//                     ? "bg-[var(--color-primary)] text-white"
//                     : "hover:bg-gray-100"
//                 }
//               `}
//             >
//               <Icon size={16} />
//               {link.label}
//             </Link>
//           );
//         })}
//       </nav>
//     </aside>
//   );
// }
// "use client";

// import { FaBars, FaBell } from "react-icons/fa";
// import { useVendorSidebar } from "@/store/vendor-sidebar-context";

// type VendorHeaderProps = {
//   title: string;
//   subtitle?: string;
//   vendor: {
//     name?: string;
//     status?: string;
//     logo?: string | null;
//   } | null;
// };

// export default function VendorHeader({
//   title,
//   subtitle,
//   vendor,
// }: VendorHeaderProps) {
//   const { toggle } = useVendorSidebar();
//   const { open, setOpen } = useVendorSidebar();

//   const vendorName = vendor?.name || "Vendor Store";
//   const vendorStatus = vendor?.status || "";
//   const vendorInitial = vendorName.charAt(0).toUpperCase();

//   return (
//     <header className="sticky top-0 z-30 border-b bg-white">
//       <div className="flex h-16 items-center justify-between px-4 lg:px-6">
//         {/* Mobile Overlay */}
//         {open && (
//           <div
//             onClick={() => setOpen(false)}
//             className="fixed inset-0 z-40 bg-black/50 lg:hidden"
//           />
//         )}

//         {/* Left */}
//         <div className="flex items-center gap-3">
//           <button
//             onClick={toggle}
//             className="flex h-10 w-10 items-center justify-center rounded-xl border hover:bg-gray-50 lg:hidden"
//           >
//             <FaBars size={16} />
//           </button>

//           <div>
//             <h1 className="text-lg font-bold lg:text-xl">{title}</h1>

//             {subtitle && (
//               <p className="hidden text-sm text-muted-foreground md:block">
//                 {subtitle}
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Right */}
//         <div className="flex items-center gap-4">
//           {/* Notifications */}
//           <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border hover:bg-gray-50">
//             <FaBell size={16} />

//             <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
//           </button>

//           {/* Vendor Profile */}
//           <div className="flex items-center gap-3">
//             {vendor?.logo ? (
//               <img
//                 src={vendor.logo}
//                 alt={vendorName}
//                 className="h-10 w-10 rounded-full border object-cover"
//               />
//             ) : (
//               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white">
//                 {vendorInitial}
//               </div>
//             )}

//             <div className="hidden md:block">
//               <p className="max-w-[180px] truncate font-medium">{vendorName}</p>

//               <div className="flex items-center gap-2">
//                 <span
//                   className={`h-2 w-2 rounded-full ${
//                     vendorStatus === "APPROVED"
//                       ? "bg-green-500"
//                       : vendorStatus === "SUSPENDED"
//                         ? "bg-red-500"
//                         : "bg-yellow-500"
//                   }`}
//                 />

//                 <p className="text-xs text-muted-foreground">{vendorStatus}</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function VendorSidebar() {
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
        <div className="border-b p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
              V
            </div>

            <div>
              <p className="font-semibold">Vendor Store</p>

              <p className="text-xs text-gray-500">Seller Account</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-3">
          {links.map((link) => {
            const Icon = link.icon;

            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

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
                      ? "bg-blue-50 text-blue-600"
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
