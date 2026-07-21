import { NextResponse } from "next/server";

import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    const userId = await getLoggedInUserId();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const vendor = await prisma.vendor.findFirst({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found." },
        { status: 404 },
      );
    }

    const body = await req.json();

    const settings = await prisma.vendorNotificationSettings.upsert({
      where: {
        vendorId: vendor.id,
      },

      create: {
        vendorId: vendor.id,

        newOrder: body.newOrder,
        orderCancelled: body.orderCancelled,
        orderDelivered: body.orderDelivered,

        lowStock: body.lowStock,
        outOfStock: body.outOfStock,

        newReview: body.newReview,
        newFollower: body.newFollower,

        payoutCompleted: body.payoutCompleted,
        payoutFailed: body.payoutFailed,

        weeklySummary: body.weeklySummary,
        monthlySummary: body.monthlySummary,
      },

      update: {
        newOrder: body.newOrder,
        orderCancelled: body.orderCancelled,
        orderDelivered: body.orderDelivered,

        lowStock: body.lowStock,
        outOfStock: body.outOfStock,

        newReview: body.newReview,
        newFollower: body.newFollower,

        payoutCompleted: body.payoutCompleted,
        payoutFailed: body.payoutFailed,

        weeklySummary: body.weeklySummary,
        monthlySummary: body.monthlySummary,
      },
    });

    return NextResponse.json({
      message: "Notification settings updated successfully.",
      settings,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Unable to update notification settings.",
      },
      {
        status: 500,
      },
    );
  }
}
