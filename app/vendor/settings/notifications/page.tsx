import { notFound } from "next/navigation";

import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";

import NotificationForm from "./notification-form";
import VendorHeaderUI from "@/components/vendor/vendorHeader";

export default async function NotificationsPage() {
  const userId = await getLoggedInUserId();

  if (!userId) {
    notFound();
  }

  const vendor = await prisma.vendor.findFirst({
    where: {
      users: {
        some: {
          id: userId,
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!vendor) {
    notFound();
  }

  let settings = await prisma.vendorNotificationSettings.findUnique({
    where: {
      vendorId: vendor.id,
    },
  });

  // Create default settings on first visit
  if (!settings) {
    settings = await prisma.vendorNotificationSettings.create({
      data: {
        vendorId: vendor.id,
      },
    });
  }

  return (
    <div className="space-y-6">
      <VendorHeaderUI
        title="Notification Settings"
        subtitle="Choose which notifications you'd like to receive about your store."
        vendor={vendor}
      />

      <NotificationForm vendorId={vendor.id} settings={settings} />
    </div>
  );
}
