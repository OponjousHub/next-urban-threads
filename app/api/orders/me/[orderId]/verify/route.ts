import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";
import { PaystackProvider } from "@/app/lib/payments/paystack";
import { FlutterwaveProvider } from "@/app/lib/payments/flutterwave";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { AdminNotificationService } from "@/app/lib/admin/admin-notification-service";
import NotificationService from "@/lib/notifications/notification.service";
import { PaymentStatus } from "@prisma/client";

type RouteParams = {
  params: {
    orderId: string;
  };
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const body = await req.json().catch(() => ({}));
  const referenceFromClient = body.reference;

  try {
    // ---------------------------
    // 1️⃣ Authenticate user
    // ---------------------------
    const userId = await getLoggedInUserId();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

    // ---------------------------;
    // 2️⃣ Fetch order + items
    // ---------------------------
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        tenantId: tenant.id,
      },

      include: {
        user: {
          select: {
            name: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        refundRequest: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (!order.paymentReference && referenceFromClient) {
      await prisma.order.update({
        where: { id: order.id, tenantId: tenant.id },
        data: { paymentReference: referenceFromClient },
      });

      order.paymentReference = referenceFromClient;
    }

    // ---------------------------
    // 3️⃣ Only verify if still pending
    // ---------------------------
    if (order.status !== "PENDING") {
      return NextResponse.json(order);
    }

    // ---------------------------
    // 4️⃣ No reference → cannot verify
    // ---------------------------
    if (!order.paymentReference) {
      return NextResponse.json(order);
    }

    if (order?.paymentStatus === PaymentStatus.PAID) {
      return NextResponse.json(order);
    }

    // if (order.paymentStatus === "PAID") {
    //   return NextResponse.json(order);
    // }

    // ---------------------------
    // 5️⃣ Verify with Paystack
    // ---------------------------

    const provider =
      order.paymentProvider === "PAYSTACK"
        ? new PaystackProvider()
        : new FlutterwaveProvider();

    const result = await provider.verifyPayment(order.paymentReference);

    if (!result) {
      // Still pending → return order as-is
      return NextResponse.json(order);
    }

    // ---------------------------
    // 6️⃣ Mark as PAID (idempotent)
    // ---------------------------
    if (!result.success) {
      return NextResponse.json(order);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id, tenantId: tenant.id },
      data: {
        paymentStatus: "PAID",
        status: "PROCESSING",
        paymentReference: String(result.transactionId), // for refunds
        paymentTxRef: result.txRef, // optional tracking
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    await prisma.orderTrackingEvent.create({
      data: {
        orderId: order.id,
        tenantId: tenant.id,
        status: "PROCESSING",
        type: "STATUS_CHANGE",
        title: "Payment confirmed",
        description:
          "Your payment was successful. We are now processing your order.",
      },
    });

    // Sends notification on new order
    if (order.vendorId) {
      await NotificationService.notify({
        vendorId: order.vendorId,
        setting: "paymentReceived",
        type: "PAYMENT",
        title: "Payment Received",
        message: `Payment of ${order.currency} ${Number(order.totalAmount).toLocaleString()} has been confirmed for Order #${order.id.slice(-8)}.`,
        link: `/vendor/orders/${order.id}`,
        metadata: {
          orderId: order.id,
          paymentReference: updatedOrder.paymentReference,
          amount: Number(updatedOrder.totalAmount),
          currency: updatedOrder.currency,
        },
      });
    }

    // Send Notification
    await AdminNotificationService.notify({
      type: "PAYMENT_RECEIVED",
      title: "Payment Received",
      message: `${order.user.name ?? "A customer"} paid ${updatedOrder.currency} ${Number(updatedOrder.totalAmount).toLocaleString()}.`,
      link: `/admin/orders/${order.id}`,
      metadata: {
        orderId: order.id,
        customerId: order.userId,
        customerName: order.user.name,
        amount: Number(updatedOrder.totalAmount),
        currency: updatedOrder.currency,
      },
    });

    if (order.couponId) {
      await prisma.coupon.update({
        where: {
          id: order.couponId,
          tenantId: tenant.id,
          vendorId: order.vendorId,
        },

        data: {
          usedCount: {
            increment: 1,
          },
        },
      });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Verify order error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
