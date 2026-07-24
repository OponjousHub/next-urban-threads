import { refundPayment } from "../payments/refundPayment";
import { prisma } from "@/utils/prisma";
// import { getLoggedInUserId } from "@/lib/auth";
// import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import InventoryService from "@/lib/inventory/inventory.service";

export async function createRefundRequest(refundId: string) {
  const refund = await prisma.refundRequest.findUnique({
    where: {
      id: refundId,
    },
    include: {
      // order: true,
      order: {
        include: {
          items: true,
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

  if (refund.status !== "REQUESTED") {
    return {
      error: "Refund already processed or invalid state",
    };
  }

  // STEP 1: mark as processing
  await prisma.refundRequest.update({
    where: {
      id: refundId,
    },
    data: {
      status: "PROCESSING",
      approvedAmount: refund.requestedAmount,
    },
  });

  // STEP 2: refund through payment provider
  const paymentResult = await refundPayment({
    amount: refund.requestedAmount,
    reference: refund.order.paymentReference!,
  });

  // Gateway failed
  if (!paymentResult.success) {
    await prisma.refundRequest.update({
      where: {
        id: refundId,
      },
      data: {
        status: "FAILED",
      },
    });
    throw new Error("Refund payment failed.");
  }

  if (!paymentResult.reference) {
    throw new Error("Payment gateway did not return a refund reference.");
  }

  // STEP 3: database transaction
  await prisma.$transaction(async (tx) => {
    await tx.refundTransaction.create({
      data: {
        refundRequestId: refundId,
        provider: paymentResult.provider,
        transactionRef: paymentResult.reference,
        status: "SUCCESS",
      },
    });

    await tx.refundRequest.update({
      where: {
        id: refundId,
      },
      data: {
        status: "REFUNDED",
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

    // Restore inventory
    for (const item of refund.items) {
      await InventoryService.increaseStock({
        tx,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }
  });

  return {
    success: true,
  };
}
