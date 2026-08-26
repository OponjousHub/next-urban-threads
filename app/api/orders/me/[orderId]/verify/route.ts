import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";
import { PaystackProvider } from "@/app/lib/payments/paystack";
import { FlutterwaveProvider } from "@/app/lib/payments/flutterwave";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { AdminNotificationService } from "@/app/lib/admin/admin-notification-service";
import NotificationService from "@/lib/notifications/notification.service";
import { PaymentStatus, OrderStatus } from "@prisma/client";
import {
  isPendingPaymentExpired,
  PENDING_PAYMENT_TIMEOUT_MINUTES,
} from "@/app/lib/payments/payment-timeout";

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
    // 1. Authenticate user
    // ---------------------------

    const userId = await getLoggedInUserId();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

    // ---------------------------
    // 2. Fetch order + relations
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
        orderCoupons: {
          select: {
            couponId: true,
          },
        },
        shippingMethod: true,
        refundRequest: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            items: true,
            trackingEvents: {
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // ---------------------------
    // 3. Recover reference
    // ---------------------------

    if (!order.paymentReference && referenceFromClient) {
      await prisma.order.update({
        where: {
          id: order.id,
          tenantId: tenant.id,
        },
        data: {
          paymentReference: referenceFromClient,
        },
      });

      order.paymentReference = referenceFromClient;
    }

    // ---------------------------
    // 4. Don't re-process completed
    // orders
    // ---------------------------

    if (
      order.paymentStatus === PaymentStatus.PAID ||
      order.status !== "PENDING"
    ) {
      return NextResponse.json(order);
    }

    // ---------------------------------------------------------
    // 5. Expire unresolved pending payment
    // ---------------------------------------------------------

    if (isPendingPaymentExpired(order.createdAt)) {
      const expiredOrder = await prisma.$transaction(async (tx) => {
        const updatedOrder = await tx.order.update({
          where: {
            id: order.id,
            tenantId: tenant.id,
          },
          data: {
            paymentStatus: PaymentStatus.FAILED,
            status: OrderStatus.CANCELLED,
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
            orderCoupons: {
              select: {
                couponId: true,
              },
            },
            shippingMethod: true,
            refundRequest: {
              orderBy: {
                createdAt: "desc",
              },
              include: {
                items: true,
                trackingEvents: {
                  orderBy: {
                    createdAt: "asc",
                  },
                },
              },
            },
          },
        });

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

        return updatedOrder;
      });

      return NextResponse.json(expiredOrder);
    }

    // ---------------------------
    // 5. No reference → cannot verify
    // ---------------------------

    if (!order.paymentReference) {
      return NextResponse.json(order);
    }

    // ---------------------------
    // 6. Select provider
    // ---------------------------

    const provider =
      order.paymentProvider === "PAYSTACK"
        ? new PaystackProvider()
        : new FlutterwaveProvider();

    // ---------------------------
    // 7. Verify payment
    // ---------------------------

    const result = await provider.verifyPayment(order.paymentReference);

    // ---------------------------
    // 8. Still pending
    // ---------------------------

    if (result.status === "pending") {
      return NextResponse.json(order);
    }

    // ---------------------------
    // 9. Payment failed
    // ---------------------------

    if (result.status === "failed") {
      const failedOrder = await prisma.order.update({
        where: {
          id: order.id,
          tenantId: tenant.id,
        },
        data: {
          paymentStatus: PaymentStatus.FAILED,
          status: "CANCELLED",
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
          orderCoupons: {
            select: {
              couponId: true,
            },
          },
          shippingMethod: true,
          refundRequest: {
            orderBy: {
              createdAt: "desc",
            },
            include: {
              items: true,
              trackingEvents: {
                orderBy: {
                  createdAt: "asc",
                },
              },
            },
          },
        },
      });

      // ---------------------------
      // Tracking event
      // ---------------------------

      await prisma.orderTrackingEvent.create({
        data: {
          orderId: order.id,
          tenantId: tenant.id,
          status: "CANCELLED",
          type: "STATUS_CHANGE",
          title: "Payment failed",
          description:
            "The payment was not completed. Your order has been cancelled.",
        },
      });

      return NextResponse.json(failedOrder);
    }

    // ---------------------------
    // 10. Successful payment
    // ---------------------------

    if (result.status !== "successful") {
      return NextResponse.json(order);
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: order.id,
        tenantId: tenant.id,
      },
      data: {
        paymentStatus: PaymentStatus.PAID,
        status: "PROCESSING",

        // Keep transaction ID for refunds
        paymentReference:
          result.transactionId !== undefined
            ? String(result.transactionId)
            : order.paymentReference,

        paymentTxRef: result.txRef,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // ---------------------------
    // 11. Tracking event
    // ---------------------------

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

    // ---------------------------
    // 12. Vendor notification
    // ---------------------------

    if (order.vendorId) {
      await NotificationService.notify({
        vendorId: order.vendorId,
        setting: "paymentReceived",
        type: "PAYMENT",
        title: "Payment Received",
        message: `Payment of ${order.currency} ${Number(
          order.totalAmount,
        ).toLocaleString()} has been confirmed for Order #${order.id.slice(
          -8,
        )}.`,
        link: `/vendor/orders/${order.id}`,
        metadata: {
          orderId: order.id,
          paymentReference: updatedOrder.paymentReference,
          amount: Number(updatedOrder.totalAmount),
          currency: updatedOrder.currency,
        },
      });
    }

    // ---------------------------
    // 13. Admin notification
    // ---------------------------

    await AdminNotificationService.notify({
      type: "PAYMENT_RECEIVED",
      title: "Payment Received",
      message: `${order.user.name ?? "A customer"} paid ${
        updatedOrder.currency
      } ${Number(updatedOrder.totalAmount).toLocaleString()}.`,
      link: `/admin/orders/${order.id}`,
      metadata: {
        orderId: order.id,
        customerId: order.userId,
        customerName: order.user.name,
        amount: Number(updatedOrder.totalAmount),
        currency: updatedOrder.currency,
      },
    });

    // ---------------------------
    // 14. Coupon usage
    // ---------------------------

    const couponId = order.orderCoupons[0]?.couponId;

    if (couponId) {
      await prisma.coupon.update({
        where: {
          id: couponId,
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
      {
        message: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
