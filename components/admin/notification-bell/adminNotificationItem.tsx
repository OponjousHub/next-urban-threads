"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { AdminNotification } from "./AdminNotificationBell";
import { getNotificationIcon } from "./admin-notification-icons";
import { formatNotificationTime } from "./time";

type Props = {
  notification: AdminNotification;
  onRefresh: () => Promise<void>;
  onClose: () => void;
};

export default function AdminNotificationItem({
  notification,
  onRefresh,
  onClose,
}: Props) {
  const router = useRouter();

  async function handleClick() {
    // Mark as read
    if (!notification.isRead) {
      await fetch("/api/admin/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId: notification.id,
        }),
      });

      await onRefresh();
    }

    onClose();

    if (notification.link) {
      router.push(notification.link);
    }
  }

  const Icon = getNotificationIcon(notification.type);

  return (
    <button
      onClick={handleClick}
      className={`flex w-full items-start gap-3 border-b p-4 text-left transition hover:bg-gray-50 ${
        !notification.isRead ? "bg-blue-50" : ""
      }`}
    >
      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
        <Icon className="h-5 w-5 text-gray-700" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p
            className={`text-sm ${
              !notification.isRead
                ? "font-semibold text-gray-900"
                : "font-medium text-gray-700"
            }`}
          >
            {notification.title}
          </p>

          {!notification.isRead && (
            <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
          )}
        </div>

        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
          {notification.message}
        </p>

        <p className="mt-2 text-xs text-gray-400">
          {formatNotificationTime(notification.createdAt)}
        </p>
      </div>
    </button>
  );
}
