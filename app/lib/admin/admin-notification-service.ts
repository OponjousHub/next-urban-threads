import { prisma } from "@/utils/prisma";
import { AdminNotificationType } from "@prisma/client";

type NotifyOptions = {
  type: AdminNotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
};

export class AdminNotificationService {
  static async notify({ type, title, message, link, metadata }: NotifyOptions) {
    // Find all admins
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
      },
    });

    if (admins.length === 0) return;

    await prisma.adminNotification.createMany({
      data: admins.map((admin) => ({
        adminId: admin.id,
        type,
        title,
        message,
        link,
        metadata,
      })),
    });
  }

  static async markAsRead(notificationId: string, adminId: string) {
    await prisma.adminNotification.updateMany({
      where: {
        id: notificationId,
        adminId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  static async markAllAsRead(adminId: string) {
    await prisma.adminNotification.updateMany({
      where: {
        adminId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  static async unreadCount(adminId: string) {
    return prisma.adminNotification.count({
      where: {
        adminId,
        isRead: false,
      },
    });
  }
}
