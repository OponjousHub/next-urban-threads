import { prisma } from "@/utils/prisma";

import {
  refundPayment,
  type RefundPaymentResult,
} from "../payments/refundPayment";
import InventoryService from "@/lib/inventory/inventory.service";

import NotificationService from "@/lib/notifications/notification.service";
import { AdminNotificationService } from "@/app/lib/admin/admin-notification-service";
import { createRefundTrackingEvent } from "./refund-tracking.service";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

type RefundOption = "ITEMS_ONLY" | "ITEMS_PLUS_SHIPPING";

export type RefundRequestInput = {
  orderId: string;

  reason: string;

  description?: string;

  items: {
    productId: string;
    variantId?: string | null;

    quantity: number;

    priceAtPurchase: number;
  }[];
};

function calculateRefundAmount(items: RefundRequestInput["items"]) {
  return items.reduce(
    (sum, item) => sum + item.priceAtPurchase * item.quantity,
    0,
  );
}

export async function submitRefundRequest(data: RefundRequestInput) {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  // Fetch order
  const order = await prisma.order.findFirst({
    where: {
      id: data.orderId,
      tenantId: tenant.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: true,
      cancellationRequest: true,
    },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  // Only delivered orders can be refunded
  const isDeliveredOrder = order.status === "DELIVERED";

  const hasActiveCancellationRequest =
    ["PENDING", "PROCESSING"].includes(order.status) &&
    order.paymentStatus === "PAID" &&
    order.cancellationRequest?.status === "AWAITING_CUSTOMER";

  if (!isDeliveredOrder && !hasActiveCancellationRequest) {
    throw new Error(
      "Refunds can only be requested after delivery or through an active admin cancellation request.",
    );
  }

  // Prevent duplicate requests
  const existing = await prisma.refundRequest.findFirst({
    where: {
      orderId: order.id,
      tenantId: tenant.id,
      status: {
        in: ["REQUESTED", "PROCESSING"],
      },
    },
  });

  if (existing) {
    throw new Error("A refund request already exists for this order.");
  }

  const requestedAmount = calculateRefundAmount(data.items);

  // Create refund request + items
  const refund = await prisma.$transaction(async (tx) => {
    const cancellationRequestId = hasActiveCancellationRequest
      ? order.cancellationRequest!.id
      : null;

    // Securely claim the cancellation request before creating the refund.
    if (cancellationRequestId) {
      const claimed = await tx.cancellationRequest.updateMany({
        where: {
          id: cancellationRequestId,
          orderId: order.id,
          status: "AWAITING_CUSTOMER",
        },
        data: {
          status: "REFUND_IN_PROGRESS",
        },
      });

      if (claimed.count !== 1) {
        throw new Error(
          "This cancellation request is no longer available for a refund.",
        );
      }
    }

    const createdRefund = await tx.refundRequest.create({
      data: {
        tenantId: tenant.id,

        order: {
          connect: {
            id: order.id,
          },
        },

        user: {
          connect: {
            id: order.userId,
          },
        },

        vendorId: order.vendorId,

        ...(cancellationRequestId
          ? {
              cancellationRequest: {
                connect: {
                  id: cancellationRequestId,
                },
              },
            }
          : {}),

        status: "REQUESTED",

        reason: data.reason,
        description: data.description,

        requestedAmount,
        currency: order.currency!,
        storeMode: order.storeMode,

        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId ?? null,
            quantity: item.quantity,
            priceAtPurchase: Number(item.priceAtPurchase),
          })),
        },
      },

      include: {
        items: true,
      },
    });

    await tx.order.update({
      where: {
        id: order.id,
      },
      data: {
        refundStatus: "REQUESTED",
      },
    });

    return createdRefund;
  });

  // Timeline
  await createRefundTrackingEvent({
    tenantId: tenant.id,
    refundRequestId: refund.id,
    status: "REQUESTED",
    title: "Refund Requested",
    description:
      "Your refund request has been submitted and is awaiting review..",
  });

  // Vendor notification
  if (order.vendorId) {
    await NotificationService.notify({
      vendorId: order.vendorId,

      setting: "refundRequested",

      type: "REFUND",

      title: "Refund Requested",

      message: `${order.user.name ?? "A customer"} requested a refund for Order #${order.id.slice(-8)}.`,

      link: `/vendor/refunds/${refund.id}`,

      metadata: {
        refundId: refund.id,
        orderId: order.id,
      },
    });
  }

  // Admin notification
  await AdminNotificationService.notify({
    type: "REFUND_REQUEST",

    title: "Refund Request",

    message: `${order.user.name ?? "A customer"} requested a refund.`,

    link: `/admin/refunds`,

    metadata: {
      refundId: refund.id,
      orderId: order.id,
      customerId: order.userId,
      amount: requestedAmount,
      currency: order.currency,
    },
  });

  return refund;
}

