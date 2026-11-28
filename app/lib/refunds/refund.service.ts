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

function toCents(value: unknown): number {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    throw new Error("Invalid monetary amount.");
  }

  return Math.round(amount * 100);
}

function fromCents(value: number): number {
  return value / 100;
}

function getRefundItemKey(productId: string, variantId?: string | null) {
  return `${productId}:${variantId ?? ""}`;
}

function calculateNetRefundAmount(
  orderItems: {
    productId: string;
    variantId: string | null;
    quantity: number;
    price: unknown;
  }[],
  selectedItems: RefundRequestInput["items"],
  discountAmount: unknown,
) {
  if (!selectedItems.length) {
    throw new Error("Select at least one item to refund.");
  }

  const orderItemMap = new Map(
    orderItems.map((item) => [
      getRefundItemKey(item.productId, item.variantId),
      item,
    ]),
  );

  const selectedKeys = new Set<string>();

  let merchandiseSubtotalCents = 0;
  let selectedGrossCents = 0;

  for (const item of orderItems) {
    merchandiseSubtotalCents += toCents(item.price) * item.quantity;
  }

  if (merchandiseSubtotalCents <= 0) {
    throw new Error("Invalid order merchandise subtotal.");
  }

  for (const selected of selectedItems) {
    if (!Number.isInteger(selected.quantity) || selected.quantity <= 0) {
      throw new Error("Invalid refund quantity.");
    }

    const key = getRefundItemKey(selected.productId, selected.variantId);

    if (selectedKeys.has(key)) {
      throw new Error("Duplicate refund items are not allowed.");
    }

    selectedKeys.add(key);

    const orderItem = orderItemMap.get(key);

    if (!orderItem) {
      throw new Error(
        "One or more selected products do not belong to this order.",
      );
    }

    if (selected.quantity > orderItem.quantity) {
      throw new Error("Refund quantity cannot exceed the quantity purchased.");
    }

    selectedGrossCents += toCents(orderItem.price) * selected.quantity;
  }

  const discountCents = toCents(discountAmount);

  if (discountCents < 0 || discountCents > merchandiseSubtotalCents) {
    throw new Error("Invalid order discount.");
  }

  const allocatedDiscountCents = Math.round(
    (selectedGrossCents * discountCents) / merchandiseSubtotalCents,
  );

  const netRefundCents = selectedGrossCents - allocatedDiscountCents;

  if (netRefundCents <= 0) {
    throw new Error("The selected items have no refundable value.");
  }

  return fromCents(netRefundCents);
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

  const requestedAmount = calculateNetRefundAmount(
    order.items,
    data.items,
    order.discountAmount,
  );

  // Create refund request + items
  const refund = await prisma.$transaction(async (tx) => {
    // Check quantities already refunded successfully.
    const previousRefunds = await tx.refundRequest.findMany({
      where: {
        orderId: order.id,
        tenantId: tenant.id,
        status: "REFUNDED",
      },
      include: {
        items: true,
      },
    });

    const refundedQuantities = new Map<string, number>();

    for (const previousRefund of previousRefunds) {
      for (const item of previousRefund.items) {
        const key = getRefundItemKey(item.productId, item.variantId);

        refundedQuantities.set(
          key,
          (refundedQuantities.get(key) ?? 0) + item.quantity,
        );
      }
    }

    for (const selected of data.items) {
      const key = getRefundItemKey(selected.productId, selected.variantId);

      const alreadyRefunded = refundedQuantities.get(key) ?? 0;

      const orderedItem = order.items.find(
        (item) =>
          item.productId === selected.productId &&
          (item.variantId ?? null) === (selected.variantId ?? null),
      );

      if (
        !orderedItem ||
        alreadyRefunded + selected.quantity > orderedItem.quantity
      ) {
        throw new Error(
          "The requested quantity includes items that have already been refunded.",
        );
      }
    }

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
          create: data.items.map((item) => {
            const orderItem = order.items.find(
              (orderedItem) =>
                orderedItem.productId === item.productId &&
                (orderedItem.variantId ?? null) === (item.variantId ?? null),
            );

            if (!orderItem) {
              throw new Error("Selected product was not found in the order.");
            }

            return {
              productId: item.productId,
              variantId: item.variantId ?? null,
              quantity: item.quantity,
              priceAtPurchase: Number(orderItem.price),
            };
          }),
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
  const orderTotal = Number(refund.order.totalAmount);
  const merchandiseSubtotal = refund.order.items.reduce(
    (sum, item) => sum + toCents(item.price) * item.quantity,
    0,
  );

  const discountCents = toCents(refund.order.discountAmount ?? 0);

  if (!Number.isFinite(approvedAmount) || approvedAmount <= 0) {
    throw new Error("Invalid approved refund amount.");
  }

  if (
    !Number.isFinite(shippingCost) ||
    shippingCost < 0 ||
    !Number.isFinite(orderTotal) ||
    orderTotal <= 0
  ) {
    throw new Error(
      "Invalid order amounts. Refund cannot be processed safely.",
    );
  }

  if (discountCents < 0 || discountCents > merchandiseSubtotal) {
    throw new Error("Invalid order discount.");
  }

  // Recalculate the requested refund using database prices.
  const calculatedItemRefund = calculateNetRefundAmount(
    refund.order.items,
    refund.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      priceAtPurchase: item.priceAtPurchase,
    })),
    refund.order.discountAmount,
  );

  if (toCents(approvedAmount) !== toCents(calculatedItemRefund)) {
    throw new Error(
      "The approved refund amount does not match the verified item refund amount.",
    );
  }

  // Retrieve previously completed refunds.
  const previousRefunds = await prisma.refundRequest.findMany({
    where: {
      orderId: refund.orderId,
      tenantId: tenant.id,
      status: "REFUNDED",
      id: { not: refund.id },
    },
    include: {
      items: true,
    },
  });

  let previouslyRefundedItemsCents = 0;
  let previouslyRefundedShippingCents = 0;

  const previouslyRefundedQuantities = new Map<string, number>();

  for (const previous of previousRefunds) {
    const processedCents = toCents(previous.processedAmount ?? 0);
    const shippingCents = toCents(previous.shippingRefunded ?? 0);

    previouslyRefundedShippingCents += shippingCents;
    previouslyRefundedItemsCents += Math.max(0, processedCents - shippingCents);

    for (const item of previous.items) {
      const key = getRefundItemKey(item.productId, item.variantId);

      previouslyRefundedQuantities.set(
        key,
        (previouslyRefundedQuantities.get(key) ?? 0) + item.quantity,
      );
    }
  }

  // Ensure previously refunded quantities are not refunded again.
  for (const item of refund.items) {
    const key = getRefundItemKey(item.productId, item.variantId);

    const alreadyRefunded = previouslyRefundedQuantities.get(key) ?? 0;

    const orderedItem = refund.order.items.find(
      (orderedItem) =>
        orderedItem.productId === item.productId &&
        (orderedItem.variantId ?? null) === (item.variantId ?? null),
    );

    if (
      !orderedItem ||
      alreadyRefunded + item.quantity > orderedItem.quantity
    ) {
      throw new Error(
        "This refund includes quantities that have already been refunded.",
      );
    }
  }

  const currentItemRefundCents = toCents(approvedAmount);
  const shippingCostCents = toCents(shippingCost);
  const orderTotalCents = toCents(orderTotal);

  const remainingMerchandiseCents =
    merchandiseSubtotal - discountCents - previouslyRefundedItemsCents;

  if (currentItemRefundCents > remainingMerchandiseCents) {
    throw new Error(
      "The approved refund exceeds the remaining refundable merchandise amount.",
    );
  }

  const includeShipping = refundOption === "ITEMS_PLUS_SHIPPING";

  if (includeShipping && previouslyRefundedShippingCents > 0) {
    throw new Error("Shipping has already been refunded for this order.");
  }

  const shippingRefundCents = includeShipping ? shippingCostCents : 0;

  const previouslyRefundedTotalCents =
    previouslyRefundedItemsCents + previouslyRefundedShippingCents;

  const refundAmountCents = currentItemRefundCents + shippingRefundCents;

  if (previouslyRefundedTotalCents + refundAmountCents > orderTotalCents) {
    throw new Error(
      "The cumulative refund cannot exceed the amount charged for the order.",
    );
  }

  const refundAmount = fromCents(refundAmountCents);

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

  // Paystack currency conversion and validation
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

    const paymentAmount = Number(refund.order.paymentAmount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      throw new Error(
        "Missing or invalid payment amount. Refund cannot be processed safely.",
      );
    }

    let exchangeRate = 1;

    if (orderCurrency !== paymentCurrency) {
      exchangeRate = Number(refund.order.exchangeRate);

      if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
        throw new Error(
          "Missing or invalid exchange rate. Refund cannot be processed safely.",
        );
      }
    }

    const paymentAmountCents = toCents(paymentAmount);

    // Convert previous refunds from order currency
    // into the payment currency.
    const previouslyRefundedPaymentCents = Math.round(
      previouslyRefundedTotalCents * exchangeRate,
    );

    const remainingPaymentCents =
      paymentAmountCents - previouslyRefundedPaymentCents;

    if (remainingPaymentCents <= 0) {
      throw new Error("The payment has already been fully refunded.");
    }

    // Determine whether this refund completes the order refund.
    const isFullRefund =
      previouslyRefundedTotalCents + refundAmountCents === orderTotalCents;

    // For a final refund, use the exact remaining gateway balance
    // to avoid rounding discrepancies.
    gatewayRefundAmount = isFullRefund
      ? fromCents(remainingPaymentCents)
      : fromCents(Math.round(refundAmountCents * exchangeRate));

    const gatewayRefundCents = toCents(gatewayRefundAmount);

    if (
      !Number.isFinite(gatewayRefundAmount) ||
      gatewayRefundCents <= 0 ||
      gatewayRefundCents > remainingPaymentCents
    ) {
      throw new Error(
        "Refund exceeds the remaining amount paid through Paystack.",
      );
    }

    console.log("REFUND CURRENCY DIAGNOSTIC:", {
      refundId: refund.id,
      orderCurrency,
      paymentCurrency,
      exchangeRate,
      paymentAmount,
      previouslyRefundedPaymentCents,
      remainingPaymentCents,
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
      shippingIncluded: includeShipping,
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

  const paystackRefundReference =
    String(refund.order.paymentProvider).toUpperCase() === "PAYSTACK"
      ? `RAYNTA_${refund.id}`
      : undefined;

  let paymentResult: RefundPaymentResult;
  try {
    paymentResult = await refundPayment({
      amount: gatewayRefundAmount,
      reference: refund.order.paymentReference!,
      refundReference: paystackRefundReference,
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
            transactionRef: paystackRefundReference ?? null,
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

  if (refund.cancellationRequestId) {
    await prisma.cancellationRequest.updateMany({
      where: {
        id: refund.cancellationRequestId,
        orderId: refund.orderId,
        status: "REFUND_IN_PROGRESS",
      },
      data: {
        status: "WITHDRAWN",
      },
    });
  }

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
