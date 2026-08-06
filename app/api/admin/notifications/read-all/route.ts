// import { NextResponse } from "next/server";
// import { getLoggedInUserId } from "@/lib/auth";
// import { AdminNotificationService } from "@/app/lib/admin/admin-notification-service";

// export async function PATCH() {
//   try {
//     const userId = await getLoggedInUserId();

//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     await AdminNotificationService.markAllAsRead(userId);

//     return NextResponse.json({
//       success: true,
//     });
//   } catch (error) {
//     console.error("[ADMIN_NOTIFICATION_READ_ALL]", error);

//     return NextResponse.json(
//       { error: "Failed to mark notifications as read" },
//       { status: 500 },
//     );
//   }
// }
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function POST() {
  try {
    const userId = await getLoggedInUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const result = await prisma.adminNotification.updateMany({
      where: {
        tenantId: tenant.id,
        storeMode: tenant.storeMode,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
    });
  } catch (error) {
    console.error("[ADMIN_NOTIFICATIONS_READ_ALL]", error);

    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 },
    );
  }
}