export async function approveRefund(refundId: string) {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const refund = await prisma.refundRequest.findFirst({
    where: {
      id: refundId,
      tenantId: tenant.id,
    },
    include: {
      order: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!refund) {
    throw new Error("Refund request not found");
  }

  if (refund.status !== "REQUESTED") {
    throw new Error("Only requested refunds can be approved.");
  }

  const approvedRefund = await prisma.refundRequest.update({
    where: {
      id: refund.id,
    },
    data: {
      status: "APPROVED",
      approvedAmount: refund.requestedAmount,
    },
  });

  await prisma.order.update({
    where: {
      id: refund.orderId,
    },
    data: {
      refundStatus: "APPROVED",
    },
  });

  // ----------------------------
  // Customer Timeline
  // ----------------------------

  await createRefundTrackingEvent({
    tenantId: tenant.id,
    refundRequestId: refund.id,
    status: "APPROVED",
    title: "Refund Approved",
    description:
      "Your refund request has been approved and will be processed shortly.",
  });

  // ----------------------------
  // Vendor Notification
  // ----------------------------

  if (refund.vendorId) {
    await NotificationService.notify({
      vendorId: refund.vendorId,
      setting: "refundApproved",
      type: "REFUND",
      title: "Refund Approved",
      message: `Refund request for Order #${refund.orderId.slice(-8)} has been approved.`,
      link: `/vendor/refunds/${refund.id}`,
      metadata: {
        refundId: refund.id,
        orderId: refund.orderId,
      },
    });
  }

  // ----------------------------
  // Admin Notification
  // ----------------------------

  await AdminNotificationService.notify({
    type: "REFUND_APPROVED",
    title: "Refund Approved",
    message: `Refund request for Order #${refund.orderId.slice(-8)} has been approved.`,
    link: `/admin/refunds`,
    metadata: {
      refundId: refund.id,
      orderId: refund.orderId,
      customerId: refund.userId,
      customerName: refund.user.name,
      amount: refund.requestedAmount,
      currency: refund.currency,
    },
  });

  return approvedRefund;
}

export async function processRefund(
  refundId: string,
  refundOption: RefundOption = "ITEMS_ONLY",
) {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  /*
   * --------------------------------------------------
   * Fetch refund
   * --------------------------------------------------
   */
  const refund = await prisma.refundRequest.findFirst({
    where: {
      id: refundId,
      tenantId: tenant.id,
    },
    include: {
      order: {
        include: {
          items: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              vendorId: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!refund) {
    throw new Error("Refund not found");
  }

  /*
   * Paystack refunds previously marked FAILED must first
   * be reconciled against Paystack.
   *
   * The old implementation could mark an accepted refund
   * as FAILED when it failed to capture the refund ID.
   */
  if (
    refund.order.paymentProvider === "PAYSTACK" &&
    refund.status === "FAILED"
  ) {
    console.log("REFUND PROVIDER DIAGNOSTIC:", {
      provider: refund.order.paymentProvider,
      orderId: refund.orderId,
      refundId: refund.id,
      amount: refund,
      currency: refund.currency,
    });

    throw new Error(
      "This Paystack refund requires gateway reconciliation before another attempt.",
    );
  }

  if (refund.status === "FAILED") {
    await createRefundTrackingEvent({
      tenantId: refund.tenantId,
      refundRequestId: refund.id,
      status: "PROCESSING",
      title: "Refund Processing Retry",
      description:
        "We are retrying your refund after the previous attempt could not be completed.",
    });
  }

  /*
   * --------------------------------------------------
   * Only APPROVED refunds can be processed
   * --------------------------------------------------
   */
  if (refund.status !== "APPROVED" && refund.status !== "FAILED") {
    throw new Error(
      "Only approved or previously failed refunds can be processed.",
    );
  }

  const existingTransaction = await prisma.refundTransaction.findFirst({
    where: {
      refundRequestId: refund.id,
      status: "SUCCESS",
    },
  });

  if (existingTransaction) {
    throw new Error("This refund has already been successfully processed.");
  }

  const approvedAmount = Number(
    refund.approvedAmount ?? refund.requestedAmount,
  );

  const shippingCost = Number(refund.order.shippingCost ?? 0);

  const refundAmount =
    refundOption === "ITEMS_PLUS_SHIPPING"
      ? approvedAmount + shippingCost
      : approvedAmount;

  const orderTotal = Number(refund.order.totalAmount);

  if (!Number.isFinite(orderTotal) || orderTotal <= 0) {
    throw new Error("Invalid order total. Refund cannot be processed safely.");
  }

  if (refundAmount > orderTotal) {
    throw new Error("Refund amount cannot exceed the order total.");
  }

  if (!Number.isFinite(approvedAmount) || approvedAmount <= 0) {
    throw new Error("Invalid approved refund amount.");
  }

  if (!Number.isFinite(shippingCost) || shippingCost < 0) {
    throw new Error("Invalid shipping cost.");
  }

  if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
    throw new Error("Invalid refund amount.");
  }

  /*
   * --------------------------------------------------
   * Calculate payment gateway refund amount
   * --------------------------------------------------
   */
  let gatewayRefundAmount = refundAmount;

  if (refund.order.paymentProvider === "PAYSTACK") {
    const orderCurrency = String(refund.order.currency ?? "").toUpperCase();
    const paymentCurrency = String(
      refund.order.paymentCurrency ?? "",
    ).toUpperCase();

    if (!orderCurrency || !paymentCurrency) {
      throw new Error(
        "Missing order or payment currency. Refund cannot be processed safely.",
      );
    }

    if (orderCurrency !== paymentCurrency) {
      const paymentAmount = Number(refund.order.paymentAmount);
      const exchangeRate = Number(refund.order.exchangeRate);

      if (
        !Number.isFinite(paymentAmount) ||
        paymentAmount <= 0 ||
        !Number.isFinite(exchangeRate) ||
        exchangeRate <= 0
      ) {
        throw new Error(
          "Missing or invalid payment conversion details. Refund cannot be processed safely.",
        );
      }

      const isFullRefund =
        Math.round(refundAmount * 100) >= Math.round(orderTotal * 100);

      gatewayRefundAmount = isFullRefund
        ? paymentAmount
        : Math.round(refundAmount * exchangeRate * 100) / 100;
    }

    if (!Number.isFinite(gatewayRefundAmount) || gatewayRefundAmount <= 0) {
      throw new Error("Invalid payment gateway refund amount.");
    }

    console.log("REFUND CURRENCY DIAGNOSTIC:", {
      refundId: refund.id,
      orderCurrency,
      paymentCurrency,
      orderRefundAmount: refundAmount,
      gatewayRefundAmount,
    });
  }

  /*
   * --------------------------------------------------
   * Mark refund as PROCESSING
   * --------------------------------------------------
   */
  const claimedRefund = await prisma.refundRequest.updateMany({
    where: {
      id: refund.id,
      tenantId: tenant.id,
      status: refund.status,
    },
    data: {
      status: "PROCESSING",
    },
  });

  if (claimedRefund.count !== 1) {
    throw new Error(
      "This refund is already being processed or its status has changed. Please refresh and try again.",
    );
  }

  await prisma.order.update({
    where: {
      id: refund.orderId,
    },
    data: {
      refundStatus: "PROCESSING",
    },
  });

  /*
   * --------------------------------------------------
   * Customer refund tracking event
   * --------------------------------------------------
   */
  await createRefundTrackingEvent({
    tenantId: tenant.id,
    refundRequestId: refund.id,
    status: "PROCESSING",
    title: "Refund Processing",
    description:
      "Your refund has been approved and is now being processed by the payment provider.",
  });

  /*
   * --------------------------------------------------
   * Call payment gateway
   * --------------------------------------------------
   */
  let paymentResult: RefundPaymentResult;
  try {
    paymentResult = await refundPayment({
      amount: gatewayRefundAmount,
      reference: refund.order.paymentReference!,
      flutterwaveTransactionId: refund.order.flutterwaveTransactionId,
      provider: refund.order.paymentProvider,
    });
  } catch (error) {
    console.error("REFUND PAYMENT ERROR:", error);

    /*
     * PAYSTACK: The outcome is uncertain.
     * Never mark it FAILED or allow another submission.
     */
    if (refund.order.paymentProvider === "PAYSTACK") {
      await prisma.$transaction(async (tx) => {
        await tx.refundTransaction.create({
          data: {
            refundRequestId: refund.id,
            provider: "paystack",
            transactionRef: null,
            amount: gatewayRefundAmount,
            currency: String(refund.order.paymentCurrency).toUpperCase(),
            status: "UNKNOWN",
          },
        });

        await tx.refundRequest.update({
          where: { id: refund.id },
          data: { status: "PROCESSING" },
        });

        await tx.order.update({
          where: { id: refund.orderId },
          data: { refundStatus: "PROCESSING" },
        });
      });

      await createRefundTrackingEvent({
        tenantId: tenant.id,
        refundRequestId: refund.id,
        status: "PROCESSING",
        title: "Refund Awaiting Reconciliation",
        description:
          "We could not confirm the outcome of your refund request. Please contact support while we verify its status. Do not submit another refund request.",
        metadata: {
          provider: "paystack",
          gatewayStatus: "UNKNOWN",
        },
      });

      return {
        success: true,
        refundId: refund.id,
        orderId: refund.orderId,
        status: "PROCESSING",
        provider: "paystack",
        reference: null,
        refundAmount,
        itemRefundAmount: approvedAmount,
        shippingRefunded:
          refundOption === "ITEMS_PLUS_SHIPPING" ? shippingCost : 0,
        shippingIncluded: refundOption === "ITEMS_PLUS_SHIPPING",
      };
    }

    /*
     * Preserve existing Flutterwave failure handling.
     */
    await prisma.$transaction(async (tx) => {
      await tx.refundRequest.update({
        where: { id: refund.id },
        data: { status: "FAILED" },
      });

      await tx.order.update({
        where: { id: refund.orderId },
        data: { refundStatus: "FAILED" },
      });
    });

    await createRefundTrackingEvent({
      tenantId: tenant.id,
      refundRequestId: refund.id,
      status: "FAILED",
      title: "Refund Failed",
      description:
        "The payment provider could not process the refund. Please contact support if the problem persists.",
    });

    throw new Error("Refund payment failed.");
  }

  /*
   * --------------------------------------------------
   * Gateway explicitly reported failure
   * --------------------------------------------------
   */

  /*
   * --------------------------------------------------
   * PAYSTACK: ACCEPTED OR UNCERTAIN REFUND
   * --------------------------------------------------
   *
   * Paystack processes refunds asynchronously.
   * An accepted request is NOT a completed refund.
   *
   * Network errors and missing references are also
   * uncertain outcomes, not confirmed failures.
   */

  if (
    paymentResult.provider === "paystack" &&
    (paymentResult.success || paymentResult.uncertain)
  ) {
    const refundStatus =
      paymentResult.uncertain || !paymentResult.reference
        ? "UNKNOWN"
        : String(paymentResult.status ?? "pending").toUpperCase();

    await prisma.$transaction(async (tx) => {
      await tx.refundTransaction.create({
        data: {
          refundRequestId: refund.id,
          provider: "paystack",
          transactionRef: paymentResult.reference ?? null,
          amount: gatewayRefundAmount,
          currency: String(refund.order.paymentCurrency).toUpperCase(),
          status: refundStatus,
        },
      });

      await tx.refundRequest.update({
        where: { id: refund.id },
        data: {
          status: "PROCESSING",
        },
      });

      await tx.order.update({
        where: { id: refund.orderId },
        data: {
          refundStatus: "PROCESSING",
        },
      });
    });

    await createRefundTrackingEvent({
      tenantId: tenant.id,
      refundRequestId: refund.id,
      status: "PROCESSING",
      title: "Refund Submitted",
      description: paymentResult.uncertain
        ? "The refund request outcome is being verified with the payment provider. Please do not submit another refund."
        : "Paystack has accepted the refund request. The refund is awaiting gateway confirmation.",
      metadata: {
        provider: "paystack",
        reference: paymentResult.reference ?? null,
        gatewayStatus: refundStatus,
      },
    });

    return {
      success: true,
      refundId: refund.id,
      orderId: refund.orderId,
      status: "PROCESSING",
      provider: "paystack",
      reference: paymentResult.reference ?? null,
      refundAmount,
      itemRefundAmount: approvedAmount,
      shippingRefunded:
        refundOption === "ITEMS_PLUS_SHIPPING" ? shippingCost : 0,
      shippingIncluded: refundOption === "ITEMS_PLUS_SHIPPING",
    };
  }

  if (!paymentResult.success) {
    await prisma.$transaction(async (tx) => {
      await tx.refundRequest.update({
        where: {
          id: refund.id,
        },
        data: {
          status: "FAILED",
        },
      });

      await tx.order.update({
        where: {
          id: refund.orderId,
        },
        data: {
          refundStatus: "FAILED",
        },
      });
    });

    await createRefundTrackingEvent({
      tenantId: tenant.id,
      refundRequestId: refund.id,
      status: "FAILED",
      title: "Refund Failed",
      description: "The payment provider could not complete the refund.",
      metadata: {
        provider: paymentResult.provider,
      },
    });

    throw new Error("Refund payment failed.");
  }

  /*
   * --------------------------------------------------
   * Successful gateway response must contain
   * a refund reference.
   * --------------------------------------------------
   */
  if (!paymentResult.reference) {
    console.error(
      "Refund gateway returned success without a reference:",
      paymentResult,
    );

    await prisma.$transaction(async (tx) => {
      await tx.refundRequest.update({
        where: {
          id: refund.id,
        },
        data: {
          status: "FAILED",
        },
      });

      await tx.order.update({
        where: {
          id: refund.orderId,
        },
        data: {
          refundStatus: "FAILED",
        },
      });
    });

    await createRefundTrackingEvent({
      tenantId: tenant.id,
      refundRequestId: refund.id,
      status: "FAILED",
      title: "Refund Failed",
      description:
        "The payment provider confirmed the request but did not return a refund reference.",
      metadata: {
        provider: paymentResult.provider,
      },
    });

    throw new Error("Gateway returned no refund reference.");
  }

  /*
   * --------------------------------------------------
   * Successful refund
   * --------------------------------------------------
   */
  await prisma.$transaction(async (tx) => {
    /*
     * Record gateway transaction
     */
    await tx.refundTransaction.create({
      data: {
        refundRequestId: refund.id,
        provider: paymentResult.provider,
        transactionRef: paymentResult.reference,
        amount:
          paymentResult.provider === "paystack"
            ? gatewayRefundAmount
            : refundAmount,
        currency:
          paymentResult.provider === "paystack"
            ? String(
                refund.order.paymentCurrency ?? refund.currency,
              ).toUpperCase()
            : refund.currency,
        status: "SUCCESS",
      },
    });

    /*
     * Mark refund as completed
     */
    await tx.refundRequest.update({
      where: {
        id: refund.id,
      },
      data: {
        status: "REFUNDED",

        // Refund amount recorded in the original order currency
        processedAmount: refundAmount,

        // Shipping portion actually refunded
        shippingRefunded:
          refundOption === "ITEMS_PLUS_SHIPPING" ? shippingCost : 0,

        // Whether shipping was included in this refund
        shippingIncluded: refundOption === "ITEMS_PLUS_SHIPPING",
      },
    });

    /*
     * Update order refund status
     */
    if (refund.cancellationRequestId) {
      const cancellationCompleted = await tx.cancellationRequest.updateMany({
        where: {
          id: refund.cancellationRequestId,
          orderId: refund.orderId,
          status: "REFUND_IN_PROGRESS",
        },
        data: {
          status: "COMPLETED",
        },
      });

      if (cancellationCompleted.count !== 1) {
        throw new Error("Unable to complete the linked cancellation request.");
      }
    }

    await tx.order.update({
      where: {
        id: refund.orderId,
      },
      data: {
        refundStatus: "REFUNDED",
        ...(refund.cancellationRequestId ? { status: "CANCELLED" } : {}),
      },
    });

    /*
     * Restore inventory
     */
    for (const item of refund.items) {
      await InventoryService.increaseStock({
        tx,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }
  });

  /*
   * --------------------------------------------------
   * Customer refund tracking event
   * --------------------------------------------------
   *
   * This is intentionally AFTER the transaction because
   * createRefundTrackingEvent() currently uses prisma
   * rather than the transaction client.
   */
  await createRefundTrackingEvent({
    tenantId: tenant.id,
    refundRequestId: refund.id,
    status: "REFUNDED",
    title: "Refund Completed",
    description:
      "Your refund has been processed successfully. Funds should appear shortly depending on your payment provider.",
    metadata: {
      provider: paymentResult.provider,
      reference: paymentResult.reference,
      refundOption,
      refundAmount,
      refundCurrency: String(
        refund.order.currency ?? refund.currency,
      ).toUpperCase(),
      gatewayRefundAmount:
        paymentResult.provider === "paystack"
          ? gatewayRefundAmount
          : refundAmount,
      gatewayCurrency:
        paymentResult.provider === "paystack"
          ? String(
              refund.order.paymentCurrency ?? refund.currency,
            ).toUpperCase()
          : refund.currency,
      shippingIncluded: refundOption === "ITEMS_PLUS_SHIPPING",
      shippingAmount: shippingCost,
    },
  });

  /*
   * --------------------------------------------------
   * Vendor Notification
   * --------------------------------------------------
   */
  if (refund.vendorId) {
    await NotificationService.notify({
      vendorId: refund.vendorId,
      setting: "refundCompleted",
      type: "REFUND",
      title: "Refund Completed",
      message: `Refund completed for Order #${refund.orderId.slice(-8)}.`,
      link: `/vendor/refunds/${refund.id}`,
      metadata: {
        refundId: refund.id,
        orderId: refund.orderId,
        amount: refundAmount,
        currency: refund.currency,
      },
    });
  }

  /*
   * --------------------------------------------------
   * Admin Notification
   * --------------------------------------------------
   */
  await AdminNotificationService.notify({
    type: "REFUNDED",
    title: "Refund Completed",
    message: `Refund completed for Order #${refund.orderId.slice(-8)}.`,
    link: `/admin/refunds`,
    metadata: {
      refundId: refund.id,
      orderId: refund.orderId,
      customerId: refund.userId,
      customerName: refund.user.name,
      amount: refundAmount,
      currency: refund.currency,
    },
  });

  /*
   * --------------------------------------------------
   * Return
   * --------------------------------------------------
   */

  return {
    success: true,
    refundId: refund.id,
    orderId: refund.orderId,
    status: "REFUNDED",
    provider: paymentResult.provider,
    reference: paymentResult.reference,

    // Actual refund breakdown
    refundAmount,
    itemRefundAmount: approvedAmount,
    shippingRefunded: refundOption === "ITEMS_PLUS_SHIPPING" ? shippingCost : 0,
    shippingIncluded: refundOption === "ITEMS_PLUS_SHIPPING",
  };
}

export async function rejectRefund(refundId: string, reason: string) {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const trimmedReason = reason.trim();

  if (!trimmedReason) {
    throw new Error("A reason is required when rejecting a refund.");
  }

  const refund = await prisma.refundRequest.findFirst({
    where: {
      id: refundId,
      tenantId: tenant.id,
    },
    include: {
      order: true,
    },
  });

  if (!refund) {
    throw new Error("Refund not found");
  }

  if (refund.status !== "REQUESTED") {
    throw new Error("Only pending refund requests can be rejected.");
  }

  const rejectedRefund = await prisma.refundRequest.update({
    where: {
      id: refund.id,
    },
    data: {
      status: "REJECTED",
      rejectionReason: trimmedReason,
      rejectedAt: new Date(),
    },
  });

  await prisma.order.update({
    where: {
      id: refund.orderId,
    },
    data: {
      refundStatus: "REJECTED",
    },
  });

  // ---------------------------------------------------------
  // Customer tracking timeline
  // ---------------------------------------------------------

  await createRefundTrackingEvent({
    tenantId: refund.tenantId,
    refundRequestId: refund.id,
    status: "REFUND_REJECTED",
    title: "Refund Request Rejected",
    description: trimmedReason,
  });

  // ---------------------------------------------------------
  // Vendor notification
  // ---------------------------------------------------------

  if (refund.vendorId) {
    await NotificationService.notify({
      vendorId: refund.vendorId,
      setting: "refundProcessed",
      type: "REFUND",
      title: "Refund Rejected",
      message: `Refund request for Order #${refund.orderId.slice(-8)} was rejected.`,
      link: `/vendor/orders/${refund.orderId}`,
      metadata: {
        refundId: refund.id,
      },
    });
  }

  // ---------------------------------------------------------
  // Admin notification
  // ---------------------------------------------------------

  await AdminNotificationService.notify({
    type: "REFUND_REJECTED",
    title: "Refund Rejected",
    message: `Refund request for Order #${refund.orderId.slice(-8)} has been rejected.`,
    link: `/admin/refunds`,
    metadata: {
      refundId: refund.id,
      orderId: refund.orderId,
    },
  });

  return {
    success: true,
    refund: rejectedRefund,
  };
}

export async function cancelRefund(refundId: string, userId: string) {
  const refund = await prisma.refundRequest.findFirst({
    where: {
      id: refundId,
      userId,
    },
  });

  if (!refund) {
    throw new Error("Refund not found");
  }

  if (refund.status !== "REQUESTED") {
    throw new Error("Refund can no longer be cancelled.");
  }

  await prisma.refundRequest.update({
    where: {
      id: refundId,
    },
    data: {
      status: "CANCELLED",
    },
  });

  await prisma.order.update({
    where: {
      id: refund.orderId,
    },
    data: {
      refundStatus: "CANCELLED",
    },
  });

  await createRefundTrackingEvent({
    tenantId: refund.tenantId,
    refundRequestId: refund.id,
    status: "REFUND_CANCELLED",
    title: "Refund Cancelled",
    description:
      "Customer cancelled the refund request before it was reviewed.",
  });

  if (refund.vendorId) {
    await NotificationService.notify({
      vendorId: refund.vendorId,
      setting: "refundProcessed",
      type: "REFUND",
      title: "Refund Cancelled",
      message: `Customer cancelled refund request for Order #${refund.orderId.slice(-8)}.`,
      link: `/vendor/orders/${refund.orderId}`,
      metadata: {
        refundId,
      },
    });
  }

  await AdminNotificationService.notify({
    type: "REFUND_CANCELLED",
    title: "Refund Cancelled",
    message: `Customer cancelled refund request for Order #${refund.orderId.slice(-8)}.`,
    link: `/admin/refunds`,
    metadata: {
      refundId,
    },
  });

  return {
    success: true,
  };
}
