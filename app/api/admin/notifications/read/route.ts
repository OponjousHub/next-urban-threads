import { NextRequest, NextResponse } from "next/server";
import { getLoggedInUserId } from "@/lib/auth";
import { AdminNotificationService } from "@/app/lib/admin/admin-notification-service";

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getLoggedInUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationId } = await req.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 },
      );
    }

    await AdminNotificationService.markAsRead(notificationId, userId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[ADMIN_NOTIFICATION_READ]", error);

    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 },
    );
  }
}
