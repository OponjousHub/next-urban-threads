import { NextResponse } from "next/server";
import { getLoggedInUserId } from "@/lib/auth";
import { AdminNotificationService } from "@/app/lib/admin/admin-notification-service";

export async function PATCH() {
  try {
    const userId = await getLoggedInUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await AdminNotificationService.markAllAsRead(userId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[ADMIN_NOTIFICATION_READ_ALL]", error);

    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 },
    );
  }
}
