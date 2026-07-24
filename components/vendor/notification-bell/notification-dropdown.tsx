"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Package,
  Star,
  Heart,
  AlertTriangle,
  Box,
  ChevronRight,
} from "lucide-react";

type VendorNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  link: string | null;
};

type Props = {
  loading: boolean;
  notifications: VendorNotification[];
  onClose: () => void;
  refresh: () => Promise<void>;
};

function getIcon(type: string, title: string) {
  switch (type) {
    case "ORDER":
      return <Package className="w-5 h-5 text-blue-600" />;

    case "REVIEW":
      return <Star className="w-5 h-5 text-yellow-500" />;

    case "FOLLOWER":
      return <Heart className="w-5 h-5 text-pink-500" />;

    case "INVENTORY":
      if (title === "Out of Stock") {
        return <Box className="w-5 h-5 text-red-600" />;
      }

      return <AlertTriangle className="w-5 h-5 text-orange-500" />;

    case "PAYOUT":
      return <Bell className="w-5 h-5 text-green-600" />;

    case "REPORT":
      return <Bell className="w-5 h-5 text-purple-600" />;

    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
}

export default function NotificationDropdown({
  loading,
  notifications,
  onClose,
  refresh,
}: Props) {
  async function handleNotificationClick(notification: VendorNotification) {
    if (!notification.read) {
      await fetch(`/api/vendor/notifications/${notification.id}/read`, {
        method: "PATCH",
      });

      await refresh();
    }

    onClose();
  }

  return (
    <div className="absolute right-0 mt-3 w-[380px] rounded-2xl border bg-white shadow-2xl z-50 overflow-hidden">
      {/* Header */}

      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h3 className="font-semibold text-gray-900">Notifications</h3>

        <Link
          href="/vendor/notifications"
          onClick={onClose}
          className="text-sm font-medium text-black hover:underline"
        >
          View all
        </Link>
      </div>

      {/* Body */}

      <div className="max-h-[450px] overflow-y-auto">
        {loading && (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading notifications...
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <Bell className="w-10 h-10 text-gray-300 mb-4" />

            <p className="font-medium text-gray-700">No notifications yet</p>

            <p className="text-sm text-gray-500 mt-1 text-center">
              We'll notify you when something important happens.
            </p>
          </div>
        )}

        {!loading &&
          notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.link ?? "/vendor/notifications"}
              onClick={() => handleNotificationClick(notification)}
              className={`flex gap-4 px-5 py-4 border-b hover:bg-gray-50 transition ${
                !notification.read ? "bg-blue-50/40" : ""
              }`}
            >
              <div className="mt-1">
                {getIcon(notification.type, notification.title)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-sm text-gray-900">
                    {notification.title}
                  </h4>

                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  )}
                </div>

                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {notification.message}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </Link>
          ))}
      </div>

      {/* Footer */}

      {notifications.length > 0 && (
        <Link
          href="/vendor/notifications"
          onClick={onClose}
          className="flex items-center justify-center gap-2 py-3 text-sm font-medium hover:bg-gray-50 transition border-t"
        >
          View all notifications
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
