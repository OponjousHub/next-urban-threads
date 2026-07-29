import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function GET() {
  try {
    const userId = await getLoggedInUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        { message: "Tenant not found" },
        { status: 404 },
      );
    }

    const notifications = await prisma.adminNotification.findMany({
      where: {
        tenantId: tenant.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    const unreadCount = await prisma.adminNotification.count({
      where: {
        tenantId: tenant.id,
        isRead: false,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("[ADMIN_NOTIFICATIONS]", error);

    return NextResponse.json(
      { error: "Failed to load notifications" },
      { status: 500 },
    );
  }
}
