import { Prisma } from "@prisma/client";
import { prisma } from "@/utils/prisma";
import NotificationService from "@/lib/notifications/notification.service";
import { AdminNotificationService } from "@/app/lib/admin/admin-notification-service";
import orderConfirmationEmail from "@/app/lib/email/template/orderConfirmation";
import { sendEmail } from "@/app/lib/email/sendEmail";

type FinalizationResult = {
  complete: boolean;
  errors: string[];
};

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function finalizePayment(
  orderId: string,
): Promise<FinalizationResult> {
  const errors: string[] = [];

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
      shippingAddress: true,
      orderCoupons: {
        include: {
          coupon: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error(`Cannot finalize payment: order ${orderId} was not found.`);
  }

  if (order.paymentStatus !== "PAID") {
    throw new Error(
      `Cannot finalize payment for order ${orderId}: payment is not PAID.`,
    );
  }

  await prisma.paymentFinalization.upsert({
    where: { orderId: order.id },
    create: {
      orderId: order.id,
      tenantId: order.tenantId,
      status: "PROCESSING",
      attempts: 1,
    },
    update: {
      status: "PROCESSING",
      attempts: { increment: 1 },
    },
  });

  async function recordError(step: string, error: unknown) {
    const message = `${step}: ${getErrorMessage(error)}`;
    errors.push(message);

    console.error(`[Payment finalization] Order ${order?.id}: ${message}`);

    await prisma.paymentFinalization.update({
      where: { orderId: order?.id },
      data: {
        lastError: message,
        status: "RETRY",
      },
    });
  }

  // 1. Increment coupon usage exactly once.
  //
  // The flag and coupon increments share a transaction. If the transaction
  // fails, both the flag and increments roll back together.
  try {
    await prisma.$transaction(async (tx) => {
      const claim = await tx.paymentFinalization.updateMany({
        where: {
          orderId: order.id,
          couponUsageProcessed: false,
        },
        data: {
          couponUsageProcessed: true,
        },
      });

      if (claim.count === 0) {
        return;
      }

      const orderCoupons = await tx.orderCoupon.findMany({
        where: { orderId: order.id },
        select: { couponId: true },
      });

      for (const orderCoupon of orderCoupons) {
        await tx.coupon.update({
          where: { id: orderCoupon.couponId },
          data: {
            usedCount: { increment: 1 },
          },
        });
      }
    });
  } catch (error) {
    await recordError("Coupon usage", error);
  }

  // 2. Create the payment-confirmation tracking event once.
  const trackingDedupeKey = `payment-confirmed:${order.id}`;

  try {
    const alreadyExists = await prisma.orderTrackingEvent.findUnique({
      where: { dedupeKey: trackingDedupeKey },
      select: { id: true },
    });

    if (!alreadyExists) {
      try {
        await prisma.orderTrackingEvent.create({
          data: {
            dedupeKey: trackingDedupeKey,
            orderId: order.id,
            tenantId: order.tenantId,
            type: "SYSTEM",
            status: "PROCESSING",
            title: "Payment confirmed",
            description: "Payment was successfully verified.",
            metadata: {
              paymentReference: order.paymentReference,
              paymentProvider: order.paymentProvider,
            },
          },
        });
      } catch (error) {
        // Another simultaneous finalization may have created the event.
        if (!isUniqueConstraintError(error)) {
          throw error;
        }
      }
    }

    await prisma.paymentFinalization.update({
      where: { orderId: order.id },
      data: { trackingEventCreated: true },
    });
  } catch (error) {
    await recordError("Tracking event", error);
  }

  // 3. Notify the vendor once.
  if (order.vendorId) {
    try {
      await NotificationService.notify({
        vendorId: order.vendorId,
        setting: "paymentReceived",
        type: "PAYMENT",
        title: "Payment Received",
        message: `Payment received for order ${order.id.slice(-8).toUpperCase()}.`,
        link: `/vendor/orders/${order.id}`,
        dedupeKey: `payment-received:${order.id}`,
        metadata: {
          orderId: order.id,
          paymentReference: order.paymentReference,
          amount: Number(order.totalAmount),
          currency: order.currency,
        },
      });

      await prisma.paymentFinalization.update({
        where: { orderId: order.id },
        data: { vendorNotified: true },
      });
    } catch (error) {
      await recordError("Vendor notification", error);
    }
  } else {
    await prisma.paymentFinalization.update({
      where: { orderId: order.id },
      data: { vendorNotified: true },
    });
  }

  // 4. Notify every administrator independently, without duplicate rows.
  try {
    await AdminNotificationService.notify({
      type: "PAYMENT_RECEIVED",
      title: "Payment Received",
      message: `${order.user?.name ?? "A customer"} paid ${order.currency} ${Number(
        order.totalAmount,
      ).toFixed(2)} for order ${order.id.slice(-8).toUpperCase()}.`,
      link: `/admin/orders/${order.id}`,
      dedupeKey: `payment-received:${order.id}`,
      metadata: {
        orderId: order.id,
        customerId: order.userId,
        customerName: order.user?.name ?? null,
        amount: Number(order.totalAmount),
        currency: order.currency,
      },
    });

    await prisma.paymentFinalization.update({
      where: { orderId: order.id },
      data: { adminNotified: true },
    });
  } catch (error) {
    await recordError("Admin notification", error);
  }

  // 5. Send the customer confirmation email with a stable Resend key.
  try {
    if (!order.user?.email) {
      throw new Error("The customer has no email address.");
    }

    const email = orderConfirmationEmail(order);

    await sendEmail({
      to: order.user.email,
      subject: email.subject,
      html: email.html,
      idempotencyKey: `order-confirmation:${order.id}`,
    });

    await prisma.paymentFinalization.update({
      where: { orderId: order.id },
      data: { confirmationEmailSent: true },
    });
  } catch (error) {
    await recordError("Confirmation email", error);
  }

  // 6. Mark complete only after every follow-up action succeeds.
  const finalization = await prisma.paymentFinalization.findUniqueOrThrow({
    where: { orderId: order.id },
  });

  const complete =
    finalization.couponUsageProcessed &&
    finalization.trackingEventCreated &&
    finalization.vendorNotified &&
    finalization.adminNotified &&
    finalization.confirmationEmailSent;

  await prisma.paymentFinalization.update({
    where: { orderId: order.id },
    data: {
      status: complete ? "COMPLETED" : "RETRY",
      processedAt: complete ? new Date() : null,
      lastError: complete ? null : errors.join(" | ") || finalization.lastError,
    },
  });

  return { complete, errors };
}
