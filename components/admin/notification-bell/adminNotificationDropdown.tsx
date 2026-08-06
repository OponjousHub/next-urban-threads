"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import AdminNotificationItem from "./adminNotificationItem";
import type { AdminNotification } from "./adminNotificationBell";
import Link from "next/link";

type Props = {
  notifications: AdminNotification[];
  unreadCount: number;
  onRefresh: () => Promise<void>;
  onClose: () => void;
};

export default function AdminNotificationDropdown({
  notifications,
  unreadCount,
  onRefresh,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function markAllAsRead() {
    if (loading || unreadCount === 0) return;

    try {
      setLoading(true);

      const res = await fetch("/api/admin/notifications/read-all", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Failed to mark notifications as read");
        return;
      }

      await onRefresh();
    } catch (error) {
      console.error("Mark all notifications error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        absolute right-0 top-full z-[100]
        mt-3
        w-[calc(100vw-2rem)]
        max-w-[380px]
        overflow-hidden
        rounded-xl
        border
        bg-white
        shadow-xl
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="font-semibold text-gray-900">Notifications</h3>

          <p className="text-xs text-gray-500">
            {unreadCount === 0
              ? "You're all caught up"
              : `${unreadCount} unread`}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={loading}
            className="
              flex items-center gap-1
              rounded-lg px-2 py-1
              text-xs font-medium
              text-[var(--color-primary)]
              hover:bg-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <CheckCheck size={14} />

            {loading ? "Marking..." : "Mark all"}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="max-h-[420px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <p className="font-medium text-gray-700">No notifications</p>

            <p className="mt-1 text-sm text-gray-500">You're all caught up.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <AdminNotificationItem
              key={notification.id}
              notification={notification}
              onRefresh={onRefresh}
              onClose={onClose}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t bg-gray-50 p-3">
        <button
          type="button"
          onClick={markAllAsRead}
          disabled={loading || unreadCount === 0}
          className="
            text-sm
            text-blue-600
            hover:underline
            disabled:cursor-not-allowed
            disabled:text-gray-400
            disabled:no-underline
          "
        >
          {loading ? "Marking..." : "Mark all as read"}
        </button>

        <Link
          href="/admin/notifications"
          onClick={onClose}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          View all
        </Link>
      </div>
    </div>
  );
}
