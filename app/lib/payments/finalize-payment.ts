import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";

import { prisma } from "@/utils/prisma";
import NotificationService from "@/lib/notifications/notification.service";
import { AdminNotificationService } from "@/app/lib/admin/admin-notification-service";
import orderConfirmationEmail from "@/app/lib/email/template/orderConfirmation";
import merchantPaymentReceivedEmail from "@/app/lib/email/template/merchantPaymentReceived";
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

function getStoreBaseUrl(domain: string | null | undefined): string {
  const configuredUrl = domain?.trim()
    ? /^https?:\/\//i.test(domain.trim())
      ? domain.trim()
      : `https://${domain.trim()}`
    : process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!configuredUrl) {
    throw new Error("No store domain or NEXT_PUBLIC_APP_URL is configured.");
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(configuredUrl);
  } catch {
    throw new Error("The store domain or application URL is invalid.");
  }

  if (!["https:", "http:"].includes(parsedUrl.protocol)) {
    throw new Error("The store URL must use HTTP or HTTPS.");
  }

  return parsedUrl.origin;
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

  // Ensure a finalization record exists.
  await prisma.paymentFinalization.upsert({
    where: { orderId: order.id },
    create: {
      orderId: order.id,
      tenantId: order.tenantId,
      status: "PENDING",
    },
    update: {},
  });

  // Acquire the lease atomically.
  const now = new Date();

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
      lockedUntil: new Date(now.getTime() + LEASE_DURATION_MS),
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

  async function assertLeaseOwnership(): Promise<void> {
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

  async function recordError(step: string, error: unknown): Promise<void> {
    const message = `${step}: ${getErrorMessage(error)}`;

    errors.push(message);

    console.error(`[Payment finalization] Order ${order?.id}: ${message}`);

    // Do not let a request that lost its lease overwrite another
    // request's finalization state.
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
    /*
     * STEP 1: Ensure the order status reflects its verified payment.
     *
     * Only update a still-PENDING order. Do not overwrite later
     * statuses such as SHIPPED or DELIVERED.
     */
    try {
      await assertLeaseOwnership();

      await prisma.order.updateMany({
        where: {
          id: order.id,
          paymentStatus: "PAID",
          status: "PENDING",
        },
        data: {
          status: "PROCESSING",
        },
      });
    } catch (error) {
      if (leaseLost) throw error;
      await recordError("Order status update", error);
    }

    /*
     * STEP 2: Increment coupon usage exactly once.
     */
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

    /*
     * STEP 3: Create the payment-confirmation tracking event once.
     */
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
        if (!isUniqueConstraintError(error)) {
          throw error;
        }

        // A previous attempt may already have created this event.
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

    /*
     * STEP 4: Notify the vendor.
     */
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

            // Actual amount charged to the customer
            amount: Number(order.paymentAmount ?? order.totalAmount),
            currency: order.paymentCurrency ?? order.currency,

            // Original store order amount
            originalAmount: Number(order.totalAmount),
            originalCurrency: order.currency,
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

    /*
     * STEP 5: Notify administrators.
     */
    try {
      await assertLeaseOwnership();

      await AdminNotificationService.notify({
        type: "PAYMENT_RECEIVED",
        title: "Payment Received",
        message: `${order.user?.name ?? "A customer"} paid ${
          order.paymentCurrency ?? order.currency
        } ${Number(order.paymentAmount ?? order.totalAmount).toFixed(2)} for order ${order.id
          .slice(-8)
          .toUpperCase()}.`,
        link: `/admin/orders/${order.id}`,
        dedupeKey: `payment-received:${order.id}`,
        metadata: {
          orderId: order.id,
          customerId: order.userId,
          customerName: order.user?.name ?? null,

          // Actual amount charged to the customer
          amount: Number(order.paymentAmount ?? order.totalAmount),
          currency: order.paymentCurrency ?? order.currency,

          // Original store order amount
          originalAmount: Number(order.totalAmount),
          originalCurrency: order.currency,
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

    /*
     * STEP 6: Send the merchant payment email.
     *
     * This is independent of the customer confirmation email.
     */
    try {
      await assertLeaseOwnership();

      const finalization = await prisma.paymentFinalization.findUnique({
        where: { orderId: order.id },
        select: {
          merchantPaymentEmailSent: true,
        },
      });

      if (!finalization?.merchantPaymentEmailSent) {
        const tenant = order.tenant;

        if (!tenant) {
          throw new Error(
            `Cannot send merchant payment email: tenant not found for order ${order.id}.`,
          );
        }

        const baseUrl = getStoreBaseUrl(tenant.domain);

        const orderUrl = new URL(
          `/admin/orders/${encodeURIComponent(order.id)}`,
          baseUrl,
        ).toString();

        // Notify the store email and the tenant's administrators/owners.
        const administrators = await prisma.user.findMany({
          where: {
            tenantId: order.tenantId,
            role: { in: ["ADMIN", "OWNER"] },
            isDeleted: false,
          },
          select: {
            email: true,
          },
        });

        const recipients = [
          tenant.email,
          ...administrators.map((admin) => admin.email),
        ]
          .filter(
            (email): email is string =>
              typeof email === "string" && email.trim().length > 0,
          )
          .map((email) => email.trim());

        // Deduplicate addresses without changing their original spelling.
        const recipientMap = new Map<string, string>();

        for (const recipient of recipients) {
          recipientMap.set(recipient.toLowerCase(), recipient);
        }

        const uniqueRecipients = [...recipientMap.values()];

        if (uniqueRecipients.length === 0) {
          throw new Error(
            `No merchant email recipients are configured for tenant ${tenant.id}.`,
          );
        }

        const customerEmail =
          order.user?.email || order.customerEmail || "Not provided";

        const customerName = order.user?.name || "Customer";

        const orderReference = order.id.slice(-8).toUpperCase();

        const paymentAmount = Number(order.paymentAmount ?? order.totalAmount);

        const paymentCurrency = String(order.paymentCurrency ?? order.currency);

        const originalAmount = Number(order.totalAmount);
        const originalCurrency = String(order.currency);

        const amount =
          paymentCurrency !== originalCurrency
            ? `${paymentCurrency} ${paymentAmount.toFixed(2)} (Original order total: ${originalCurrency} ${originalAmount.toFixed(2)})`
            : `${paymentCurrency} ${paymentAmount.toFixed(2)}`;

        const email = merchantPaymentReceivedEmail({
          storeName: tenant.name,
          logo: tenant.logo,
          primaryColor: tenant.primaryColor,
          orderReference,
          customerName,
          customerEmail,
          amount,
          paymentReference: order.paymentReference || order.id,
          paymentProvider: String(order.paymentProvider || "Online payment"),
          paymentDate: new Date().toLocaleString("en-NG", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: tenant.timezone || "UTC",
          }),
          orderUrl,
        });

        for (const recipient of uniqueRecipients) {
          await assertLeaseOwnership();

          await sendEmail({
            to: recipient,
            subject: email.subject,
            html: email.html,
            idempotencyKey: `merchant-payment:${order.id}:${recipient.toLowerCase()}`,
            category: "orders",
          });
        }

        await assertLeaseOwnership();

        await prisma.paymentFinalization.updateMany({
          where: {
            orderId: order.id,
            lockToken,
          },
          data: {
            merchantPaymentEmailSent: true,
          },
        });
      }
    } catch (error) {
      if (leaseLost) throw error;
      await recordError("Merchant payment email", error);
    }

    /*
     * STEP 7: Send the customer order-confirmation email independently.
     */
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

      const baseUrl = getStoreBaseUrl(tenant.domain);

      const orderUrl = new URL(
        `/dashboard/orders/${encodeURIComponent(order.id)}`,
        baseUrl,
      ).toString();

      const email = orderConfirmationEmail(order, tenant, orderUrl);

      await sendEmail({
        to: order.user.email,
        subject: email.subject,
        html: email.html,
        idempotencyKey: `order-confirmation:${order.id}`,
        category: "orders",
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

    /*
     * STEP 8: Determine whether all required finalization steps succeeded.
     */
    await assertLeaseOwnership();

    const finalization = await prisma.paymentFinalization.findUniqueOrThrow({
      where: { orderId: order.id },
    });

    const complete =
      finalization.couponUsageProcessed &&
      finalization.trackingEventCreated &&
      finalization.vendorNotified &&
      finalization.adminNotified &&
      finalization.confirmationEmailSent &&
      finalization.merchantPaymentEmailSent;

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

    return {
      complete,
      errors,
    };
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

    // Release the lease only if this request still owns it.
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
