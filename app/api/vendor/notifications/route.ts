import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";

export async function GET(req: Request) {
  try {
    const userId = await getLoggedInUserId();
    const { vendor } = await getCurrentVendor();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 },
      );
    }

    const notifications = await prisma.vendorNotification.findMany({
      where: {
        vendorId: vendor.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    const unreadCount = await prisma.vendorNotification.count({
      where: {
        vendorId: vendor.id,
        read: false,
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to fetch notifications",
      },
      {
        status: 500,
      },
    );
  }
}
