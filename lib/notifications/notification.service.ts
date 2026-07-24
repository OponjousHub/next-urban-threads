import { prisma } from "@/utils/prisma";
import {
  VendorNotificationType,
  VendorNotificationSettings,
} from "@prisma/client";

type NotifyOptions = {
  vendorId: string;
  setting?: keyof VendorNotificationSettings;
  type: VendorNotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
  dedupeKey?: string;
};

export default class NotificationService {
  /**
   * Creates a notification if the vendor has enabled it.
   */
  static async notify(options: NotifyOptions) {
    const settings = await prisma.vendorNotificationSettings.findUnique({
      where: {
        vendorId: options.vendorId,
      },
    });

    if (!this.isEnabled(settings, options.type)) {
      return null;
    }

    if (options.setting && settings && settings[options.setting] === false) {
      return null;
    }

    if (options.dedupeKey) {
      const existing = await prisma.vendorNotification.findFirst({
        where: {
          vendorId: options.vendorId,
          isRead: false,
          metadata: {
            path: ["dedupeKey"],
            equals: options.dedupeKey,
          },
        },
      });

      if (existing) {
        return existing;
      }
    }

    return prisma.vendorNotification.create({
      data: {
        vendorId: options.vendorId,

        title: options.title,

        message: options.message,

        type: options.type,

        link: options.link,

        metadata: {
          ...(options.metadata ?? {}),
          dedupeKey: options.dedupeKey,
        },
      },
    });
  }

  /**
   * Marks a notification as read.
   */
  static async markAsRead(id: string) {
    return prisma.vendorNotification.update({
      where: {
        id,
      },

      data: {
        isRead: true,
      },
    });
  }

  /**
   * Marks all notifications as read.
   */
  static async markAllAsRead(vendorId: string) {
    return prisma.vendorNotification.updateMany({
      where: {
        vendorId,

        isRead: false,
      },

      data: {
        isRead: true,
      },
    });
  }

  /**
   * Deletes a notification.
   */
  static async delete(id: string) {
    return prisma.vendorNotification.delete({
      where: {
        id,
      },
    });
  }

  /**
   * Returns unread count.
   */
  static async unreadCount(vendorId: string) {
    return prisma.vendorNotification.count({
      where: {
        vendorId,

        isRead: false,
      },
    });
  }

  /**
   * Returns latest notifications.
   */
  static async latest(vendorId: string, take = 10) {
    return prisma.vendorNotification.findMany({
      where: {
        vendorId,
      },

      orderBy: {
        createdAt: "desc",
      },

      take,
    });
  }

  /**
   * Checks whether a notification type is enabled.
   */
  private static isEnabled(settings: any, type: VendorNotificationType) {
    if (!settings) return true;

    switch (type) {
      case "ORDER":
        return (
          settings.newOrder ||
          settings.orderCancelled ||
          settings.orderDelivered
        );

      case "INVENTORY":
        return settings.lowStock || settings.outOfStock;

      case "REVIEW":
        return settings.newReview;

      case "FOLLOWER":
        return settings.newFollower;

      case "PAYOUT":
        return settings.payoutCompleted || settings.payoutFailed;

      case "REPORT":
        return settings.weeklySummary || settings.monthlySummary;

      case "SYSTEM":
        return true;

      default:
        return true;
    }
  }
}
