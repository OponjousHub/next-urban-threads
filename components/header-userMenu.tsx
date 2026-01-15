"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useClickOutside } from "@/hooks/useClickOutside";

type User = {
  id: string;
  name: string;
  role: "ADMIN" | "USER";
};

type Props = {
  user: User;
};

export default function UserMenu({ user }: Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(dropdownRef, () => setOpen(false));

  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    user.name
  )}&backgroundColor=000000&textColor=ffffff`;

  return (
    <div ref={dropdownRef} className="relative left-5">
      {/* Avatar */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-2xl font-extrabold text-white"
      >
        <img
          src={avatarUrl}
          alt={user.name}
          className="h-8 w-8 rounded-full bg-slate-400 object-cover "
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border bg-white shadow-lg">
          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
          >
            Dashboard
          </Link>

          <Link
            href="/dashboard/orders"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
          >
            Orders
          </Link>

          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              Admin Dashboard
            </Link>
          )}

          <button
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
            onClick={() => console.log("logout")}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
