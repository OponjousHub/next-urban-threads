import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";

import { prisma } from "@/utils/prisma";
import NotificationService from "@/lib/notifications/notification.service";
import { AdminNotificationService } from "@/app/lib/admin/admin-notification-service";
import orderConfirmationEmail from "@/app/lib/email/template/orderConfirmation";
import { sendEmail } from "@/app/lib/email/sendEmail";

type FinalizationResult = {
  complete: boolean;
  errors: string[];
  skipped?: boolean;
  reason?: string;
};

const LEASE_DURATION_MS = 2 * 60 * 1000;
const LEASE_RENEWAL_INTERVAL_MS = 30 * 1000;

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
  const lockToken = randomUUID();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      tenant: true,
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

  // Ensure the finalization record exists before attempting to acquire a lease.
  await prisma.paymentFinalization.upsert({
    where: { orderId: order.id },
    create: {
      orderId: order.id,
      tenantId: order.tenantId,
      status: "PENDING",
    },
    update: {},
  });

  // Acquire the lease atomically. An unexpired lease belongs to another request.
  const now = new Date();
  const leaseExpiry = new Date(now.getTime() + LEASE_DURATION_MS);

  const leaseClaim = await prisma.paymentFinalization.updateMany({
    where: {
      orderId: order.id,
      OR: [
        { lockToken: null },
        { lockedUntil: null },
        { lockedUntil: { lte: now } },
      ],
    },
    data: {
      lockToken,
      lockedUntil: leaseExpiry,
      status: "PROCESSING",
      attempts: { increment: 1 },
    },
  });

  if (leaseClaim.count !== 1) {
    return {
      complete: false,
      errors: [],
      skipped: true,
      reason: "Another request currently owns the payment-finalization lease.",
    };
  }

  let leaseLost = false;
  let renewalInProgress = false;

  const leaseTimer = setInterval(async () => {
    if (renewalInProgress || leaseLost) return;

    renewalInProgress = true;

    try {
      const renewed = await prisma.paymentFinalization.updateMany({
        where: {
          orderId: order.id,
          lockToken,
        },
        data: {
          lockedUntil: new Date(Date.now() + LEASE_DURATION_MS),
        },
      });

      if (renewed.count !== 1) {
        leaseLost = true;
      }
    } catch (error) {
      console.error(
        `[Payment finalization] Could not renew lease for order ${order.id}:`,
        error,
      );
    } finally {
      renewalInProgress = false;
    }
  }, LEASE_RENEWAL_INTERVAL_MS);

  leaseTimer.unref?.();

  async function assertLeaseOwnership() {
    if (leaseLost) {
      throw new Error(
        "Payment-finalization lease was lost; stopping further processing.",
      );
    }

    const current = await prisma.paymentFinalization.findUnique({
      where: { orderId: order?.id },
      select: {
        lockToken: true,
        lockedUntil: true,
      },
    });

    if (
      !current ||
      current.lockToken !== lockToken ||
      !current.lockedUntil ||
      current.lockedUntil.getTime() <= Date.now()
    ) {
      leaseLost = true;
      throw new Error(
        "Payment-finalization lease is no longer owned by this request.",
      );
    }
  }

  async function recordError(step: string, error: unknown) {
    const message = `${step}: ${getErrorMessage(error)}`;
    errors.push(message);

    console.error(`[Payment finalization] Order ${order?.id}: ${message}`);

    // Never let an expired lease owner overwrite another owner's state.
    if (leaseLost) return;

    await prisma.paymentFinalization.updateMany({
      where: {
        orderId: order?.id,
        lockToken,
      },
      data: {
        lastError: message,
        status: "RETRY",
      },
    });
  }

  try {
    // 1. Increment coupon usage exactly once.
    try {
      await assertLeaseOwnership();

      await prisma.$transaction(async (tx) => {
        const claim = await tx.paymentFinalization.updateMany({
          where: {
            orderId: order.id,
            lockToken,
            couponUsageProcessed: false,
          },
          data: {
            couponUsageProcessed: true,
          },
        });

        if (claim.count === 0) return;

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
      if (leaseLost) throw error;
      await recordError("Coupon usage", error);
    }

    // 2. Create the payment-confirmation tracking event once.
    try {
      await assertLeaseOwnership();

      const trackingDedupeKey = `payment-confirmed:${order.id}`;

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
        if (!isUniqueConstraintError(error)) throw error;

        // A previous or concurrent attempt already created the event.
        const existing = await prisma.orderTrackingEvent.findUnique({
          where: { dedupeKey: trackingDedupeKey },
          select: { id: true },
        });

        if (!existing) throw error;
      }

      await assertLeaseOwnership();

      await prisma.paymentFinalization.updateMany({
        where: {
          orderId: order.id,
          lockToken,
        },
        data: {
          trackingEventCreated: true,
        },
      });
    } catch (error) {
      if (leaseLost) throw error;
      await recordError("Tracking event", error);
    }

    // 3. Notify the vendor.
    try {
      await assertLeaseOwnership();

      if (order.vendorId) {
        await NotificationService.notify({
          vendorId: order.vendorId,
          setting: "paymentReceived",
          type: "PAYMENT",
          title: "Payment Received",
          message: `Payment received for order ${order.id
            .slice(-8)
            .toUpperCase()}.`,
          link: `/vendor/orders/${order.id}`,
          dedupeKey: `payment-received:${order.id}`,
          metadata: {
            orderId: order.id,
            paymentReference: order.paymentReference,
            amount: Number(order.totalAmount),
            currency: order.currency,
          },
        });
      }

      await assertLeaseOwnership();

      await prisma.paymentFinalization.updateMany({
        where: {
          orderId: order.id,
          lockToken,
        },
        data: {
          vendorNotified: true,
        },
      });
    } catch (error) {
      if (leaseLost) throw error;
      await recordError("Vendor notification", error);
    }

    // 4. Notify administrators independently, with per-admin deduplication.
    try {
      await assertLeaseOwnership();

      await AdminNotificationService.notify({
        type: "PAYMENT_RECEIVED",
        title: "Payment Received",
        message: `${order.user?.name ?? "A customer"} paid ${
          order.currency
        } ${Number(order.totalAmount).toFixed(2)} for order ${order.id
          .slice(-8)
          .toUpperCase()}.`,
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

      await assertLeaseOwnership();

      await prisma.paymentFinalization.updateMany({
        where: {
          orderId: order.id,
          lockToken,
        },
        data: {
          adminNotified: true,
        },
      });
    } catch (error) {
      if (leaseLost) throw error;
      await recordError("Admin notification", error);
    }

    // 5. Send the confirmation email using a stable provider idempotency key.
    try {
      await assertLeaseOwnership();

      if (!order.user?.email) {
        throw new Error("The customer has no email address.");
      }

      const tenant = order.tenant;

      if (!tenant) {
        throw new Error(
          `Cannot send order confirmation: tenant not found for order ${order.id}.`,
        );
      }

      const configuredBaseUrl = tenant.domain?.trim()
        ? /^https?:\/\//i.test(tenant.domain.trim())
          ? tenant.domain.trim()
          : `https://${tenant.domain.trim()}`
        : process.env.NEXT_PUBLIC_APP_URL?.trim();

      if (!configuredBaseUrl) {
        throw new Error(
          "Cannot send order confirmation: no store domain or NEXT_PUBLIC_APP_URL is configured.",
        );
      }

      let orderUrl: string;

      try {
        const baseUrl = new URL(configuredBaseUrl);

        if (baseUrl.protocol !== "https:" && baseUrl.protocol !== "http:") {
          throw new Error("Unsupported URL protocol.");
        }

        orderUrl = new URL(
          `/dashboard/orders/${encodeURIComponent(order.id)}`,
          baseUrl,
        ).toString();
      } catch {
        throw new Error(
          "Cannot send order confirmation: the store domain or application URL is invalid.",
        );
      }

      const email = orderConfirmationEmail(order, tenant, orderUrl);

      await sendEmail({
        to: order.user.email,
        subject: email.subject,
        html: email.html,
        idempotencyKey: `order-confirmation:${order.id}`,
      });

      await assertLeaseOwnership();

      await prisma.paymentFinalization.updateMany({
        where: {
          orderId: order.id,
          lockToken,
        },
        data: {
          confirmationEmailSent: true,
        },
      });
    } catch (error) {
      if (leaseLost) throw error;
      await recordError("Confirmation email", error);
    }

    await assertLeaseOwnership();

    const finalization = await prisma.paymentFinalization.findUniqueOrThrow({
      where: { orderId: order.id },
    });

    const complete =
      finalization.couponUsageProcessed &&
      finalization.trackingEventCreated &&
      finalization.vendorNotified &&
      finalization.adminNotified &&
      finalization.confirmationEmailSent;

    await prisma.paymentFinalization.updateMany({
      where: {
        orderId: order.id,
        lockToken,
      },
      data: {
        status: complete ? "COMPLETED" : "RETRY",
        processedAt: complete ? new Date() : null,
        lastError: complete
          ? null
          : errors.join(" | ") || finalization.lastError,
      },
    });

    return { complete, errors };
  } catch (error) {
    const message = getErrorMessage(error);

    if (!errors.includes(message)) {
      errors.push(message);
    }

    console.error(`[Payment finalization] Order ${order.id}: ${message}`);

    return {
      complete: false,
      errors,
      skipped: leaseLost,
      reason: leaseLost ? "Lease ownership was lost." : undefined,
    };
  } finally {
    clearInterval(leaseTimer);

    // Release only if this request still owns the lease.
    try {
      await prisma.paymentFinalization.updateMany({
        where: {
          orderId: order.id,
          lockToken,
        },
        data: {
          lockToken: null,
          lockedUntil: null,
        },
      });
    } catch (error) {
      console.error(
        `[Payment finalization] Failed to release lease for order ${order.id}:`,
        error,
      );
    }
  }
}
