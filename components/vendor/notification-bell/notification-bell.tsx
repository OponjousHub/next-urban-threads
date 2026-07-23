"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import NotificationDropdown from "./notification-dropdown";

type VendorNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  link: string | null;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  const [notifications, setNotifications] = useState<VendorNotification[]>([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const wrapperRef = useRef<HTMLDivElement>(null);

  async function loadNotifications() {
    try {
      setLoading(true);

      const res = await fetch("/api/vendor/notifications", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await res.json();

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-full p-2 hover:bg-gray-100 transition"
      >
        <Bell className="h-6 w-6" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {open && (
        <NotificationDropdown
          loading={loading}
          notifications={notifications}
          onClose={() => setOpen(false)}
          refresh={loadNotifications}
        />
      )}
    </div>
  );
}
