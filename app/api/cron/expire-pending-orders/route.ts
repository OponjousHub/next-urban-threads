import { NextRequest, NextResponse } from "next/server";
import { OrderStatus, PaymentStatus } from "@prisma/client";

import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { PENDING_PAYMENT_TIMEOUT_MINUTES } from "@/app/lib/payments/payment-timeout";

export async function GET(req: NextRequest) {
  try {
    // ---------------------------------------------------------
    // 1. Protect cron endpoint
    // ---------------------------------------------------------

    const authHeader = req.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ---------------------------------------------------------
    // 2. Get tenant
    // ---------------------------------------------------------

    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        {
          message: "Default tenant not found",
        },
        { status: 404 },
      );
    }

    // ---------------------------------------------------------
    // 3. Calculate expiration time
    // ---------------------------------------------------------

    const expirationDate = new Date(
      Date.now() - PENDING_PAYMENT_TIMEOUT_MINUTES * 60 * 1000,
    );

    // ---------------------------------------------------------
    // 4. Find unresolved pending orders
    // ---------------------------------------------------------

    const pendingOrders = await prisma.order.findMany({
      where: {
        tenantId: tenant.id,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        createdAt: {
          lt: expirationDate,
        },
      },
      select: {
        id: true,
      },
    });

    // ---------------------------------------------------------
    // 5. Expire each order
    // ---------------------------------------------------------

    let expiredCount = 0;

    for (const order of pendingOrders) {
      await prisma.$transaction(async (tx) => {
        const updated = await tx.order.updateMany({
          where: {
            id: order.id,
            tenantId: tenant.id,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
          },
          data: {
            status: OrderStatus.CANCELLED,
            paymentStatus: PaymentStatus.FAILED,
          },
        });

        // Another process may have already handled it.
        if (updated.count === 0) {
          return;
        }

        await tx.orderTrackingEvent.create({
          data: {
            orderId: order.id,
            tenantId: tenant.id,
            status: OrderStatus.CANCELLED,
            type: "STATUS_CHANGE",
            title: "Payment expired",
            description: `Payment was not completed within ${PENDING_PAYMENT_TIMEOUT_MINUTES} minutes. The order has been cancelled.`,
          },
        });

        expiredCount++;
      });
    }

    return NextResponse.json({
      success: true,
      expiredCount,
      checkedBefore: expirationDate,
    });
  } catch (error) {
    console.error("Expire pending orders error:", error);

    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
