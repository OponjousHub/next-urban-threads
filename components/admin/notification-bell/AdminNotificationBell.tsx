"use client";

import { useEffect, useRef, useState } from "react";
import { FaBell } from "react-icons/fa";
import AdminNotificationDropdown from "./adminNotificationDropdown";

export type AdminNotification = {
  id: string;
  title: string;
  message: string;
  type: string;

  isRead: boolean;
  readAt: string | null;

  link?: string | null;
  metadata?: any;

  createdAt: string;
};

export default function AdminNotificationBell() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  async function loadNotifications() {
    try {
      const res = await fetch("/api/admin/notifications", {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error("[ADMIN_NOTIFICATIONS]", err);
    }
  }

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border hover:bg-gray-50"
      >
        <FaBell className="text-gray-700" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <AdminNotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          onRefresh={loadNotifications}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
