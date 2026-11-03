import { prisma } from "@/utils/prisma";
import InventoryService from "@/lib/inventory/inventory.service";
import NotificationService from "@/lib/notifications/notification.service";
import { AdminNotificationService } from "@/app/lib/admin/admin-notification-service";
import { createRefundTrackingEvent } from "./refund-tracking.service";

type PaystackRefundEvent = {
  event: string;
  data: {
    id: string | number;
    status: string;
    transaction_reference: string;
    refund_reference?: string | null;
    amount: number;
    currency: string;
  };
};

export async function handlePaystackRefundWebhook(event: PaystackRefundEvent) {
  const data = event.data;

  if (
    data.id === undefined ||
    data.id === null ||
    !data.transaction_reference ||
    !Number.isFinite(Number(data.amount))
  ) {
    throw new Error("Invalid Paystack refund webhook payload.");
  }

  const refundGatewayId = String(data.id);

  /*
   * Match the exact Paystack refund ID.
   *
   * Never match using only the original payment reference.
   */
  const gatewayTransaction = await prisma.refundTransaction.findFirst({
    where: {
      provider: "paystack",
      transactionRef: refundGatewayId,
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
  });

  /*
   * No matching transaction means the webhook may have
   * arrived before the API response was saved.
   *
   * Throwing allows Paystack to retry delivery.
   */
  if (!gatewayTransaction) {
    console.error("PAYSTACK REFUND WEBHOOK: UNKNOWN REFUND ID", {
      refundGatewayId,
      transactionReference: data.transaction_reference,
    });

    throw new Error(
      `No RAYNTA refund transaction found for Paystack refund ${refundGatewayId}.`,
    );
  }

  const refund = gatewayTransaction.refundRequest;

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
  if (
    String(refund.currency).toUpperCase() !==
    String(data.currency).toUpperCase()
  ) {
    console.error("PAYSTACK REFUND WEBHOOK: CURRENCY MISMATCH", {
      refundId: refund.id,
      expected: refund.currency,
      received: data.currency,
    });

    throw new Error("Paystack refund currency mismatch.");
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
     * NGN uses 100 kobo per naira.
     */
    const processedAmount = Number(data.amount) / 100;

    const approvedAmount = Number(
      refund.approvedAmount ?? refund.requestedAmount,
    );

    const shippingCost = Number(refund.order.shippingCost ?? 0);

    const itemsOnlyMatches = Math.abs(processedAmount - approvedAmount) < 0.01;

    const itemsAndShippingMatches =
      Math.abs(processedAmount - (approvedAmount + shippingCost)) < 0.01;

    if (!itemsOnlyMatches && !itemsAndShippingMatches) {
      console.error("PAYSTACK REFUND WEBHOOK: AMOUNT MISMATCH", {
        refundId: refund.id,
        refundGatewayId,
        processedAmount,
        approvedAmount,
        shippingCost,
      });

      throw new Error("Paystack refund amount mismatch.");
    }

    const shippingIncluded = !itemsOnlyMatches && itemsAndShippingMatches;
    const shippingRefunded = shippingIncluded ? shippingCost : 0;

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
        },
      });

      await tx.order.update({
        where: {
          id: refund.orderId,
        },
        data: {
          refundStatus: "REFUNDED",
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
        reference: refundGatewayId,
        refundAmount: processedAmount,
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
          currency: refund.currency,
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
        currency: refund.currency,
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
        not: "SUCCESS",
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
