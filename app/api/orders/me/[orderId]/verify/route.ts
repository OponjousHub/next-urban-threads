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
      order.status !== OrderStatus.PENDING
    ) {
      return NextResponse.json(order);
    }

    // ---------------------------
    // 5. Expire unresolved pending
    // payment after timeout
    // ---------------------------

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
    // 6. No reference
    // ---------------------------

    if (!order.paymentReference) {
      return NextResponse.json(order);
    }

    // ---------------------------
    // 7. Select provider
    // ---------------------------

    const provider =
      order.paymentProvider === "PAYSTACK"
        ? new PaystackProvider()
        : new FlutterwaveProvider();

    // ---------------------------
    // 8. Verify payment
    // ---------------------------

    const result = await provider.verifyPayment(order.paymentReference);

    console.log("========== ORDER PAYMENT VERIFY ==========");
    console.log("Order ID:", order.id);
    console.log("Payment provider:", order.paymentProvider);
    console.log("Payment reference:", order.paymentReference);
    console.log("Provider verification result:", result);
    console.log("Current order paymentStatus:", order.paymentStatus);
    console.log("Current order status:", order.status);
    console.log("===========================================");

    // ---------------------------
    // 9. Genuine pending payment
    // ---------------------------

    if (result.status === "pending") {
      return NextResponse.json(order);
    }

    // ---------------------------
    // 10. Transaction not found
    //
    // Customer abandoned/cancelled
    // before Flutterwave created a
    // transaction.
    // ---------------------------

    if (result.status === "not_found") {
      const cancelledOrder = await prisma.order.update({
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

      await prisma.orderTrackingEvent.create({
        data: {
          orderId: order.id,
          tenantId: tenant.id,
          status: OrderStatus.CANCELLED,
          type: "STATUS_CHANGE",
          title: "Payment cancelled",
          description:
            "No payment transaction was found. Your order has been cancelled because the payment was not completed.",
        },
      });

      return NextResponse.json(cancelledOrder);
    }

    // ---------------------------
    // 11. Payment failed
    // ---------------------------

    if (result.status === "failed") {
      const failedOrder = await prisma.order.update({
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

      await prisma.orderTrackingEvent.create({
        data: {
          orderId: order.id,
          tenantId: tenant.id,
          status: OrderStatus.CANCELLED,
          type: "STATUS_CHANGE",
          title: "Payment failed",
          description:
            "The payment was not completed. Your order has been cancelled.",
        },
      });

      return NextResponse.json(failedOrder);
    }

    // ---------------------------
    // 12. Successful payment
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
        status: OrderStatus.PROCESSING,

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
    // 13. Tracking event
    // ---------------------------

    await prisma.orderTrackingEvent.create({
      data: {
        orderId: order.id,
        tenantId: tenant.id,
        status: OrderStatus.PROCESSING,
        type: "STATUS_CHANGE",
        title: "Payment confirmed",
        description:
          "Your payment was successful. We are now processing your order.",
      },
    });

    // ---------------------------
    // 14. Vendor notification
    // ---------------------------

    if (order.vendorId) {
      await NotificationService.notify({
        vendorId: order.vendorId,
        setting: "paymentReceived",
        type: "PAYMENT",
        title: "Payment Received",

        message: `Payment of ${
          order.currency
        } ${Number(order.totalAmount).toLocaleString()} has been confirmed for Order #${order.id.slice(
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
    // 15. Admin notification
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
    // 16. Coupon usage
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
