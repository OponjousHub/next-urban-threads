import { prisma } from "@/utils/prisma";
import { AdminNotificationType } from "@prisma/client";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

type NotifyOptions = {
  type: AdminNotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
};

export class AdminNotificationService {
  static async notify({ type, title, message, link, metadata }: NotifyOptions) {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      throw new Error("Tenant not found");
    }
    // Find all admins
    const admins = await prisma.user.findMany({
      where: {
        tenantId: tenant.id,
        role: {
          in: ["ADMIN", "OWNER"],
        },
      },
      select: {
        id: true,
      },
    });

    if (admins.length === 0) return;

    await prisma.adminNotification.createMany({
      data: admins.map((admin) => ({
        adminId: admin.id,
        tenantId: tenant.id,
        type,
        title,
        message,
        link,
        metadata,
      })),
    });
  }

  static async markAsRead(notificationId: string, adminId: string) {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      throw new Error("Tenant not found");
    }

    await prisma.adminNotification.updateMany({
      where: {
        id: notificationId,
        adminId,
        tenantId: tenant.id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  static async markAllAsRead(adminId: string) {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      throw new Error("Tenant not found");
    }

    await prisma.adminNotification.updateMany({
      where: {
        adminId,
        isRead: false,
        tenantId: tenant.id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  static async unreadCount(adminId: string) {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      throw new Error("Tenant not found");
    }

    return prisma.adminNotification.count({
      where: {
        adminId,
        tenantId: tenant.id,
        isRead: false,
      },
    });
  }
}
