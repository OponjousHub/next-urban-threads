import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getLoggedInUserId();
    const param = await params;
    const { vendor } = await getCurrentVendor();
    console.log("Notification ID:", param.id);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Find the vendor that owns this user

    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 },
      );
    }

    // Ensure the notification belongs to this vendor
    const notification = await prisma.vendorNotification.findFirst({
      where: {
        id: param.id,
        vendorId: vendor.id,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.vendorNotification.update({
      where: {
        id: param.id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to mark notification as read",
      },
      {
        status: 500,
      },
    );
  }
}
