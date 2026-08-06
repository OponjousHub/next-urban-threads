"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaBell } from "react-icons/fa";
import { CheckCheck } from "lucide-react";
import { useTenant } from "@/store/tenant-provider-context";
import { formatNotificationTime } from "@/components/admin/notification-bell/time";
import { getNotificationIcon } from "@/components/admin/notification-bell/admin-notification-icons";

type AdminNotification = {
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

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const { tenant } = useTenant();

  async function loadNotifications() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/notifications", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to load notifications");
      }

      const data = await res.json();

      setNotifications(data.notifications ?? []);
    } catch (error) {
      console.error("[ADMIN_NOTIFICATIONS_PAGE]", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function markAllAsRead() {
    try {
      setMarkingAll(true);

      const res = await fetch("/api/admin/notifications/read-all", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to mark notifications as read");
      }

      await loadNotifications();
    } catch (error) {
      console.error("[ADMIN_NOTIFICATIONS_READ_ALL]", error);
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleNotificationClick(notification: AdminNotification) {
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
          setNotifications((current) =>
            current.map((item) =>
              item.id === notification.id
                ? {
                    ...item,
                    isRead: true,
                    readAt: new Date().toISOString(),
                  }
                : item,
            ),
          );
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    if (notification.link) {
      window.location.href = notification.link;
    }
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  return (
    <main className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border shadow-sm">
                <FaBell className="text-[var(--color-primary)]" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Notifications
                </h1>

                <p className="text-sm text-gray-500">
                  Stay up to date with activity in your store.
                </p>
              </div>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={markingAll}
              className="inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck size={16} />

              {markingAll ? "Marking..." : `Mark all as read (${unreadCount})`}
            </button>
          )}
        </div>

        {/* Notifications */}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <FaBell className="text-xl text-gray-400" />
              </div>

              <h2 className="font-semibold text-gray-800">No notifications</h2>

              <p className="mt-1 text-sm text-gray-500">
                You're all caught up.
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex w-full items-start gap-4 border-b p-5 text-left transition last:border-b-0 hover:bg-gray-50 ${
                      !notification.isRead ? "bg-blue-50/60" : "bg-white"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                        notification.isRead ? "bg-gray-100" : "bg-blue-100"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          notification.isRead
                            ? "text-gray-600"
                            : "text-blue-600"
                        }`}
                      />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <h3
                          className={`text-sm ${
                            notification.isRead
                              ? "font-medium text-gray-700"
                              : "font-semibold text-gray-900"
                          }`}
                        >
                          {notification.title}
                        </h3>

                        {!notification.isRead && (
                          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                        )}
                      </div>

                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-xs text-gray-400">
                        {formatNotificationTime(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Back */}
        <div className="mt-5">
          <Link
            href="/admin"
            className="text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
