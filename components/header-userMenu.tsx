"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useTenant } from "@/store/tenant-provider-context";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  role: "ADMIN" | "USER" | "OWNER";
};

type Props = {
  user: User | null;
  onRemoveAvater: () => void;
  role: string | null;
};

export default function UserMenu({ user, onRemoveAvater, role }: Props) {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isMultiVendor } = useTenant();

  useClickOutside(dropdownRef, () => setOpen(false));
  if (!user) return null; // ✅ guard

  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    user.name,
  )}&backgroundColor=000000&textColor=ffffff`;

  // CLose User Menu
  const handleCloseUserMenu = () => {
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative left-5">
      {/* Avatar */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open account menu"
        aria-expanded={open}
        className="h-11 w-11 md:h-9 md:w-9 shrink-0 flex items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] mr-1 md:mr-0"
      >
        <img
          src={avatarUrl}
          alt={user.name}
          className="h-9 w-9 rounded-full border object-cover hover:ring-2 hover:ring-[var(--color-primary)] transition"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden z-50">
          {/* USER INFORMATION */}
          <div className="px-4 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 mt-1">{role}</p>
          </div>

          {/* ACCOUNT LINKS */}
          <div className="p-2">
            <Link
              href="/dashboard"
              className="flex items-center min-h-[46px] px-3 rounded-lg text-[15px] text-gray-700 hover:bg-gray-100 transition"
              onClick={handleCloseUserMenu}
            >
              My Account
            </Link>

            <Link
              href="/dashboard/order"
              className="flex items-center min-h-[46px] px-3 rounded-lg text-[15px] text-gray-700 hover:bg-gray-100 transition"
              onClick={handleCloseUserMenu}
            >
              My Orders
            </Link>

            {(role === "ADMIN" || role === "OWNER") && (
              <Link
                href="/admin"
                className="flex items-center min-h-[46px] px-3 rounded-lg text-[15px] text-gray-700 hover:bg-gray-100 transition"
                onClick={handleCloseUserMenu}
              >
                Admin Panel
              </Link>
            )}

            {role === "Vendor" && (
              <Link
                href="/vendor"
                className="flex items-center min-h-[46px] px-3 rounded-lg text-[15px] text-gray-700 hover:bg-gray-100 transition"
                onClick={handleCloseUserMenu}
              >
                Vendor Center
              </Link>
            )}

            {isMultiVendor && role === "USER" && (
              <Link
                href="/account/vendor-application"
                className="flex items-center min-h-[46px] px-3 rounded-lg text-[15px] text-gray-700 hover:bg-gray-100 transition"
                onClick={handleCloseUserMenu}
              >
                Become Seller
              </Link>
            )}

            {/* LOGOUT */}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                className="flex items-center w-full min-h-[46px] px-3 rounded-lg text-left text-[15px] text-red-600 hover:bg-red-50 transition"
                onClick={async () => {
                  await fetch("/api/auth/logout", {
                    method: "POST",
                    credentials: "include",
                  });

                  router.refresh();
                  router.replace("/");
                  onRemoveAvater();
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
