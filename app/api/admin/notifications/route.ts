import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function GET() {
  try {
    /* -----------------------------------------
       Authenticate
    ----------------------------------------- */
    const userId = await getLoggedInUserId();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    /* -----------------------------------------
       Resolve tenant
    ----------------------------------------- */
    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        {
          error: "Tenant not found",
        },
        { status: 404 },
      );
    }

    /* -----------------------------------------
       Fetch notifications
    ----------------------------------------- */
    const notifications = await prisma.adminNotification.findMany({
      where: {
        tenantId: tenant.id,
        storeMode: tenant.storeMode,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    /* -----------------------------------------
       Unread count
    ----------------------------------------- */
    const unreadCount = await prisma.adminNotification.count({
      where: {
        tenantId: tenant.id,
        storeMode: tenant.storeMode,
        isRead: false,
      },
    });

    return NextResponse.json(
      {
        notifications,
        unreadCount,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("[ADMIN_NOTIFICATIONS_GET]", error);

    return NextResponse.json(
      {
        error: "Failed to load notifications",
        notifications: [],
        unreadCount: 0,
      },
      {
        status: 500,
      },
    );
  }
}
