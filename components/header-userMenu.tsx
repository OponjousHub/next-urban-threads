"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  role: "ADMIN" | "USER";
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
        onClick={() => setOpen((prev) => !prev)}
        className="h-9 w-9 rounded-full overflow-hidden border hover:ring-2 hover:ring-[var(--color-primary)] transition"
      >
        <img src={avatarUrl} alt={user.name} className="w-full h-full" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl border bg-white shadow-xl overflow-hidden">
          {" "}
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-gray-500">{role}</p>
          </div>
          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
            onClick={handleCloseUserMenu}
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/order"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
            onClick={handleCloseUserMenu}
          >
            Orders
          </Link>
          {role === "ADMIN" && (
            <Link
              href="/admin"
              className="block px-4 py-2 text-sm hover:bg-gray-100"
              onClick={handleCloseUserMenu}
            >
              Admin Dashboard
            </Link>
          )}
          <button
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
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
      )}
    </div>
  );
}
