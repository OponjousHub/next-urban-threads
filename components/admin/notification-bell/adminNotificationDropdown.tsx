"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import AdminNotificationItem from "./AdminNotificationItem";
import type { AdminNotification } from "./AdminNotificationBell";

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
    try {
      setLoading(true);

      const res = await fetch("/api/admin/notifications/read-all", {
        method: "POST",
      });

      if (!res.ok) return;

      await onRefresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="absolute right-0 mt-3 w-[380px] overflow-hidden rounded-xl border bg-white shadow-xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="font-semibold text-gray-900">Notifications</h3>

          <p className="text-xs text-gray-500">{unreadCount} unread</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={loading}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[var(--color-primary)] hover:bg-gray-100 disabled:opacity-50"
          >
            <CheckCheck size={14} />
            Mark all
          </button>
        )}
      </div>

      {/* Body */}
      <div className="max-h-[420px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
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
    </div>
  );
}
