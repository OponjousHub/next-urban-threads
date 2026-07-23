import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import VendorHeaderUI from "@/components/vendor/vendorHeader";
import {
  Bell,
  Package,
  Star,
  Heart,
  AlertTriangle,
  Box,
  ChevronRight,
} from "lucide-react";

import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";

function getIcon(type: string) {
  switch (type) {
    case "ORDER":
      return <Package className="w-5 h-5 text-blue-600" />;

    case "REVIEW":
      return <Star className="w-5 h-5 text-yellow-500" />;

    case "FOLLOW":
      return <Heart className="w-5 h-5 text-pink-500" />;

    case "LOW_STOCK":
      return <AlertTriangle className="w-5 h-5 text-orange-500" />;

    case "OUT_OF_STOCK":
      return <Box className="w-5 h-5 text-red-600" />;

    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
}

export default async function VendorNotificationsPage() {
  const userId = await getLoggedInUserId();
  const { vendor } = await getCurrentVendor();

  if (!userId) {
    redirect("/login");
  }

  if (!vendor) {
    redirect("/vendor");
  }

  const notifications = await prisma.vendorNotification.findMany({
    where: {
      vendorId: vendor.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <VendorHeaderUI
        title="Notifications"
        subtitle="Stay updated with orders, reviews, followers and inventory alerts."
        vendor={vendor}
      />
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Empty State */}

        {notifications.length === 0 && (
          <div className="rounded-2xl border bg-white py-20 text-center">
            <Bell className="w-12 h-12 mx-auto text-gray-300" />

            <h2 className="mt-4 text-lg font-semibold">No notifications yet</h2>

            <p className="mt-2 text-gray-500">
              Notifications will appear here when important events happen.
            </p>
          </div>
        )}

        {/* Notification List */}

        <div className="space-y-4">
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.link ?? "/vendor/notifications"}
              className={`block rounded-2xl border transition hover:shadow-sm ${
                notification.read ? "bg-white" : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex gap-4 p-5">
                <div className="mt-1">{getIcon(notification.type)}</div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{notification.title}</h3>

                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </div>

                      <p className="mt-1 text-gray-600">
                        {notification.message}
                      </p>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>

                  <p className="mt-3 text-sm text-gray-400">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
