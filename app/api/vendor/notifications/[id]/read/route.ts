import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const userId = await getLoggedInUserId();
    const { vendor } = await getCurrentVendor();

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
        id: params.id,
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
        id: params.id,
      },
      data: {
        read: true,
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
