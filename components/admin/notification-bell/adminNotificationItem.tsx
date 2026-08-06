"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { AdminNotification } from "./adminNotificationBell";
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
  const [processing, setProcessing] = useState(false);

  async function handleClick() {
    if (!notification.isRead) {
      try {
        const res = await fetch("/api/admin/notifications/read", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notificationId: notification.id,
          }),
        });

        if (!res.ok) {
          console.error(
            "Failed to mark notification as read:",
            await res.text(),
          );
        } else {
          await onRefresh();
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    onClose();

    if (notification.link) {
      router.push(notification.link);
    }
  }
  const Icon = getNotificationIcon(notification.type);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={processing}
      className={`flex w-full items-start gap-3 border-b p-4 text-left transition hover:bg-gray-50 disabled:cursor-wait ${
        !notification.isRead ? "bg-blue-50" : ""
      }`}
    >
      {/* Icon */}
      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
        <Icon className="h-5 w-5 text-gray-700" />
      </div>

      {/* Content */}
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
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
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
