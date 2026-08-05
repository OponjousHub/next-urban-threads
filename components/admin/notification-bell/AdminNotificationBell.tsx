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

type NotificationsResponse = {
  notifications: AdminNotification[];
  unreadCount: number;
};

export default function AdminNotificationBell() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  /* -----------------------------------------
     Load notifications
  ----------------------------------------- */
  async function loadNotifications() {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      /*
       * Read the response as text first.
       *
       * This prevents:
       * "Unexpected end of JSON input"
       * when the server returns an empty or
       * malformed response.
       */
      const text = await res.text();

      if (!res.ok) {
        console.error(
          "[ADMIN_NOTIFICATIONS] Request failed:",
          res.status,
          text,
        );

        return;
      }

      if (!text.trim()) {
        console.warn("[ADMIN_NOTIFICATIONS] API returned an empty response.");

        return;
      }

      let data: NotificationsResponse;

      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error(
          "[ADMIN_NOTIFICATIONS] Invalid JSON response:",
          text,
          error,
        );

        return;
      }

      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : [],
      );

      setUnreadCount(
        typeof data.unreadCount === "number" ? data.unreadCount : 0,
      );
    } catch (error) {
      /*
       * Network errors / failed fetches should not
       * break the admin page.
       */
      console.error(
        "[ADMIN_NOTIFICATIONS] Failed to fetch notifications:",
        error,
      );
    }
  }

  /* -----------------------------------------
     Initial load + polling
  ----------------------------------------- */
  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /* -----------------------------------------
     Close dropdown when clicking outside
  ----------------------------------------- */
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
    <div ref={dropdownRef} className="relative">
      {/* Bell */}
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border bg-white hover:bg-gray-50"
      >
        <FaBell className="text-gray-700" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 z-50 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
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
