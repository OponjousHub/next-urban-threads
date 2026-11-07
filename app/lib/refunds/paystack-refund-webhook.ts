import { prisma } from "@/utils/prisma";
import InventoryService from "@/lib/inventory/inventory.service";
import NotificationService from "@/lib/notifications/notification.service";
import { AdminNotificationService } from "@/app/lib/admin/admin-notification-service";
import { createRefundTrackingEvent } from "./refund-tracking.service";

type PaystackRefundEvent = {
  event: string;
  data: {
    id?: string | number | null;
    status: string;
    transaction_reference: string;
    refund_reference?: string | null;
    amount: number | string;
    currency: string;
  };
};

export async function handlePaystackRefundWebhook(event: PaystackRefundEvent) {
  const data = event.data;

  if (!data.transaction_reference || !Number.isFinite(Number(data.amount))) {
    throw new Error("Invalid Paystack refund webhook payload.");
  }

  const refundReference =
    data.refund_reference != null ? String(data.refund_reference) : null;

  const refundGatewayId = data.id != null ? String(data.id) : null;

  /*
   * Match the RAYNTA refund reference first.
   * Fall back to the numeric Paystack refund ID
   * for older refund records.
   */
  const lookupReferences = [refundReference, refundGatewayId].filter(
    (value): value is string => Boolean(value),
  );

  let gatewayTransaction = lookupReferences.length
    ? await prisma.refundTransaction.findFirst({
        where: {
          provider: "paystack",
          transactionRef: {
            in: lookupReferences,
          },
        },
        include: {
          refundRequest: {
            include: {
              order: true,
              user: true,
              items: true,
            },
          },
        },
      })
    : null;

  /*
   * Paystack may send pending events before
   * refund_reference becomes available.
   *
   * Ignore these non-terminal events. The final
   * processed/failed event must identify the refund.
   */
  if (!gatewayTransaction && !lookupReferences.length) {
    const status = String(data.status).toLowerCase();

    if (status === "pending" || status === "processing") {
      console.warn(
        "PAYSTACK REFUND WEBHOOK: Reference not yet available for non-terminal event.",
        {
          event: event.event,
          transactionReference: data.transaction_reference,
        },
      );

      return;
    }
  }

  /*
   * An unidentified terminal event must be retried
   * rather than silently marking a refund complete.
   */
  if (!gatewayTransaction) {
    console.error("PAYSTACK REFUND WEBHOOK: UNKNOWN REFUND", {
      refundReference,
      refundGatewayId,
      transactionReference: data.transaction_reference,
    });

    throw new Error(
      `No RAYNTA refund transaction found for Paystack refund reference ${refundReference ?? refundGatewayId ?? "unavailable"}.`,
    );
  }

  const refund = gatewayTransaction.refundRequest;

  const matchedRefundReference =
    gatewayTransaction.transactionRef ?? refundReference ?? refundGatewayId;

  /*
   * Verify the original payment reference.
   */
  if (
    refund.order.paymentReference !== data.transaction_reference &&
    refund.order.paymentTxRef !== data.transaction_reference
  ) {
    console.error("PAYSTACK REFUND WEBHOOK: PAYMENT REFERENCE MISMATCH", {
      refundId: refund.id,
      refundGatewayId,
    });

    throw new Error("Paystack refund payment reference mismatch.");
  }

  /*
   * Verify currency.
   */
  /*
   * Verify payment currency, not original order currency.
   */
  const orderCurrency = String(
    refund.order.currency ?? refund.currency,
  ).toUpperCase();

  const paymentCurrency = String(
    refund.order.paymentCurrency ??
      gatewayTransaction.currency ??
      refund.currency,
  ).toUpperCase();

  if (String(data.currency).toUpperCase() !== paymentCurrency) {
    console.error("PAYSTACK REFUND WEBHOOK: CURRENCY MISMATCH", {
      refundId: refund.id,
      expected: paymentCurrency,
      received: data.currency,
    });

    throw new Error("Paystack refund currency mismatch.");
  }

  if (
    gatewayTransaction.currency &&
    String(gatewayTransaction.currency).toUpperCase() !== paymentCurrency
  ) {
    throw new Error(
      "Stored refund transaction currency does not match the order payment currency.",
    );
  }

  const gatewayStatus = String(data.status).toLowerCase();

  const transactionStatus = gatewayStatus.toUpperCase();

  /*
   * --------------------------------------------------
   * REFUND PROCESSED
   * --------------------------------------------------
   */
  if (gatewayStatus === "processed") {
    /*
     * Paystack reports amounts in minor currency units.
     */
    const processedGatewayAmount = Number(data.amount) / 100;
    const processedGatewayAmountMinor = Math.round(
      processedGatewayAmount * 100,
    );

    const approvedAmount = Number(
      refund.approvedAmount ?? refund.requestedAmount,
    );

    const shippingCost = Number(refund.order.shippingCost ?? 0);
    const orderTotal = Number(refund.order.totalAmount);

    const paymentAmount = Number(refund.order.paymentAmount);
    const exchangeRate = Number(refund.order.exchangeRate);

    if (
      !Number.isFinite(processedGatewayAmount) ||
      processedGatewayAmount <= 0 ||
      !Number.isFinite(approvedAmount) ||
      approvedAmount <= 0 ||
      !Number.isFinite(shippingCost) ||
      shippingCost < 0
    ) {
      throw new Error("Invalid Paystack refund amount data.");
    }

    /*
     * Convert order-currency amounts into gateway minor units.
     * Full cross-currency refunds use the exact recorded
     * payment amount instead of recalculating the conversion.
     */
    const toGatewayMinorUnits = (amount: number): number => {
      const isFullOrderRefund =
        Math.round(amount * 100) >= Math.round(orderTotal * 100);

      if (orderCurrency !== paymentCurrency && isFullOrderRefund) {
        if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
          throw new Error(
            "Missing payment amount for full Paystack refund reconciliation.",
          );
        }

        return Math.round(paymentAmount * 100);
      }

      if (orderCurrency === paymentCurrency) {
        return Math.round(amount * 100);
      }

      if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
        throw new Error(
          "Missing exchange rate for Paystack refund reconciliation.",
        );
      }

      return Math.round(amount * exchangeRate * 100);
    };

    const expectedItemsOnlyMinor = toGatewayMinorUnits(approvedAmount);

    const expectedItemsAndShippingMinor = toGatewayMinorUnits(
      approvedAmount + shippingCost,
    );

    /*
     * Compare against the exact gateway amount saved when
     * the refund was submitted.
     */
    const recordedGatewayAmountMinor =
      gatewayTransaction.amount !== null
        ? Math.round(Number(gatewayTransaction.amount) * 100)
        : null;

    if (recordedGatewayAmountMinor !== null) {
      if (processedGatewayAmountMinor !== recordedGatewayAmountMinor) {
        console.error("PAYSTACK REFUND WEBHOOK: AMOUNT MISMATCH", {
          refundId: refund.id,
          refundGatewayId,
          processedGatewayAmount,
          expectedGatewayAmount: recordedGatewayAmountMinor / 100,
          paymentCurrency,
        });

        throw new Error("Paystack refund amount mismatch.");
      }
    } else if (
      processedGatewayAmountMinor !== expectedItemsOnlyMinor &&
      processedGatewayAmountMinor !== expectedItemsAndShippingMinor
    ) {
      throw new Error(
        "Paystack refund does not match the approved order-currency amount.",
      );
    }

    const itemsOnlyMatches =
      processedGatewayAmountMinor === expectedItemsOnlyMinor;

    const itemsAndShippingMatches =
      processedGatewayAmountMinor === expectedItemsAndShippingMinor;

    if (!itemsOnlyMatches && !itemsAndShippingMatches) {
      throw new Error(
        "Paystack refund does not match the approved order-currency amount.",
      );
    }

    const shippingIncluded = !itemsOnlyMatches && itemsAndShippingMatches;

    const shippingRefunded = shippingIncluded ? shippingCost : 0;

    /*
     * Keep processedAmount in the original order currency.
     * The gateway amount is stored separately in RefundTransaction.
     */
    const processedAmount = shippingIncluded
      ? approvedAmount + shippingCost
      : approvedAmount;

    /*
     * Atomic completion.
     *
     * Only the first processed webhook can change the
     * refund from PROCESSING to REFUNDED.
     */
    const completed = await prisma.$transaction(async (tx) => {
      const result = await tx.refundRequest.updateMany({
        where: {
          id: refund.id,
          status: {
            in: ["PROCESSING", "FAILED"],
          },
        },
        data: {
          status: "REFUNDED",
          processedAmount,
          shippingRefunded,
          shippingIncluded,
        },
      });

      if (result.count !== 1) {
        return false;
      }

      await tx.refundTransaction.update({
        where: {
          id: gatewayTransaction.id,
        },
        data: {
          status: "SUCCESS",
          amount: processedGatewayAmount,
          currency: paymentCurrency,
        },
      });

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
          throw new Error(
            "Unable to complete the linked cancellation request.",
          );
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
       * Restore inventory exactly once.
       */
      for (const item of refund.items) {
        await InventoryService.increaseStock({
          tx,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        });
      }

      return true;
    });

    if (!completed) {
      console.log("PAYSTACK REFUND: Already completed or status changed.", {
        refundId: refund.id,
        refundGatewayId,
      });

      return { success: true, duplicate: true };
    }

    /*
     * Customer tracking.
     */
    await createRefundTrackingEvent({
      tenantId: refund.tenantId,
      refundRequestId: refund.id,
      status: "REFUNDED",
      title: "Refund Completed",
      description:
        "Your refund has been processed successfully. Funds should appear shortly depending on your payment provider.",
      metadata: {
        provider: "paystack",
        reference: matchedRefundReference,
        refundAmount: processedAmount,
        refundCurrency: orderCurrency,
        gatewayRefundAmount: processedGatewayAmount,
        gatewayCurrency: paymentCurrency,
        shippingIncluded,
        shippingAmount: shippingRefunded,
      },
    });

    /*
     * Vendor notification.
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
          amount: processedAmount,
          currency: orderCurrency,
        },
      });
    }

    /*
     * Admin notification.
     */
    await AdminNotificationService.notify({
      type: "REFUNDED",
      title: "Refund Completed",
      message: `Refund completed for Order #${refund.orderId.slice(-8)}.`,
      link: "/admin/refunds",
      metadata: {
        refundId: refund.id,
        orderId: refund.orderId,
        customerId: refund.userId,
        customerName: refund.user.name,
        amount: processedAmount,
        currency: orderCurrency,
      },
    });

    return {
      success: true,
      duplicate: false,
      status: "REFUNDED",
    };
  }

  /*
   * --------------------------------------------------
   * REFUND FAILED
   * --------------------------------------------------
   */
  if (gatewayStatus === "failed") {
    const failed = await prisma.$transaction(async (tx) => {
      const result = await tx.refundRequest.updateMany({
        where: {
          id: refund.id,
          status: "PROCESSING",
        },
        data: {
          status: "FAILED",
        },
      });

      if (result.count !== 1) {
        return false;
      }

      await tx.refundTransaction.update({
        where: {
          id: gatewayTransaction.id,
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

      return true;
    });

    if (failed) {
      await createRefundTrackingEvent({
        tenantId: refund.tenantId,
        refundRequestId: refund.id,
        status: "FAILED",
        title: "Refund Failed",
        description:
          "Paystack has reported that the refund could not be processed. Please contact support if you need assistance.",
        metadata: {
          provider: "paystack",
          reference: refundGatewayId,
        },
      });
    }

    return { success: true, status: failed ? "FAILED" : "UNCHANGED" };
  }

  /*
   * --------------------------------------------------
   * PENDING / PROCESSING / NEEDS ATTENTION
   * --------------------------------------------------
   */
  const knownStatuses = ["pending", "processing", "needs-attention"];

  if (!knownStatuses.includes(gatewayStatus)) {
    console.warn("PAYSTACK REFUND: UNRECOGNIZED STATUS", {
      refundGatewayId,
      gatewayStatus,
    });

    return { success: true, status: "UNRECOGNIZED" };
  }

  const updated = await prisma.refundTransaction.updateMany({
    where: {
      id: gatewayTransaction.id,
      status: {
        notIn: ["SUCCESS", "FAILED"],
      },
    },
    data: {
      status: transactionStatus,
    },
  });

  if (updated.count > 0) {
    await createRefundTrackingEvent({
      tenantId: refund.tenantId,
      refundRequestId: refund.id,
      status: "PROCESSING",
      title:
        gatewayStatus === "needs-attention"
          ? "Refund Requires Attention"
          : "Refund Processing",
      description:
        gatewayStatus === "needs-attention"
          ? "Paystack requires additional attention before this refund can be completed."
          : "Your refund is being processed by Paystack.",
      metadata: {
        provider: "paystack",
        reference: refundGatewayId,
        gatewayStatus,
      },
    });
  }

  return {
    success: true,
    status: transactionStatus,
  };
}
